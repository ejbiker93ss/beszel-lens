import { render } from "preact"
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks"
import type PocketBase from "pocketbase"
import {
  createClient,
  listStats,
  listSystems,
  normalizeHubUrl,
  restoreSession,
  signIn,
  signOut,
  storedHubUrl,
  subscribeToSystems,
  type StatsPoint,
  type SystemRecord,
  type TimeRange,
} from "./beszel"
import { MetricChart } from "./chart"
import { CloseIcon, ExternalIcon, LogoutIcon, RefreshIcon, ServerIcon } from "./icons"
import { assessSystem, rankSystems } from "./risk"
import "./styles.css"

function value(amount: number | undefined) {
  return Number.isFinite(amount) ? Math.round(amount as number) : 0
}

function formatUptime(seconds: number | undefined) {
  if (!seconds) return "—"
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return days ? `${days}d ${hours}h` : `${hours}h`
}

function metricTone(amount: number, warning = 75, critical = 90) {
  if (amount >= critical) return "critical"
  if (amount >= warning) return "warning"
  return "normal"
}

function Gauge({ label, amount, warning = 75 }: { label: string; amount: number; warning?: number }) {
  const tone = metricTone(amount, warning)
  return (
    <div class={`gauge ${tone}`}>
      <div class="gauge-label"><span>{label}</span><strong>{amount}%</strong></div>
      <div class="gauge-track" aria-label={`${label} ${amount}%`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={amount}>
        <span style={{ transform: `scaleX(${amount / 100})` }} />
      </div>
    </div>
  )
}

function Login({ onConnect, busy, error }: { onConnect: (hub: string, email: string, password: string) => void; busy: boolean; error: string }) {
  const [hub, setHub] = useState(storedHubUrl())
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <main class="login-shell">
      <section class="login-sheet">
        <header class="login-brand">
          <div class="registration-mark" aria-hidden="true">+</div>
          <div class="brand-lockup"><span class="brand-index">BL—01</span><h1>Beszel Lens</h1></div>
          <p>A focused, read-only view of your Beszel systems.</p>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); onConnect(hub, email, password) }}>
          <label>Beszel Hub URL<input type="url" required placeholder="https://beszel.example.com" value={hub} onInput={(event) => setHub(event.currentTarget.value)} /></label>
          <label>Email<input type="email" required autoComplete="username" value={email} onInput={(event) => setEmail(event.currentTarget.value)} /></label>
          <label>Password<input type="password" required autoComplete="current-password" value={password} onInput={(event) => setPassword(event.currentTarget.value)} /></label>
          {error && <div class="form-error" role="alert">{error}</div>}
          <button class="primary-button" type="submit" disabled={busy}>{busy ? "Connecting…" : "Open dashboard"}</button>
        </form>
        <footer><span>Your credentials go directly to your Beszel hub.</span><a href="https://github.com/henrygd/beszel" target="_blank" rel="noreferrer">About Beszel <ExternalIcon /></a></footer>
      </section>
    </main>
  )
}

function SystemCard({ system, selected, onSelect }: { system: SystemRecord; selected: boolean; onSelect: () => void }) {
  const risk = assessSystem(system)
  const cpu = value(system.info.cpu)
  const memory = value(system.info.mp)
  const disk = value(system.info.dp)
  return (
    <button
      class={`system-card tone-${risk.tone} ${selected ? "selected" : ""}`}
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      aria-controls="system-detail"
      data-system-id={system.id}
    >
      <div class="card-header">
        <span class={`status-mark ${system.status}`} />
        <strong title={system.name}>{system.name}</strong>
        <span class="uptime">{system.status === "up" ? `Up ${formatUptime(system.info.u)}` : system.status}</span>
      </div>
      <div class="card-signal">
        <strong>{risk.value}</strong>
        <span><b>{risk.label}</b><small>{risk.detail}</small></span>
      </div>
      <div class="card-metrics">
        <span>CPU <b class={metricTone(cpu)}>{cpu}%</b></span>
        <span>MEM <b class={metricTone(memory)}>{memory}%</b></span>
        <span>DISK <b class={metricTone(disk, 80)}>{disk}%</b></span>
      </div>
    </button>
  )
}

function DetailPanel({ system, stats, range, loading, error, onRange, onReload, onClose }: {
  system: SystemRecord
  stats: StatsPoint[]
  range: TimeRange
  loading: boolean
  error: string
  onRange: (range: TimeRange) => void
  onReload: () => void
  onClose: () => void
}) {
  const risk = assessSystem(system)
  return (
    <section class="detail-panel" id="system-detail" aria-label={`${system.name} details`}>
      <div class="detail-heading">
        <div><span class={`status-mark ${system.status}`} /><div><h2>{system.name}</h2><p>{system.info.o || "System"}{system.info.m ? ` · ${system.info.m}` : ""}</p></div></div>
        <button class="close-button" type="button" onClick={onClose}><CloseIcon /> Close</button>
      </div>
      <div class={`detail-alert tone-${risk.tone}`}><span>{risk.label}</span><strong>{risk.value}</strong><small>{risk.detail}</small></div>
      <div class="gauges">
        <Gauge label="CPU" amount={value(system.info.cpu)} />
        <Gauge label="Memory" amount={value(system.info.mp)} />
        <Gauge label="Disk" amount={value(system.info.dp)} warning={80} />
      </div>
      <div class="history-heading">
        <div><h3>Utilization history</h3><span>{loading ? "Loading readings…" : `${stats.length} readings`}</span></div>
        <div class="range-tabs" aria-label="History range">
          {(["1h", "12h", "24h"] as TimeRange[]).map((option) => <button type="button" aria-pressed={range === option} class={range === option ? "active" : ""} onClick={() => onRange(option)} key={option}>{option}</button>)}
        </div>
      </div>
      {error ? (
        <div class="history-error" role="alert"><strong>History unavailable</strong><span>{error}</span><button type="button" onClick={onReload}>Reload history</button></div>
      ) : loading ? <div class="chart-loading"><span /></div> : <MetricChart points={stats} />}
    </section>
  )
}

function Dashboard({ client, hubUrl, onLogout }: { client: PocketBase; hubUrl: string; onLogout: () => void }) {
  const [systems, setSystems] = useState<SystemRecord[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [range, setRange] = useState<TimeRange>("1h")
  const [stats, setStats] = useState<StatsPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [fleetError, setFleetError] = useState("")
  const [historyError, setHistoryError] = useState("")
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const historyRequest = useRef(0)

  const load = useCallback(async () => {
    setFleetError("")
    try {
      setSystems(await listSystems(client))
      setUpdatedAt(new Date())
    } catch (cause) {
      setFleetError(cause instanceof Error ? cause.message : "Could not load systems from this hub.")
    } finally {
      setLoading(false)
    }
  }, [client])

  const loadHistory = useCallback(async () => {
    if (!selectedId) return
    const request = ++historyRequest.current
    setHistoryError("")
    setHistoryLoading(true)
    try {
      const nextStats = await listStats(client, selectedId, range)
      if (request === historyRequest.current) setStats(nextStats)
    } catch (cause) {
      if (request === historyRequest.current) setHistoryError(cause instanceof Error ? cause.message : "Could not load system history.")
    } finally {
      if (request === historyRequest.current) setHistoryLoading(false)
    }
  }, [client, selectedId, range])

  const closeDetails = useCallback(() => {
    const systemId = selectedId
    historyRequest.current += 1
    setSelectedId("")
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-system-id="${systemId}"]`)?.focus())
  }, [selectedId])

  useEffect(() => {
    void load()
    let unsubscribe: (() => void) | undefined
    void subscribeToSystems(client, (event) => {
      setSystems((current) => {
        if (event.action === "delete") return current.filter((system) => system.id !== event.record.id)
        const index = current.findIndex((system) => system.id === event.record.id)
        if (index < 0) return [...current, event.record]
        return current.map((system) => system.id === event.record.id ? event.record : system)
      })
      setUpdatedAt(new Date())
    }).then((stop) => { unsubscribe = stop }).catch(() => undefined)
    return () => { unsubscribe?.(); void client.collection("systems").unsubscribe("*") }
  }, [client, load])

  useEffect(() => {
    if (selectedId) void loadHistory()
  }, [loadHistory, selectedId])

  useEffect(() => {
    if (!selectedId) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetails()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [closeDetails, selectedId])

  const rankedSystems = useMemo(() => rankSystems(systems), [systems])
  const selected = systems.find((system) => system.id === selectedId)
  const counts = useMemo(() => ({
    up: systems.filter((system) => system.status === "up").length,
    attention: systems.filter((system) => assessSystem(system).tone !== "normal").length,
  }), [systems])

  const selectSystem = (systemId: string) => {
    if (systemId === selectedId) {
      document.getElementById("system-detail")?.scrollIntoView({ block: "nearest", behavior: "smooth" })
      return
    }
    historyRequest.current += 1
    setStats([])
    setHistoryError("")
    setHistoryLoading(true)
    setSelectedId(systemId)
    requestAnimationFrame(() => document.getElementById("system-detail")?.scrollIntoView({ block: "nearest", behavior: "smooth" }))
  }

  return (
    <main class="dashboard-shell">
      <header class="topbar">
        <div class="brand-lockup"><span class="brand-index">BL—01</span><strong>Beszel Lens</strong></div>
        <div class="topbar-actions">
          <a class="icon-button labeled" href={hubUrl} target="_blank" rel="noreferrer"><ExternalIcon /> Open Beszel</a>
          <button class="icon-button" type="button" onClick={onLogout} aria-label="Sign out" title="Sign out"><LogoutIcon /></button>
        </div>
      </header>

      <section class="status-strip" aria-label="Fleet summary">
        <div><span>Systems</span><strong>{systems.length}</strong></div>
        <div><span>Online</span><strong>{counts.up}</strong></div>
        <div class={counts.attention ? "needs-attention" : ""}><span>Attention</span><strong>{counts.attention}</strong></div>
        <div class="refresh-cell"><span>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not updated"}</span><button type="button" onClick={() => void load()} disabled={loading}><RefreshIcon /> Refresh</button></div>
      </section>

      {fleetError && <div class="notice" role="alert"><strong>Fleet unavailable</strong><span>{fleetError}</span><button type="button" onClick={() => void load()}>Reload fleet</button></div>}

      <section class="fleet-section">
        <div class="fleet-heading">
          <div><ServerIcon /><div><h1>Fleet priority</h1><p>Highest risk first</p></div></div>
          <span>{systems.length} registered</span>
        </div>
        {selected && <DetailPanel system={selected} stats={stats} range={range} loading={historyLoading} error={historyError} onRange={setRange} onReload={() => void loadHistory()} onClose={closeDetails} />}
        {loading ? (
          <div class="card-skeleton" aria-label="Loading systems"><span/><span/><span/><span/><span/><span/></div>
        ) : rankedSystems.length ? (
          <div class="system-grid">
            {rankedSystems.map((system) => <SystemCard system={system} selected={selectedId === system.id} onSelect={() => selectSystem(system.id)} key={system.id} />)}
          </div>
        ) : (
          <div class="empty-state"><ServerIcon /><h3>No systems found</h3><p>This account does not have access to any Beszel systems yet.</p><a href={hubUrl} target="_blank" rel="noreferrer">Open Beszel to add one <ExternalIcon /></a></div>
        )}
      </section>

      <footer class="app-footer"><span>Unofficial companion for Beszel</span><span>Read-only by design</span></footer>
    </main>
  )
}

function App() {
  const initialHub = storedHubUrl()
  const clientRef = useRef<PocketBase | null>(initialHub ? createClient(initialHub) : null)
  const [client, setClient] = useState<PocketBase | null>(null)
  const [checking, setChecking] = useState(Boolean(initialHub))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = clientRef.current
    if (!current) return
    void restoreSession(current).then((valid) => {
      if (valid) setClient(current)
      setChecking(false)
    })
  }, [])

  const connect = async (hub: string, email: string, password: string) => {
    setBusy(true)
    setError("")
    try {
      const normalized = normalizeHubUrl(hub)
      if (!normalized) throw new Error("Enter the URL of your Beszel hub.")
      const next = createClient(normalized)
      await signIn(next, email, password)
      clientRef.current = next
      setClient(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in. Check the hub URL and credentials.")
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    if (clientRef.current) signOut(clientRef.current)
    setClient(null)
  }

  if (checking) return <main class="boot-screen"><span>BL—01</span><div class="boot-line" /></main>
  return client ? <Dashboard client={client} hubUrl={client.baseURL} onLogout={logout} /> : <Login onConnect={(...args) => void connect(...args)} busy={busy} error={error} />
}

render(<App />, document.getElementById("app")!)
