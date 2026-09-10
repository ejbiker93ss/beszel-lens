import PocketBase, { type RecordSubscription } from "pocketbase"

export type SystemStatus = "up" | "down" | "paused" | "pending"

export interface SystemInfo {
  cpu?: number
  mp?: number
  dp?: number
  u?: number
  b?: number
  bb?: number
  dt?: number
  g?: number
  c?: number
  t?: number
  m?: string
  o?: string
  os?: number
  efs?: Record<string, number>
  rdn?: string
  la?: [number, number, number]
  sv?: [number, number]
}

export interface SystemRecord {
  id: string
  name: string
  status: SystemStatus
  info: SystemInfo
  updated: string
}

export interface StatsPoint {
  created: string
  stats: {
    cpu?: number
    cpub?: number[]
    cpus?: number[]
    la?: [number, number, number]
    mp?: number
    mu?: number
    m?: number
    mb?: number
    mz?: number
    s?: number
    su?: number
    dp?: number
    d?: number
    du?: number
    dr?: number
    dw?: number
    dio?: [number, number]
    b?: [number, number]
    ns?: number
    nr?: number
    t?: Record<string, number>
    efs?: Record<string, ExtraFilesystemStats>
    g?: Record<string, GpuStats>
    f?: Record<string, number>
    bat?: [number, number]
    bats?: Record<string, number>
  }
}

export interface ExtraFilesystemStats {
  d?: number
  du?: number
  r?: number
  w?: number
  rb?: number
  wb?: number
}

export interface GpuStats {
  n?: string
  u?: number
  mu?: number
  mt?: number
  p?: number
  pp?: number
  e?: Record<string, number>
}

export type TimeRange = "1m" | "1h" | "12h" | "24h" | "7d" | "30d"

export const timeRanges: Array<{ value: TimeRange; label: string }> = [
  { value: "1m", label: "1 minute" },
  { value: "1h", label: "1 hour" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "1 week" },
  { value: "30d", label: "30 days" },
]

const ranges: Record<TimeRange, { hours: number; type: string }> = {
  "1m": { hours: 1 / 60, type: "1m" },
  "1h": { hours: 1, type: "1m" },
  "12h": { hours: 12, type: "10m" },
  "24h": { hours: 24, type: "20m" },
  "7d": { hours: 24 * 7, type: "120m" },
  "30d": { hours: 24 * 30, type: "480m" },
}

const hubKey = "beszel-lens-hub"

export function normalizeHubUrl(value: string) {
  return value.trim().replace(/\/+$/, "")
}

export function storedHubUrl() {
  return localStorage.getItem(hubKey) ?? ""
}

export function createClient(hubUrl: string) {
  return new PocketBase(normalizeHubUrl(hubUrl))
}

export async function signIn(client: PocketBase, email: string, password: string) {
  await client.collection("users").authWithPassword(email.trim(), password)
  localStorage.setItem(hubKey, client.baseURL)
}

export async function restoreSession(client: PocketBase) {
  if (!client.authStore.isValid) return false
  try {
    await client.collection("users").authRefresh()
    return true
  } catch {
    client.authStore.clear()
    return false
  }
}

export function signOut(client: PocketBase) {
  client.authStore.clear()
}

export async function listSystems(client: PocketBase) {
  return client.collection("systems").getFullList<SystemRecord>({
    sort: "name",
    fields: "id,name,status,info,updated",
  })
}

export async function listStats(client: PocketBase, systemId: string, range: TimeRange) {
  const config = ranges[range]
  const since = new Date(Date.now() - config.hours * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")

  return client.collection("system_stats").getFullList<StatsPoint>({
    filter: client.filter("system = {:system} && created > {:since} && type = {:type}", {
      system: systemId,
      since,
      type: config.type,
    }),
    fields: "created,stats",
    sort: "created",
  })
}

export function subscribeToSystems(
  client: PocketBase,
  onRecord: (event: RecordSubscription<SystemRecord>) => void,
) {
  return client.collection("systems").subscribe<SystemRecord>("*", onRecord, {
    fields: "id,name,status,info,updated",
  })
}
