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
import { ExternalIcon, LogoutIcon, RefreshIcon, ServerIcon } from "./icons"
import "./styles.css"

function value(value: number | undefined) {
  return Number.isFinite(value) ? Math.round(value as number) : 0
}

function formatUptime(seconds: number | undefined) {
  if (!seconds) return "—"
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return days ? `${days}d ${hours}h` : `${hours}h`
}

function metricTone(amount: number) {
  if (amount >= 90) return "critical"
  if (amount >= 75) return "warning"
  return "normal"
}

function Gauge({ label, amount }: { label: string; amount: number }) {
  const tone = metricTone(amount)
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

  const load = useCallback(async () => {
    setFleetError("")
    try {
      const records = await listSystems(client)
      setSystems(records)
      setSelectedId((current) => current || records[0]?.id || "")
      setUpdatedAt(new Date())
    } catch (cause) {
      setFleetError(cause instanceof Error ? cause.message : "Could not load systems from this hub.")
    } finally {
      setLoading(false)
    }
  }, [client])

  const loadHistory = useCallback(async () => {
    if (!selectedId) return
    setHistoryError("")
    setHistoryLoading(true)
    try {
      setStats(await listStats(client, selectedId, range))
    } catch (cause) {
      setHistoryError(cause instanceof Error ? cause.message : "Could not load system history.")
    } finally {
      setHistoryLoading(false)
    }
  }, [client, selectedId, range])

  useEffect(() => {
    void load()
    let unsubscribe: (() => void) | undefined
    void subscribeToSystems(client, (event) => {
      setSystems((current) => {
        if (event.action === "delete") return current.filter((system) => system.id !== event.record.id)
        const index = current.findIndex((system) => system.id === event.record.id)
        if (index < 0) return [...current, event.record].sort((a, b) => a.name.localeCompare(b.name))
        return current.map((system) => system.id === event.record.id ? event.record : system)
      })
      setUpdatedAt(new Date())
    }).then((stop) => { unsubscribe = stop }).catch(() => undefined)
    return () => { unsubscribe?.(); void client.collection("systems").unsubscribe("*") }
  }, [client, load])

  useEffect(() => {
    if (!selectedId) return
    void loadHistory()
  }, [loadHistory, selectedId])

  const selected = systems.find((system) => system.id === selectedId)
  const counts = useMemo(() => ({
    up: systems.filter((system) => system.status === "up").length,
    attention: systems.filter((system) => system.status !== "up").length,
  }), [systems])

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

      <div class="workspace">
        <section class="fleet-panel">
          <div class="section-heading"><div><ServerIcon /><h2>Fleet</h2></div><span>{systems.length} registered</span></div>
          {loading ? (
            <div class="system-skeleton" aria-label="Loading systems"><span/><span/><span/></div>
          ) : systems.length ? (
            <div class="system-list">
              {systems.map((system) => {
                const cpu = value(system.info.cpu)
                const memory = value(system.info.mp)
                const disk = value(system.info.dp)
                return (
                  <button class={`system-row ${selectedId === system.id ? "selected" : ""}`} type="button" key={system.id} onClick={() => setSelectedId(system.id)}>
                    <div class="system-identity"><span class={`status-mark ${system.status}`} /><span><strong>{system.name}</strong><small>{system.status === "up" ? `Up ${formatUptime(system.info.u)}` : system.status}</small></span></div>
                    <div class="mini-metric"><span>CPU</span><strong class={metricTone(cpu)}>{cpu}%</strong></div>
                    <div class="mini-metric"><span>MEM</span><strong class={metricTone(memory)}>{memory}%</strong></div>
                    <div class="mini-metric"><span>DISK</span><strong class={metricTone(disk)}>{disk}%</strong></div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div class="empty-state"><ServerIcon /><h3>No systems found</h3><p>This account does not have access to any Beszel systems yet.</p><a href={hubUrl} target="_blank" rel="noreferrer">Open Beszel to add one <ExternalIcon /></a></div>
          )}
        </section>

        <section class="detail-panel">
          {selected ? (
            <>
              <div class="detail-heading">
                <div><span class={`status-mark ${selected.status}`} /><div><h2>{selected.name}</h2><p>{selected.info.o || "System"}{selected.info.m ? ` · ${selected.info.m}` : ""}</p></div></div>
                <div class="range-tabs" aria-label="History range">
                  {(["1h", "12h", "24h"] as TimeRange[]).map((option) => <button type="button" aria-pressed={range === option} class={range === option ? "active" : ""} onClick={() => setRange(option)} key={option}>{option}</button>)}
                </div>
              </div>
              <div class="gauges">
                <Gauge label="CPU" amount={value(selected.info.cpu)} />
                <Gauge label="Memory" amount={value(selected.info.mp)} />
                <Gauge label="Disk" amount={value(selected.info.dp)} />
              </div>
              <div class="history-heading"><h3>Utilization history</h3><span>{historyLoading ? "Loading readings…" : `${stats.length} readings`}</span></div>
              {historyError ? (
                <div class="history-error" role="alert"><strong>History unavailable</strong><span>{historyError}</span><button type="button" onClick={() => void loadHistory()}>Reload history</button></div>
              ) : historyLoading ? <div class="chart-loading"><span /></div> : <MetricChart points={stats} />}
            </>
          ) : (
            <div class="empty-detail"><span>SELECT</span><p>Choose a system to inspect its readings.</p></div>
          )}
        </section>
      </div>
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
