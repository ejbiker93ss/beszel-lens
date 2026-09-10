import type { SystemRecord } from "./beszel"

export type RiskTone = "normal" | "warning" | "critical"

export interface RiskAssessment {
  score: number
  tone: RiskTone
  label: string
  detail: string
  value: string
}

interface Candidate extends RiskAssessment {
  rawValue: number
}

const toneRank: Record<RiskTone, number> = { normal: 0, warning: 1, critical: 2 }

function percentRisk(rawValue: number, warning: number, critical: number, weight = 1) {
  const amount = Math.max(0, Math.min(100, rawValue))
  let score = (amount / warning) * 25
  if (amount >= critical) score = 80 + ((amount - critical) / Math.max(1, 100 - critical)) * 20
  else if (amount >= warning) score = 45 + ((amount - warning) / (critical - warning)) * 30
  return Math.min(100, score * weight)
}

function toneFor(value: number, warning: number, critical: number): RiskTone {
  if (value >= critical) return "critical"
  if (value >= warning) return "warning"
  return "normal"
}

function metric(label: string, detail: string, rawValue: number, warning: number, critical: number, weight = 1): Candidate {
  const amount = Math.round(rawValue)
  return {
    score: percentRisk(amount, warning, critical, weight),
    tone: toneFor(amount, warning, critical),
    label,
    detail,
    value: `${amount}%`,
    rawValue: amount,
  }
}

function diskLabel(name: string) {
  const clean = name.trim().replaceAll("_", " ")
  if (/^[a-z]:[\\/]?$/i.test(clean)) return `${clean.slice(0, 2).toUpperCase()} drive full`
  return `${clean || "Primary disk"} full`
}

function diskName(name: string) {
  const clean = name.trim().replaceAll("_", " ")
  return /^[a-z]:[\\/]?$/i.test(clean) ? `${clean.slice(0, 2).toUpperCase()} drive` : clean || "Primary disk"
}

export function assessSystem(system: SystemRecord): RiskAssessment {
  if (system.status === "down") return { score: 130, tone: "critical", label: "Offline", detail: "No live telemetry", value: "DOWN" }
  if (system.status === "pending") return { score: 115, tone: "warning", label: "Pending", detail: "Waiting for first reading", value: "WAIT" }
  if (system.status === "paused") return { score: 105, tone: "warning", label: "Paused", detail: "Monitoring is paused", value: "PAUSE" }

  const info = system.info
  const candidates: Candidate[] = [
    metric("CPU pressure", "CPU utilization", info.cpu ?? 0, 75, 90, 0.92),
    metric("Memory pressure", "Memory utilization", info.mp ?? 0, 75, 90, 1.04),
    metric(diskLabel(info.rdn || "Primary disk"), `${diskName(info.rdn || "Primary disk")} usage`, info.dp ?? 0, 80, 90, 1.12),
  ]

  for (const [name, amount] of Object.entries(info.efs ?? {})) {
    candidates.push(metric(diskLabel(name), `${diskName(name)} usage`, amount, 80, 90, 1.12))
  }

  if ((info.sv?.[1] ?? 0) > 0) {
    const failed = info.sv?.[1] ?? 0
    candidates.push({
      score: 120 + Math.min(failed, 9),
      tone: "critical",
      label: failed === 1 ? "Service failing" : "Services failing",
      detail: `${failed} failed of ${info.sv?.[0] ?? failed}`,
      value: String(failed),
      rawValue: failed,
    })
  }

  if ((info.la?.[0] ?? 0) > 0 && (info.t ?? 0) > 0) {
    const normalizedLoad = ((info.la?.[0] ?? 0) / Math.max(1, info.t ?? 1)) * 100
    candidates.push(metric("System load high", "1-minute load per thread", normalizedLoad, 80, 100, 0.9))
  }

  candidates.sort((a, b) => toneRank[b.tone] - toneRank[a.tone] || b.score - a.score || b.rawValue - a.rawValue || a.label.localeCompare(b.label))
  const dominant = candidates[0]
  const elevated = candidates.filter((candidate) => candidate.tone !== "normal").length
  return {
    ...dominant,
    score: dominant.score + Math.min(12, Math.max(0, elevated - 1) * 4),
    label: dominant.tone === "normal" ? dominant.detail.replace(/ (utilization|usage)$/, "") : dominant.label,
    detail: dominant.tone === "normal" ? "Highest current reading" : dominant.detail,
  }
}

export function rankSystems(systems: SystemRecord[]) {
  return [...systems].sort((left, right) => {
    const leftRisk = assessSystem(left)
    const rightRisk = assessSystem(right)
    return toneRank[rightRisk.tone] - toneRank[leftRisk.tone]
      || rightRisk.score - leftRisk.score
      || left.name.localeCompare(right.name)
      || left.id.localeCompare(right.id)
  })
}
