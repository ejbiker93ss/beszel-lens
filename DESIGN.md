---
name: Beszel Lens
description: A live calibration ledger for fleet health.
colors:
  paper: "#f8f7f1"
  canvas: "#e8e7df"
  ink: "#171713"
  muted-ink: "#68675f"
  rule: "#c9c7ba"
  rule-strong: "#98968b"
  cobalt-ink: "#244fc7"
  indigo-reading: "#67718e"
  healthy-green: "#217451"
  warning-orange: "#c95416"
  critical-red: "#b92f38"
  selected-wash: "#e8ecfa"
  error-wash: "#fff0ef"
typography:
  display:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(2rem, 7vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  reading:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  control: "2px"
  status-dot: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  sheet: "42px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-ink}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "#193da4"
    textColor: "#ffffff"
  input:
    backgroundColor: "#fffef9"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  system-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "14px 18px"
  system-row-selected:
    backgroundColor: "{colors.selected-wash}"
    textColor: "{colors.ink}"
  range-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "0"
    width: "44px"
    height: "32px"
  range-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: Beszel Lens

## Overview

**Creative North Star: "The Live Calibration Ledger"**

Beszel Lens looks like an instrument sheet that happens to be live: warm paper and canvas, exact black rules, compact measurements, and cobalt annotation ink. Its authority comes from precision and legibility rather than decorative chrome. The interface is dense enough for operators, but never cramped; generous outer margins frame tightly ruled internal regions.

The system deliberately refuses the generic rounded-card dashboard. Panels join a shared visual ledger, readings align, and status color stays quiet until it carries operational meaning. Motion is brief and mechanical: controls acknowledge input, gauges calibrate, and loading bars scan.

**Key Characteristics:**

- Warm paper surfaces on a slightly darker canvas.
- Exact one-pixel rules organize information more often than whitespace or shadows.
- Cobalt marks interaction and measurement; indigo and green distinguish normal data series.
- Monospaced, tabular readings sit beside compact sans-serif titles and labels.
- Orange and red appear only when the system needs attention.

## Colors

The palette combines archival neutrals with a single cobalt interaction ink and strictly semantic status colors.

### Primary

- **Cobalt Measurement Ink:** The sole interaction accent for primary actions, focus, selection rails, CPU plots, progress, and loading motion.

### Secondary

- **Neutral Indigo Reading:** Distinguishes memory history without competing with the primary interaction color.
- **Healthy Green:** Marks online state and disk history; it reports health rather than decorating surfaces.

### Tertiary

- **Warning Orange:** Reserved for readings at or above the warning threshold and pending system state.
- **Critical Red:** Reserved for critical readings, unavailable systems, fleet attention, and error boundaries.

### Neutral

- **Warm Paper:** The working surface for sheets, panels, and hover-raised controls.
- **Workshop Canvas:** The page field behind the ruled interface and its loading skeletons.
- **Exact Ink:** Primary text and the strongest structural rules.
- **Muted Ledger Ink:** Supporting copy, labels, timestamps, and secondary metadata.
- **Rule and Strong Rule:** Two levels of division for internal cells and control boundaries.
- **Selected Wash:** A cool, pale field that makes the selected row legible without turning it into a card.
- **Error Wash:** A pale red field behind inline failures and notices.

### Named Rules

**The Exception Ink Rule.** Orange and red communicate degraded, pending, critical, or failed states only; they never serve as general accents.

**The One Cobalt Rule.** Cobalt owns action, focus, active measurement, and selected-edge emphasis. Do not introduce a second interactive accent.

## Typography

**Display Font:** Archivo Variable (with sans-serif fallback)  
**Body Font:** Native UI sans-serif stack  
**Label/Mono Font:** Native UI monospace stack

**Character:** Archivo gives the sign-in title a compressed, technical confidence. Everywhere else, native sans keeps the interface immediate while monospaced numerals make the telemetry feel measured and align reliably.

### Hierarchy

- **Display:** Bold, tightly tracked, and compact; used only for the Beszel Lens sign-in title.
- **Title:** Bold native sans with slightly tightened tracking; used for panel, system, and product titles.
- **Body:** Regular native sans with a relaxed reading line height; used for instructions, notices, and empty-state copy.
- **Label:** Bold mono with expanded tracking; used for the brand index, metric names, counts, timestamps, and uppercase utility labels.
- **Reading:** Bold mono with tabular numerals; used for percentages and fleet totals.

### Named Rules

**The Measured Number Rule.** Operational numbers use monospaced, tabular figures; prose never imitates telemetry styling.

**The One Display Moment Rule.** Archivo's large display treatment belongs to the connection sheet only. The dashboard stays compact.

## Layout

The dashboard is a centered working sheet with a maximum width of 1560px and fluid horizontal padding. A ruled top bar leads into a four-cell fleet summary, followed by an 18px-gapped workspace. On wide screens the fleet index occupies the narrower left column and the selected-system readings occupy the wider right column.

At 920px, the workspace becomes one column and the selected system moves before the fleet index so the inspection task remains primary. The summary keeps three equal count cells while refresh spans the full row. At 580px, the canvas padding and workspace gap tighten to 12px, gauges stack, range tabs stretch evenly, the labeled external link collapses to its icon, and the chart preserves a 560px plotting width inside horizontal overflow.

Internal spacing follows a compact 6/8/12/18/24px rhythm, with 42px reserved for the generous inset of the connection sheet. Structural regions use borders and aligned cells; avoid scattering unrelated floating modules across the canvas.

## Elevation & Depth

The dashboard is flat by default. Depth comes from the contrast between canvas and paper plus exact one-pixel rules. The fleet summary receives a very low ambient shadow, while the centered connection sheet alone uses the full sheet shadow. Rows express selection with a tinted wash and an inset cobalt rail, not elevation.

### Shadow Vocabulary

- **Sheet Lift** (`0 18px 50px rgba(37, 35, 26, 0.1)`): Used only to separate the connection sheet from the gridded canvas.
- **Summary Lift** (`0 8px 28px rgba(37, 35, 26, 0.05)`): A restrained ambient cue beneath the fleet summary.
- **Selection Rail** (`inset 3px 0 #244fc7`): Marks the active system without lifting it out of the ledger.

### Named Rules

**The Flat Ledger Rule.** Panels and cells remain flat at rest; use rules, tonal fields, and a selection rail before adding elevation.

## Shapes

The form language is rectilinear. Sheets, panels, summary cells, tabs, gauges, and rows use square corners. Interactive controls allow only a nearly imperceptible 2px radius to keep focus rings and touch surfaces crisp. The sole circular shape is the 9px system-status mark, whose geometry makes it readable at a glance.

**The Two-Pixel Ceiling Rule.** Controls may soften to 2px; structural containers remain square. Never turn the ledger into a collection of pills or rounded cards.

## Components

### Buttons

- **Shape:** Compact rectangular controls with a 2px radius; segmented range tabs stay square.
- **Primary:** Cobalt fill, white text, a matching one-pixel border, 46px minimum height, and 20px horizontal inset.
- **Hover / Focus:** Primary actions deepen to dark cobalt; active press moves down 1px. All keyboard focus receives a 3px translucent cobalt outline with 2px offset.
- **Icon / Ghost:** Transparent 40px targets gain a paper fill and strong neutral rule on hover.
- **Range Tabs:** Three joined 44-by-32px mono controls; the active range reverses to exact ink on warm paper.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Warm paper over workshop canvas.
- **Shadow Strategy:** Flat except for the connection sheet and the subtly lifted fleet summary.
- **Border:** One-pixel exact-ink outer rules with lighter internal divisions.
- **Internal Padding:** Usually 18px; the connection sheet expands to 42px on larger screens and 24px on small screens.

### Inputs / Fields

- **Style:** Near-white input field, one-pixel strong neutral stroke, 2px radius, and 12px by 13px inset.
- **Focus:** Border changes to cobalt and gains a 3px translucent cobalt outline.
- **Error / Disabled:** Errors use critical red rules and a pale red wash. Busy controls reduce opacity and retain an explicit wait cursor.

### Navigation

The top bar is a ruled instrument header rather than a raised app bar. The brand index uses cobalt mono text; product name and actions remain neutral. External navigation is labeled on wider screens and collapses to a 40px icon target below 580px.

### Fleet Summary

Four ruled cells present system count, online count, attention count, and freshness/action. Labels are small uppercase text; values are large tabular mono readings. Attention changes to critical red only when nonzero.

### System Row

Each row is a full-width button with identity at left and three right-aligned measurements. Hover adds a neutral wash. Selection uses the pale selected wash and a 3px inset cobalt rail. Threshold color changes at 75% for warning and 90% for critical.

### Gauge and History Plot

Gauges are thin four-pixel tracks divided into three equal cells on desktop and stacked on mobile. Fill changes from cobalt to warning orange or critical red at the same thresholds as rows. Historical CPU, memory, and disk lines use cobalt, indigo, and green respectively against a light ruled grid; axes and timestamps remain muted mono.

## Do's and Don'ts

### Do:

- **Do** organize dense information with one-pixel rules, aligned cells, and the 6/8/12/18/24px spacing rhythm.
- **Do** keep current readings and historical series visually adjacent to the selected system.
- **Do** preserve native sans for prose, Archivo for the single display moment, and mono tabular numerals for telemetry.
- **Do** make abnormal state immediately scannable through semantic color and plain-language error boundaries.
- **Do** honor reduced-motion preferences while keeping default transitions brief and mechanical.

### Don't:

- **Don't** introduce rounded cards, pill controls, glass effects, or decorative gradients.
- **Don't** use orange or red as brand decoration or for normal readings.
- **Don't** add shadows to ordinary panels, rows, gauges, or charts.
- **Don't** collapse the chart's information density on mobile; preserve the plot and allow deliberate horizontal inspection.
- **Don't** imply that Beszel Lens replaces Beszel administration or is an official Beszel product.
