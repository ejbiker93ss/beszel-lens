import type { StatsPoint } from "./beszel"

const width = 1000
const height = 250
const inset = { top: 18, right: 20, bottom: 34, left: 42 }

type Metric = "cpu" | "mp" | "dp"

const metrics: Array<{ key: Metric; label: string; className: string }> = [
  { key: "cpu", label: "CPU", className: "chart-cpu" },
  { key: "mp", label: "Memory", className: "chart-memory" },
  { key: "dp", label: "Disk", className: "chart-disk" },
]

function pathFor(points: StatsPoint[], key: Metric) {
  if (!points.length) return ""
  const plotWidth = width - inset.left - inset.right
  const plotHeight = height - inset.top - inset.bottom
  return points
    .map((point, index) => {
      const x = inset.left + (index / Math.max(1, points.length - 1)) * plotWidth
      const value = Math.max(0, Math.min(100, Number(point.stats[key] ?? 0)))
      const y = inset.top + plotHeight - (value / 100) * plotHeight
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function timeLabel(value: string | undefined) {
  if (!value) return ""
  const date = new Date(value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"))
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
}

export function MetricChart({ points }: { points: StatsPoint[] }) {
  const first = points[0]?.created
  const middle = points[Math.floor(points.length / 2)]?.created
  const last = points.at(-1)?.created

  return (
    <div class="chart-wrap">
      <div class="chart-legend" aria-label="Chart legend">
        {metrics.map((metric) => (
          <span key={metric.key}><i class={metric.className} />{metric.label}</span>
        ))}
      </div>
      {points.length ? (
        <svg class="metric-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="CPU, memory, and disk utilization over time">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = inset.top + (1 - tick / 100) * (height - inset.top - inset.bottom)
            return (
              <g key={tick}>
                <line class="chart-grid" x1={inset.left} x2={width - inset.right} y1={y} y2={y} />
                <text class="chart-axis" x={inset.left - 10} y={y + 4} text-anchor="end">{tick}</text>
              </g>
            )
          })}
          {metrics.map((metric) => (
            <path key={metric.key} class={`chart-line ${metric.className}`} d={pathFor(points, metric.key)} />
          ))}
          <text class="chart-axis" x={inset.left} y={height - 8}>{timeLabel(first)}</text>
          <text class="chart-axis" x={width / 2} y={height - 8} text-anchor="middle">{timeLabel(middle)}</text>
          <text class="chart-axis" x={width - inset.right} y={height - 8} text-anchor="end">{timeLabel(last)}</text>
        </svg>
      ) : (
        <div class="empty-chart">No history is available for this range.</div>
      )}
    </div>
  )
}
