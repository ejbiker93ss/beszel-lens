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
  timeRanges,
  type StatsPoint,
  type SystemRecord,
  type TimeRange,
} from "./beszel"
import { MetricsDashboard } from "./chart"
import { loadAppSettings, type ResolvedAppSettings } from "./config"
import { CloseIcon, ExternalIcon, GridIcon, LogoutIcon, RefreshIcon, RowsIcon, ServerIcon } from "./icons"
import { assessSystem, driveReadings, rankSystems } from "./risk"
import "./styles.css"

type ViewMode = "cards" | "rows"
type SortMode = "smart" | "name" | "cpu" | "memory" | "disk" | "uptime"
type OptionalColumn = "condition" | "cpu" | "memory" | "drives"
type ColumnKey = "system" | OptionalColumn

interface FleetPreferences {
  filter: string
  sort: SortMode
  visibleColumns: OptionalColumn[]
  widths: Record<ColumnKey, number>
}

const viewModeKey = "beszel-lens-view"
const fleetPreferencesKey = "beszel-lens-fleet-preferences"
const defaultWidths: Record<ColumnKey, number> = { system: 230, condition: 130, cpu: 120, memory: 120, drives: 420 }
const optionalColumns: Array<{ key: OptionalColumn; label: string }> = [
  { key: "condition", label: "Condition" },
  { key: "cpu", label: "CPU" },
  { key: "memory", label: "RAM" },
  { key: "drives", label: "Drives" },
]

function storedFleetPreferences(): FleetPreferences {
  const fallback: FleetPreferences = { filter: "", sort: "smart", visibleColumns: optionalColumns.map((column) => column.key), widths: defaultWidths }
  try {
    const stored = JSON.parse(localStorage.getItem(fleetPreferencesKey) ?? "{}") as Partial<FleetPreferences>
    const visibleColumns = Array.isArray(stored.visibleColumns) ? stored.visibleColumns.filter((column): column is OptionalColumn => optionalColumns.some((option) => option.key === column)) : fallback.visibleColumns
    const sortModes: SortMode[] = ["smart", "name", "cpu", "memory", "disk", "uptime"]
    const widths = Object.fromEntries((Object.keys(defaultWidths) as ColumnKey[]).map((column) => {
      const candidate = stored.widths?.[column]
      return [column, Number.isFinite(candidate) ? Math.max(column === "drives" ? 240 : 90, Math.min(900, candidate as number)) : defaultWidths[column]]
    })) as Record<ColumnKey, number>
    return {
      filter: typeof stored.filter === "string" ? stored.filter : "",
      sort: sortModes.includes(stored.sort as SortMode) ? stored.sort as SortMode : "smart",
      visibleColumns,
      widths,
    }
  } catch {
    return fallback
  }
}

function storedViewMode(): ViewMode {
  try {
    return localStorage.getItem(viewModeKey) === "rows" ? "rows" : "cards"
  } catch {
    return "cards"
  }
}

function formatUptime(seconds: number | undefined) {
  if (!seconds) return "—"
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return days ? `${days}d ${hours}h` : `${hours}h`
}

function compactDriveLabel(label: string, primary: boolean) {
  const driveLetter = label.match(/^([a-z]):(?:\s+drive)?$/i)
  if (driveLetter) return driveLetter[1].toUpperCase()
  if (primary && label === "Primary disk") return "C"
  return label.replace(/\s+drive$/i, "")
}

function metricTone(amount: number, warning = 75, critical = 90) {
  if (amount >= critical) return "critical"
  if (amount >= warning) return "warning"
  return "normal"
}

function clampPercent(amount: number) {
  return Math.max(0, Math.min(100, amount))
}

function usageTone(amount: number | undefined, warning = 75, critical = 90) {
  if (!Number.isFinite(amount)) return "unavailable"
  const percent = amount as number
  if (percent >= critical) return "critical"
  if (percent >= warning) return "warning"
  if (percent >= 60) return "elevated"
  return "low"
}

function Gauge({ label, accessibleLabel = label, amount, warning = 75 }: { label: string; accessibleLabel?: string; amount: number | undefined; warning?: number }) {
  const available = Number.isFinite(amount)
  const rounded = available ? Math.round(amount as number) : undefined
  const percent = clampPercent(rounded ?? 0)
  const tone = available ? metricTone(percent, warning) : "unavailable"
  const meterProps = available ? { "aria-valuenow": percent } : { "aria-valuetext": "Unavailable" }
  return (
    <div class={`gauge ${tone}`}>
      <div class="gauge-label"><span title={accessibleLabel}>{label}</span><strong>{available ? `${rounded}%` : "—"}</strong></div>
      <div class="gauge-track" aria-label={`${accessibleLabel} usage`} role="meter" aria-valuemin={0} aria-valuemax={100} {...meterProps}>
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
    </div>
  )
}

function MetricBar({ label, amount, warning = 75 }: { label: string; amount: number | undefined; warning?: number }) {
  const available = Number.isFinite(amount)
  const rounded = available ? Math.round(amount as number) : undefined
  const percent = clampPercent(rounded ?? 0)
  const tone = usageTone(rounded, warning)
  const meterProps = available ? { "aria-valuenow": percent } : { "aria-valuetext": "Unavailable" }

  return (
    <div class={`metric-bar ${tone}`}>
      <div class="metric-bar-label"><span title={label}>{label}</span><strong>{available ? `${rounded}%` : "—"}</strong></div>
      <div class="metric-bar-track" role="meter" aria-label={`${label} usage`} aria-valuemin={0} aria-valuemax={100} {...meterProps}>
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
    </div>
  )
}

function CompactMeter({ label, amount, warning = 75, showLabel = false }: { label: string; amount: number | undefined; warning?: number; showLabel?: boolean }) {
  const available = Number.isFinite(amount)
  const rounded = available ? Math.round(amount as number) : undefined
  const percent = clampPercent(rounded ?? 0)
  const tone = usageTone(rounded, warning)
  const meterProps = available ? { "aria-valuenow": percent } : { "aria-valuetext": "Unavailable" }

  return (
    <div class={`compact-meter ${tone} ${showLabel ? "labeled" : ""}`}>
      {showLabel && <span class="compact-meter-name" title={label}>{label}</span>}
      <div class="compact-meter-track" role="meter" aria-label={`${label} usage`} aria-valuemin={0} aria-valuemax={100} {...meterProps}>
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <strong class="compact-meter-value">{available ? `${rounded}%` : "—"}</strong>
    </div>
  )
}

function Login({ onConnect, busy, error, defaultHubUrl }: { onConnect: (hub: string, email: string, password: string) => void; busy: boolean; error: string; defaultHubUrl: string }) {
  const [hub, setHub] = useState(storedHubUrl() || defaultHubUrl)
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

function SystemCard({ system, selected, visibleColumns, onSelect }: { system: SystemRecord; selected: boolean; visibleColumns: Set<OptionalColumn>; onSelect: () => void }) {
  const risk = assessSystem(system)
  const drives = driveReadings(system)
  return (
    <article class={`system-card tone-${risk.tone} ${selected ? "selected" : ""}`} onClick={onSelect}>
      <button class="card-open" type="button" onClick={(event) => { event.stopPropagation(); onSelect() }} aria-expanded={selected} aria-controls="system-detail" data-system-id={system.id}>
        <div class="card-header">
          <span class={`status-mark ${system.status}`} />
          <strong title={system.name}>{system.name}</strong>
          <span class="uptime">{system.status === "up" ? `Up ${formatUptime(system.info.u)}` : system.status}</span>
        </div>
        {visibleColumns.has("condition") && risk.tone !== "normal" && <div class={`card-condition tone-${risk.tone}`}><b>{risk.label}</b><small>{risk.detail}</small></div>}
      </button>
      {(visibleColumns.has("cpu") || visibleColumns.has("memory") || visibleColumns.has("drives")) && <div class="metric-bars" role="group" aria-label={`${system.name} current utilization`}>
        {visibleColumns.has("cpu") && <MetricBar label="CPU" amount={system.info.cpu} />}
        {visibleColumns.has("memory") && <MetricBar label="RAM" amount={system.info.mp} />}
        {visibleColumns.has("drives") && drives.map((drive, index) => <MetricBar label={compactDriveLabel(drive.label, drive.primary)} amount={drive.value} warning={80} key={`${drive.label}-${index}`} />)}
      </div>}
    </article>
  )
}

function SystemRow({ system, selected, visibleColumns, onSelect }: { system: SystemRecord; selected: boolean; visibleColumns: Set<OptionalColumn>; onSelect: () => void }) {
  const risk = assessSystem(system)
  const drives = driveReadings(system)
  return (
    <tr class={`system-row tone-${risk.tone} ${selected ? "selected" : ""}`} onClick={onSelect}>
      <th scope="row">
        <button class="row-open" type="button" onClick={(event) => { event.stopPropagation(); onSelect() }} aria-expanded={selected} aria-controls="system-detail" data-system-id={system.id}>
          <span class={`status-mark ${system.status}`} />
          <span><strong title={system.name}>{system.name}</strong><small>{system.status === "up" ? `Up ${formatUptime(system.info.u)}` : system.status}</small></span>
        </button>
      </th>
      {visibleColumns.has("condition") && <td class={`row-condition tone-${risk.tone}`}>{risk.tone !== "normal" && <strong>{risk.label}</strong>}</td>}
      {visibleColumns.has("cpu") && <td><CompactMeter label={`${system.name} CPU`} amount={system.info.cpu} /></td>}
      {visibleColumns.has("memory") && <td><CompactMeter label={`${system.name} RAM`} amount={system.info.mp} /></td>}
      {visibleColumns.has("drives") && <td><div class="row-drives" role="group" aria-label={`${system.name} drive utilization`}>{drives.map((drive, index) => <CompactMeter label={compactDriveLabel(drive.label, drive.primary)} amount={drive.value} warning={80} showLabel key={`${drive.label}-${index}`} />)}</div></td>}
    </tr>
  )
}

function ResizableHeader({ label, column, width, onResize }: { label: string; column: ColumnKey; width: number; onResize: (column: ColumnKey, width: number) => void }) {
  const beginResize = (event: PointerEvent) => {
    event.preventDefault()
    const header = (event.currentTarget as HTMLElement).parentElement
    if (!header) return
    const startX = event.clientX
    const startWidth = header.getBoundingClientRect().width
    const move = (moveEvent: PointerEvent) => onResize(column, startWidth + moveEvent.clientX - startX)
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop) }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop, { once: true })
  }
  return <th scope="col">{label}<span class="column-resizer" role="separator" aria-label={`Resize ${label} column`} aria-orientation="vertical" aria-valuemin={column === "drives" ? 240 : 90} aria-valuemax={900} aria-valuenow={width} tabIndex={0} onPointerDown={beginResize} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); onResize(column, width + (event.key === "ArrowRight" ? 12 : -12)) } }} /></th>
}

function FleetToolbar({ count, filter, sort, viewMode, visibleColumns, onFilter, onSort, onViewMode, onToggleColumn }: {
  count: number
  filter: string
  sort: SortMode
  viewMode: ViewMode
  visibleColumns: Set<OptionalColumn>
  onFilter: (value: string) => void
  onSort: (value: SortMode) => void
  onViewMode: (value: ViewMode) => void
  onToggleColumn: (value: OptionalColumn) => void
}) {
  const orderLabel: Record<SortMode, string> = { smart: "highest risk first", name: "system name", cpu: "highest CPU first", memory: "highest RAM first", disk: "fullest drive first", uptime: "longest uptime first" }
  return <div class="fleet-toolbar">
    <div class="fleet-toolbar-title"><ServerIcon /><span><strong>Fleet priority</strong><small>{count} systems · {orderLabel[sort]}</small></span></div>
    <label class="quick-filter"><span class="sr-only">Quick filter</span><input type="search" value={filter} placeholder="Filter systems…" onInput={(event) => onFilter(event.currentTarget.value)} /></label>
    <label class="toolbar-select"><span>Sort</span><select value={sort} onChange={(event) => onSort(event.currentTarget.value as SortMode)}><option value="smart">Smart</option><option value="name">System</option><option value="cpu">CPU</option><option value="memory">RAM</option><option value="disk">Fullest drive</option><option value="uptime">Uptime</option></select></label>
    <details class="column-chooser"><summary>Columns</summary><div class="column-menu"><span class="column-menu-title">Visible fields</span><label><input type="checkbox" checked disabled /> System</label>{optionalColumns.map((column) => <label key={column.key}><input type="checkbox" checked={visibleColumns.has(column.key)} onChange={() => onToggleColumn(column.key)} /> {column.label}</label>)}</div></details>
    <div class="view-switch" role="group" aria-label="Fleet view">
      <button type="button" aria-pressed={viewMode === "cards"} title="Card view" onClick={() => onViewMode("cards")}><GridIcon /><span>Cards</span></button>
      <button type="button" aria-pressed={viewMode === "rows"} title="Row view" onClick={() => onViewMode("rows")}><RowsIcon /><span>Rows</span></button>
    </div>
  </div>
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
  const drives = driveReadings(system)
  const uptime = system.status === "up" ? `Up ${formatUptime(system.info.u)}` : system.status
  const systemSummary = [system.info.o || "System", system.info.m, uptime].filter(Boolean).join(" · ")
  return (
    <section class="detail-panel" id="system-detail" aria-label={`${system.name} details`}>
      <div class="detail-heading">
        <div><span class={`status-mark ${system.status}`} /><div><h2>{system.name}</h2><p>{systemSummary}</p></div></div>
        <button class="close-button" type="button" onClick={onClose}><CloseIcon /> Close</button>
      </div>
      <div class={`detail-alert tone-${risk.tone}`}><span>{risk.label}</span><strong>{risk.value}</strong>{risk.detail && <small>{risk.detail}</small>}</div>
      <div class="gauges">
        <Gauge label="CPU" amount={system.info.cpu} />
        <Gauge label="RAM" accessibleLabel="Memory" amount={system.info.mp} />
        {drives.map((drive, index) => <Gauge label={compactDriveLabel(drive.label, drive.primary)} accessibleLabel={drive.label} amount={drive.value} warning={80} key={`${drive.label}-${index}`} />)}
      </div>
      <div class="history-heading">
        <div><h3>System history</h3><span>{loading ? "Loading readings…" : `${stats.length} readings`}</span></div>
        <label class="range-select"><span>Look back</span><select aria-label="History lookback range" value={range} onChange={(event) => onRange(event.currentTarget.value as TimeRange)}>{timeRanges.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      </div>
      {error ? (
        <div class="history-error" role="alert"><strong>History unavailable</strong><span>{error}</span><button type="button" onClick={onReload}>Reload history</button></div>
      ) : loading ? <div class="chart-loading"><span /></div> : <MetricsDashboard points={stats} />}
    </section>
  )
}

function Dashboard({ client, hubUrl, refreshIntervalSeconds, onLogout }: { client: PocketBase; hubUrl: string; refreshIntervalSeconds: number; onLogout: () => void }) {
  const [systems, setSystems] = useState<SystemRecord[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [range, setRange] = useState<TimeRange>("1h")
  const [stats, setStats] = useState<StatsPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [fleetError, setFleetError] = useState("")
  const [historyError, setHistoryError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>(storedViewMode)
  const [preferences, setPreferences] = useState<FleetPreferences>(storedFleetPreferences)
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
    if (!Number.isFinite(refreshIntervalSeconds) || refreshIntervalSeconds < 15) return
    const interval = window.setInterval(() => void load(), refreshIntervalSeconds * 1000)
    return () => window.clearInterval(interval)
  }, [load, refreshIntervalSeconds])

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

  useEffect(() => {
    try { localStorage.setItem(fleetPreferencesKey, JSON.stringify(preferences)) } catch { /* Storage can be unavailable in hardened browsers. */ }
  }, [preferences])

  const visibleColumns = useMemo(() => new Set(preferences.visibleColumns), [preferences.visibleColumns])
  const rankedSystems = useMemo(() => {
    const query = preferences.filter.trim().toLocaleLowerCase()
    const filtered = systems.filter((system) => {
      if (!query) return true
      const risk = assessSystem(system)
      return [system.name, system.status, risk.label, risk.detail, system.info.o, system.info.m].some((value) => value?.toLocaleLowerCase().includes(query))
    })
    if (preferences.sort === "smart") return rankSystems(filtered)
    const value = (system: SystemRecord) => {
      if (preferences.sort === "cpu") return system.info.cpu ?? -1
      if (preferences.sort === "memory") return system.info.mp ?? -1
      if (preferences.sort === "disk") return Math.max(-1, ...driveReadings(system).map((drive) => drive.value ?? -1))
      if (preferences.sort === "uptime") return system.info.u ?? -1
      return 0
    }
    return [...filtered].sort((a, b) => preferences.sort === "name" ? a.name.localeCompare(b.name, undefined, { numeric: true }) : value(b) - value(a) || a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [preferences.filter, preferences.sort, systems])
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

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    try { localStorage.setItem(viewModeKey, mode) } catch { /* Storage can be unavailable in hardened browsers. */ }
  }

  const updatePreference = <K extends keyof FleetPreferences>(key: K, value: FleetPreferences[K]) => setPreferences((current) => ({ ...current, [key]: value }))
  const toggleColumn = (column: OptionalColumn) => setPreferences((current) => ({ ...current, visibleColumns: current.visibleColumns.includes(column) ? current.visibleColumns.filter((item) => item !== column) : [...current.visibleColumns, column] }))
  const resizeColumn = (column: ColumnKey, width: number) => setPreferences((current) => ({ ...current, widths: { ...current.widths, [column]: Math.max(column === "drives" ? 240 : 90, Math.min(900, Math.round(width))) } }))
  const displayedColumns: ColumnKey[] = ["system", ...optionalColumns.map((column) => column.key).filter((column) => visibleColumns.has(column))]
  const tableMinimumWidth = displayedColumns.reduce((total, column) => total + preferences.widths[column], 0)

  return (
    <main class="dashboard-shell">
      <div class="topbar-dock">
        <header class="topbar">
          <div class="brand-lockup"><span class="brand-index">BL—01</span><strong>Beszel Lens</strong></div>
          <div class="topbar-actions">
            <a class="icon-button labeled" href={hubUrl} target="_blank" rel="noreferrer"><ExternalIcon /> Open Beszel</a>
            <button class="icon-button" type="button" onClick={onLogout} aria-label="Sign out" title="Sign out"><LogoutIcon /></button>
          </div>
        </header>
        <FleetToolbar count={systems.length} filter={preferences.filter} sort={preferences.sort} viewMode={viewMode} visibleColumns={visibleColumns} onFilter={(value) => updatePreference("filter", value)} onSort={(value) => updatePreference("sort", value)} onViewMode={changeViewMode} onToggleColumn={toggleColumn} />
      </div>

      <section class="status-strip" aria-label="Fleet summary">
        <div><span>Systems</span><strong>{systems.length}</strong></div>
        <div><span>Online</span><strong>{counts.up}</strong></div>
        <div class={counts.attention ? "needs-attention" : ""}><span>Attention</span><strong>{counts.attention}</strong></div>
        <div class="refresh-cell"><span>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not updated"}</span><button type="button" onClick={() => void load()} disabled={loading}><RefreshIcon /> Refresh</button></div>
      </section>

      {fleetError && <div class="notice" role="alert"><strong>Fleet unavailable</strong><span>{fleetError}</span><button type="button" onClick={() => void load()}>Reload fleet</button></div>}

      <section class="fleet-section">
        {selected && <DetailPanel system={selected} stats={stats} range={range} loading={historyLoading} error={historyError} onRange={setRange} onReload={() => void loadHistory()} onClose={closeDetails} />}
        {loading ? (
          <div class="card-skeleton" aria-label="Loading systems"><span/><span/><span/><span/><span/><span/></div>
        ) : rankedSystems.length && viewMode === "cards" ? (
          <div class="system-grid">
            {rankedSystems.map((system) => <SystemCard system={system} selected={selectedId === system.id} visibleColumns={visibleColumns} onSelect={() => selectSystem(system.id)} key={system.id} />)}
          </div>
        ) : rankedSystems.length ? (
          <div class="row-view">
            <table class="system-table" style={{ minWidth: `${tableMinimumWidth}px` }}>
              <colgroup>{displayedColumns.map((column) => <col style={{ width: `${preferences.widths[column]}px` }} key={column} />)}</colgroup>
              <thead><tr><ResizableHeader label="System" column="system" width={preferences.widths.system} onResize={resizeColumn} />{visibleColumns.has("condition") && <ResizableHeader label="Condition" column="condition" width={preferences.widths.condition} onResize={resizeColumn} />}{visibleColumns.has("cpu") && <ResizableHeader label="CPU" column="cpu" width={preferences.widths.cpu} onResize={resizeColumn} />}{visibleColumns.has("memory") && <ResizableHeader label="RAM" column="memory" width={preferences.widths.memory} onResize={resizeColumn} />}{visibleColumns.has("drives") && <ResizableHeader label="Drives" column="drives" width={preferences.widths.drives} onResize={resizeColumn} />}</tr></thead>
              <tbody>{rankedSystems.map((system) => <SystemRow system={system} selected={selectedId === system.id} visibleColumns={visibleColumns} onSelect={() => selectSystem(system.id)} key={system.id} />)}</tbody>
            </table>
          </div>
        ) : (
          <div class="empty-state"><ServerIcon /><h3>{systems.length ? "No matching systems" : "No systems found"}</h3><p>{systems.length ? "Try a different quick filter." : "This account does not have access to any Beszel systems yet."}</p>{!systems.length && <a href={hubUrl} target="_blank" rel="noreferrer">Open Beszel to add one <ExternalIcon /></a>}</div>
        )}
      </section>

      <footer class="app-footer"><span>Unofficial companion for Beszel</span><span>Read-only by design</span></footer>
    </main>
  )
}

function App({ settings }: { settings: ResolvedAppSettings }) {
  const initialHub = storedHubUrl() || settings.BeszelLens.HubUrl
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
  return client
    ? <Dashboard client={client} hubUrl={client.baseURL} refreshIntervalSeconds={settings.BeszelLens.RefreshIntervalSeconds} onLogout={logout} />
    : <Login defaultHubUrl={settings.BeszelLens.HubUrl} onConnect={(...args) => void connect(...args)} busy={busy} error={error} />
}

void loadAppSettings().then((settings) => render(<App settings={settings} />, document.getElementById("app")!))
