---
name: Beszel Lens
description: A live calibration index for risk-ranked fleet health.
colors:
  paper: "#f8f7f1"
  paper-raised: "#fffef9"
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
  neutral-wash: "#efeee7"
  warning-wash: "#fff0e8"
  error-wash: "#fff0ef"
typography:
  display:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(2rem, 7vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  signal:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "1.42rem"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "-0.03em"
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
    fontSize: "0.68rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  reading:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "1.08rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  control: "9px"
  alert: "11px"
  card: "14px"
  cap: "99px"
  status-dot: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  dense: "10px"
  md: "12px"
  lg: "14px"
  xl: "16px"
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
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  system-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "11px 12px 10px"
    height: "146px"
  system-card-hover:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  range-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "0"
    width: "42px"
    height: "32px"
  range-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  detail-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "100%"
---

# Design System: Beszel Lens

## Overview

**Creative North Star: "The Risk Calibration Index"**

Beszel Lens is a warm, compact field of live instrument cards. It keeps the calibration-sheet precision of muted paper, exact rules, terse labels, and cobalt measurement ink, then makes the fleet easier to scan through restrained rounding and a risk-driven reading order. The result feels operational and composed rather than decorative.

The interface leads with the system that needs attention most. Neutral cards form the steady baseline; exception color appears at the border and dominant signal only when risk warrants it. Selecting a card expands a nonmodal inspection panel directly above the grid while preserving the fleet's ranked order. Motion is short and mechanical: cards lift by one pixel, the detail panel settles into place, gauges calibrate, and loading bars scan.

**Key Characteristics:**

- Dense 220px auto-fill cards put the highest-risk system first.
- Warm neutral surfaces carry normal state; color is concentrated on interaction and exceptions.
- Fourteen-pixel cards and nine-pixel controls soften the instrument language without becoming pill-heavy.
- Circular status marks and fully capped progress tracks provide compact live-state cues.
- A full-width inline detail panel places current and historical readings directly before the ranked grid.

## Colors

The palette preserves archival neutrals and cobalt interaction ink while using orange and red as concentrated exception signals.

### Primary

- **Cobalt Measurement Ink:** Owns primary actions, focus, selection rings, CPU plots, progress, and loading motion.

### Secondary

- **Neutral Indigo Reading:** Distinguishes memory history without competing with selection and interaction.
- **Healthy Green:** Marks online status and disk history; it reports health rather than decorating card surfaces.

### Tertiary

- **Warning Orange:** Marks warning-card borders, dominant warning signals, elevated readings, and pending state.
- **Critical Red:** Marks critical-card borders, dominant critical signals, unavailable systems, and failure boundaries.

### Neutral

- **Warm Paper:** The default card, summary, drawer, and sheet surface.
- **Raised Paper:** A brighter hover and input surface that provides quiet tactile feedback.
- **Workshop Canvas:** The page field behind the fleet.
- **Exact Ink:** Primary text and active segmented controls.
- **Muted Ledger Ink:** Supporting copy, labels, timestamps, and secondary metadata.
- **Rule and Strong Rule:** Two levels of quiet structure for card borders, dividers, and controls.
- **Neutral Wash:** The normal risk-summary field and neutral hover fill.
- **Warning and Error Washes:** Localized fields inside the detail panel and inline error boundaries.

### Named Rules

**The Exception Edge Rule.** Warning and critical color belongs on the card edge and its dominant signal; keep the card body neutral so the fleet remains scannable.

**The One Cobalt Rule.** Cobalt owns action, focus, active measurement, and selection. Do not introduce a second interactive accent.

## Typography

**Display Font:** Archivo Variable (with sans-serif fallback)  
**Body Font:** Native UI sans-serif stack  
**Label/Mono Font:** Native UI monospace stack

**Character:** Archivo gives both the connection title and each card's dominant risk value compact technical authority. Native sans keeps names and explanations immediate, while monospaced tabular readings preserve measurement alignment.

### Hierarchy

- **Display:** Bold, tightly tracked, and compact; used for the Beszel Lens connection title.
- **Signal:** Heavy Archivo with tight tracking; used for the dominant risk value on cards and in the drawer alert.
- **Title:** Bold native sans with slightly tightened tracking; used for fleet, product, and selected-system titles.
- **Body:** Regular native sans with a relaxed reading line height; used for instructions, notices, and empty-state copy.
- **Label:** Bold compact mono with expanded tracking; used for the brand index, metric names, counts, timestamps, and range controls.
- **Reading:** Bold mono with tabular numerals; used for gauges, percentages, and fleet totals.

### Named Rules

**The Dominant Signal Rule.** Every system card gets one large risk value and one plain-language risk label; supporting telemetry stays smaller.

**The Measured Number Rule.** Operational numbers use Archivo signal type or monospaced tabular figures according to hierarchy; prose never imitates telemetry styling.

## Layout

The dashboard is a centered, fluid fleet index with a maximum width of 1780px and compact outer padding. A low ruled header leads into a rounded four-cell fleet summary and then the priority heading. The fleet uses an auto-fill grid whose cards grow from a 220px minimum, separated by 10px gaps. Risk ranking determines DOM and reading order, with name used as the stable tie-breaker.

At 720px, the summary becomes three count cells with refresh spanning the next row. At 520px, outer padding tightens to 10px, cards may contract from a 190px minimum, the external action becomes icon-only, gauges stack, and range tabs stretch across the detail panel. The history plot keeps a 520px minimum width inside deliberate horizontal overflow.

Selecting a card inserts a full-width detail panel between the priority heading and the card grid. The panel participates in normal document flow, remains nonmodal, and leaves every fleet card available below it. Closing the panel removes that inspection region without changing risk order.

## Elevation & Depth

Depth is functional and state-based. Resting cards, the fleet summary, and ordinary controls remain flat against the canvas. A card gains a slight one-pixel lift and small ambient shadow on hover; selection uses a cobalt border plus focus-like ring. The connection sheet receives the strongest shadow, while the expanded inline detail panel uses a moderate shadow to distinguish inspection from the grid that follows.

### Shadow Vocabulary

- **Sheet Lift** (`0 18px 50px rgba(37, 35, 26, 0.1)`): Separates the connection sheet from its gridded canvas.
- **Card Hover** (`0 7px 18px rgba(37, 35, 26, 0.07)`): Accompanies the one-pixel hover lift of an actionable card.
- **Card Selection Ring** (`0 0 0 2px rgba(36, 79, 199, 0.16)`): Confirms the selected system without recoloring the surface.
- **Detail Panel Lift** (`0 12px 32px rgba(23, 23, 19, 0.09)`): Separates the expanded inline inspection region from the ranked grid.

### Named Rules

**The State Earns Depth Rule.** Resting fleet surfaces stay flat. Elevation appears only for actionable hover, explicit selection, or the expanded inspection region.

## Shapes

The form language is restrained and rounded. System cards, the fleet summary, empty state, connection sheet, and inline detail panel use a 14px radius. Buttons, inputs, notices, and segmented-control shells use 9px. Risk alerts use an intermediate 11px radius.

Circular geometry is reserved for live indicators and motion tracks: status marks use a true circle, while gauge, boot, loading, and scrollbar tracks use fully capped ends. Internal card dividers and range-tab seams stay straight to preserve measurement precision.

**The Radius Hierarchy Rule.** Use 14px for cards, 9px for controls, and full caps only for status or progress geometry. Do not apply pill shapes to text actions or containers.

## Components

### Buttons

- **Shape:** Compact controls with a 9px radius; internal range-tab seams remain square inside their rounded group.
- **Primary:** Cobalt fill, white text, matching one-pixel border, 46px minimum height, and 20px horizontal inset.
- **Hover / Focus:** Primary actions deepen to dark cobalt; active press moves down 1px. Keyboard focus receives a 3px translucent cobalt outline with 2px offset.
- **Icon / Ghost:** Transparent 40px targets gain a paper fill and strong neutral rule on hover.
- **Close:** A bordered, 38px-high detail-panel control pairs a compact icon with a text label.
- **Range Tabs:** Three joined 42-by-32px mono controls; the 9px group clips the active exact-ink fill.

### Cards / Containers

- **Corner Style:** Restrained 14px rounding for fleet cards and primary surfaces, including the inline detail panel.
- **Background:** Warm paper at rest and raised paper on card hover.
- **Shadow Strategy:** Flat at rest; slight lift on hover, cobalt ring on selection, and moderate separation for the expanded detail panel.
- **Border:** One-pixel neutral rules; warning and critical cards shift only their border and dominant signal to semantic color.
- **Internal Padding:** Cards use a dense 11px by 12px inset and a three-band header/signal/metrics structure.

### Inputs / Fields

- **Style:** Raised-paper field, one-pixel strong neutral stroke, 9px radius, and 12px by 13px inset.
- **Focus:** Border changes to cobalt and gains a 3px translucent cobalt outline.
- **Error / Disabled:** Errors use critical red rules and a pale red wash. Busy controls reduce opacity and retain an explicit wait cursor.

### Navigation

The top bar is a low, bottom-ruled instrument header. The brand index uses cobalt mono text; product name and actions remain neutral. External navigation is labeled on wider screens and collapses to a 40px icon target below 520px.

### Fleet Summary

Four softly rounded, internally divided cells present system count, online count, attention count, and freshness/action. Labels are small uppercase text; values are larger tabular mono readings. Attention changes to critical red only when nonzero.

### Risk Card

Each 146px-tall card has three dense bands: status/name/uptime, dominant risk signal, and a divided CPU/memory/disk footer. Cards are ordered from highest risk to lowest. Hover brightens and lifts the card; selection adds a cobalt border and ring. Warning and critical states preserve the neutral surface while coloring the border and dominant signal.

### Detail Panel

The nonmodal detail panel is a full-width inspection region placed immediately above the grid. Its header contains system identity and a close action; a localized alert summarizes dominant risk; capped gauges show current CPU, memory, and disk; the plot and range controls show history. Escape and the close button collapse it without changing fleet order.

### Gauge and History Plot

Gauges use five-pixel fully capped tracks. Fill changes from cobalt to warning orange or critical red at the same thresholds as card telemetry. Historical CPU, memory, and disk lines use cobalt, indigo, and green respectively against a light ruled grid; axes and timestamps remain muted mono.

## Do's and Don'ts

### Do:

- **Do** rank system cards by computed operational risk, using name only as the stable tie-breaker.
- **Do** use a dense auto-fill grid with a 220px card minimum and 10px gaps on larger screens.
- **Do** keep normal card surfaces neutral and concentrate exception color on borders, dominant signals, and localized alerts.
- **Do** use 14px cards, 9px controls, and full caps for status and progress geometry.
- **Do** inspect a selected system in the inline panel above the grid while preserving the risk-ranked card order.
- **Do** honor reduced-motion preferences while keeping default transitions brief and mechanical.

### Don't:

- **Don't** turn the fleet back into a sequential table or manually arranged dashboard grid.
- **Don't** flood warning or critical cards with saturated background color.
- **Don't** use pill shapes for text actions, cards, or general containers.
- **Don't** add elevation to resting cards or summary cells.
- **Don't** collapse the chart's information density on mobile; preserve the plot and allow deliberate horizontal inspection.
- **Don't** imply that Beszel Lens replaces Beszel administration or is an official Beszel product.
