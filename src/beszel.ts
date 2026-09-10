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
    mp?: number
    dp?: number
  }
}

export type TimeRange = "1h" | "12h" | "24h"

const ranges: Record<TimeRange, { hours: number; type: string }> = {
  "1h": { hours: 1, type: "1m" },
  "12h": { hours: 12, type: "10m" },
  "24h": { hours: 24, type: "20m" },
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
