import type { StatsPoint } from "./beszel"

const width = 760
const height = 220
const inset = { top: 14, right: 18, bottom: 30, left: 54 }
const palette = ["#5277df", "#40b97e", "#dd9c35", "#e26868", "#9a72d8", "#45a9b9", "#dd6da9", "#8da43d"]

interface Series {
  label: string
  color: string
  value: (point: StatsPoint) => number | undefined
}

interface ChartDefinition {
  id: string
  title: string
  subtitle: string
  series: Series[]
  ceiling?: number
  format: (value: number) => string
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

const percent = (value: number) => `${Math.round(value)}%`
const decimal = (value: number) => value < 10 ? value.toFixed(1) : Math.round(value).toString()

function bytes(value: number) {
  const amount = Math.max(0, value)
  const units = ["B", "KB", "MB", "GB", "TB"]
  const index = Math.min(units.length - 1, Math.floor(Math.log(Math.max(1, amount)) / Math.log(1024)))
  const scaled = amount / 1024 ** index
  return `${scaled >= 10 || index === 0 ? Math.round(scaled) : scaled.toFixed(1)} ${units[index]}`
}

function timeLabel(value: string | undefined) {
  if (!value) return ""
  const date = new Date(value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"))
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date)
}

function seriesHasData(points: StatsPoint[], series: Series[]) {
  return series.some((item) => points.some((point) => finite(item.value(point))))
}

function pathFor(points: StatsPoint[], series: Series, maximum: number) {
  const plotWidth = width - inset.left - inset.right
  const plotHeight = height - inset.top - inset.bottom
  let drawing = false
  return points.map((point, index) => {
    const value = series.value(point)
    if (!finite(value)) { drawing = false; return "" }
    const x = inset.left + (index / Math.max(1, points.length - 1)) * plotWidth
    const y = inset.top + plotHeight - (Math.max(0, Math.min(maximum, value)) / maximum) * plotHeight
    const command = drawing ? "L" : "M"
    drawing = true
    return `${command}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
}

function Chart({ definition, points }: { definition: ChartDefinition; points: StatsPoint[] }) {
  const values = definition.series.flatMap((series) => points.map(series.value).filter(finite))
  const rawMaximum = Math.max(1, ...values)
  const maximum = definition.ceiling ?? Math.ceil(rawMaximum * 1.12 / 5) * 5
  const first = points[0]?.created
  const middle = points[Math.floor(points.length / 2)]?.created
  const last = points.at(-1)?.created
  return (
    <section class="history-chart" aria-labelledby={`chart-${definition.id}`}>
      <header>
        <div><h4 id={`chart-${definition.id}`}>{definition.title}</h4><p>{definition.subtitle}</p></div>
        <div class="chart-legend" aria-label={`${definition.title} legend`}>
          {definition.series.map((series) => <span key={series.label}><i style={{ backgroundColor: series.color }} />{series.label}</span>)}
        </div>
      </header>
      <div class="chart-scroll">
        <svg class="metric-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${definition.title} over the selected time range`}>
          {[0, .25, .5, .75, 1].map((fraction) => {
            const y = inset.top + (1 - fraction) * (height - inset.top - inset.bottom)
            return <g key={fraction}><line class="chart-grid" x1={inset.left} x2={width - inset.right} y1={y} y2={y} /><text class="chart-axis" x={inset.left - 9} y={y + 4} text-anchor="end">{definition.format(maximum * fraction)}</text></g>
          })}
          {definition.series.map((series) => <path key={series.label} class="chart-line" style={{ stroke: series.color }} d={pathFor(points, series, maximum)} />)}
          <text class="chart-axis" x={inset.left} y={height - 7}>{timeLabel(first)}</text>
          <text class="chart-axis" x={width / 2} y={height - 7} text-anchor="middle">{timeLabel(middle)}</text>
          <text class="chart-axis" x={width - inset.right} y={height - 7} text-anchor="end">{timeLabel(last)}</text>
        </svg>
      </div>
    </section>
  )
}

function mapKeys(points: StatsPoint[], getMap: (point: StatsPoint) => Record<string, unknown> | undefined) {
  return [...new Set(points.flatMap((point) => Object.keys(getMap(point) ?? {})))].sort()
}

function definitions(points: StatsPoint[]): ChartDefinition[] {
  const temperatureKeys = mapKeys(points, (point) => point.stats.t)
  const filesystemKeys = mapKeys(points, (point) => point.stats.efs)
  const gpuKeys = mapKeys(points, (point) => point.stats.g)
  const coreCount = Math.max(0, ...points.map((point) => point.stats.cpus?.length ?? 0))
  const charts: ChartDefinition[] = [
    { id: "cpu", title: "CPU usage", subtitle: "Average system-wide utilization", ceiling: 100, format: percent, series: [{ label: "CPU", color: palette[0], value: (point) => point.stats.cpu }] },
    { id: "memory", title: "Memory usage", subtitle: "Physical memory utilization", ceiling: 100, format: percent, series: [{ label: "Memory", color: palette[1], value: (point) => point.stats.mp }] },
    { id: "disk", title: "Disk usage", subtitle: "Primary filesystem utilization", ceiling: 100, format: percent, series: [{ label: "C", color: palette[2], value: (point) => point.stats.dp }] },
    { id: "bandwidth", title: "Bandwidth", subtitle: "Network traffic", format: bytes, series: [
      { label: "Sent", color: palette[3], value: (point) => point.stats.b?.[0] ?? point.stats.ns },
      { label: "Received", color: palette[1], value: (point) => point.stats.b?.[1] ?? point.stats.nr },
    ] },
    { id: "load", title: "Load average", subtitle: "System load over 1, 5, and 15 minutes", format: decimal, series: [
      { label: "1 min", color: palette[0], value: (point) => point.stats.la?.[0] },
      { label: "5 min", color: palette[2], value: (point) => point.stats.la?.[1] },
      { label: "15 min", color: palette[3], value: (point) => point.stats.la?.[2] },
    ] },
    { id: "disk-io", title: "Disk I/O", subtitle: "Read and write throughput", format: bytes, series: [
      { label: "Read", color: palette[0], value: (point) => point.stats.dio?.[0] ?? point.stats.dr },
      { label: "Write", color: palette[3], value: (point) => point.stats.dio?.[1] ?? point.stats.dw },
    ] },
    { id: "cpu-breakdown", title: "CPU breakdown", subtitle: "User, system, wait, and steal time", ceiling: 100, format: percent, series: [
      { label: "User", color: palette[0], value: (point) => point.stats.cpub?.[0] },
      { label: "System", color: palette[2], value: (point) => point.stats.cpub?.[1] },
      { label: "IO wait", color: palette[4], value: (point) => point.stats.cpub?.[2] },
      { label: "Steal", color: palette[3], value: (point) => point.stats.cpub?.[3] },
    ] },
  ]
  if (coreCount) charts.push({ id: "cores", title: "CPU cores", subtitle: "Per-core average utilization", ceiling: 100, format: percent, series: Array.from({ length: coreCount }, (_, index) => ({ label: `CPU ${index}`, color: palette[index % palette.length], value: (point) => point.stats.cpus?.[index] })) })
  if (temperatureKeys.length) charts.push({ id: "temperatures", title: "Temperatures", subtitle: "Reported hardware sensors", format: (value) => `${Math.round(value)}°`, series: temperatureKeys.map((key, index) => ({ label: key, color: palette[index % palette.length], value: (point) => point.stats.t?.[key] })) })
  if (filesystemKeys.length) charts.push({ id: "filesystems", title: "Filesystems", subtitle: "Additional filesystem utilization", ceiling: 100, format: percent, series: filesystemKeys.map((key, index) => ({ label: key, color: palette[index % palette.length], value: (point) => { const filesystem = point.stats.efs?.[key]; return finite(filesystem?.d) && finite(filesystem?.du) && filesystem.d > 0 ? filesystem.du / filesystem.d * 100 : undefined } })) })
  if (gpuKeys.length) charts.push({ id: "gpu", title: "GPU usage", subtitle: "Graphics processor utilization", ceiling: 100, format: percent, series: gpuKeys.map((key, index) => ({ label: points.find((point) => point.stats.g?.[key]?.n)?.stats.g?.[key]?.n ?? key, color: palette[index % palette.length], value: (point) => point.stats.g?.[key]?.u })) })
  return charts.filter((chart) => seriesHasData(points, chart.series))
}

export function MetricsDashboard({ points }: { points: StatsPoint[] }) {
  const charts = definitions(points)
  if (!points.length || !charts.length) return <div class="empty-chart">No history is available for this range.</div>
  return <div class="history-grid">{charts.map((chart) => <Chart definition={chart} points={points} key={chart.id} />)}</div>
}
