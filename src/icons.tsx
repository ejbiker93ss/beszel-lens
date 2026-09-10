import type { JSX } from "preact"

type IconProps = JSX.SVGAttributes<SVGSVGElement>

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

export function RefreshIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 9a7 7 0 0 1 11.5-2L20 12M4 12l2.4 5a7 7 0 0 0 11.5-2"/></svg>
}

export function ExternalIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M14 5h5v5"/><path d="m19 5-9 9"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>
}

export function LogoutIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M10 5H5v14h5"/><path d="m14 16 4-4-4-4"/><path d="M18 12H9"/></svg>
}

export function ServerIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M8 7h.01M8 17h.01M12 7h4M12 17h4"/></svg>
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>
}

export function GridIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
}

export function RowsIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="5" width="16" height="5" rx="1"/><rect x="4" y="14" width="16" height="5" rx="1"/></svg>
}
