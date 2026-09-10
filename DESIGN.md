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
  elevated-gold: "#9b7211"
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
    fontSize: "1.6rem"
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
  condition:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
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
    padding: "clamp(11px, 0.8vw, 16px)"
  system-card-hover:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  metric-bar:
    backgroundColor: "#d8d6cc"
    textColor: "{colors.ink}"
    rounded: "{rounded.cap}"
    height: "clamp(6px, 2.5cqw, 9px)"
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

Beszel Lens is a warm, compact field of live instrument cards that uses the full viewport rather than stopping at an arbitrary desktop container. It keeps the calibration-sheet precision of muted paper, exact rules, terse labels, and cobalt measurement ink, then makes the fleet easier to scan through restrained rounding and a risk-driven reading order. The result feels operational and composed rather than decorative.

The interface leads with the system that needs attention most. Each card explains why it holds that position in one compact condition line, then exposes CPU, RAM, the primary disk, and every extra drive as semantic utilization bars. Neutral cards form the steady baseline; exception color appears at the border, condition, and individual bars only when warranted. Selecting a card expands a nonmodal inspection panel directly above the grid while preserving the fleet's ranked order. Motion is short and mechanical: cards lift by one pixel, the detail panel settles into place, gauges calibrate, and loading bars scan.

**Key Characteristics:**

- A full-viewport auto-fill grid fluidly targets 230–320px cards and puts the highest-risk system first.
- Warm neutral surfaces carry normal state; color is concentrated on interaction and exceptions.
- Fourteen-pixel cards and nine-pixel controls soften the instrument language without becoming pill-heavy.
- Compact condition copy explains rank without a large risk number.
- Circular status marks and size-responsive, fully capped utilization bars provide live-state cues.
- A full-width inline detail panel places current and historical readings directly before the ranked grid.

## Colors

The palette preserves archival neutrals and cobalt interaction ink while assigning a discrete green/gold/orange/red sequence to utilization severity.

### Primary

- **Cobalt Measurement Ink:** Owns primary actions, focus, selection rings, CPU plots, progress, and loading motion.

### Secondary

- **Neutral Indigo Reading:** Distinguishes memory history without competing with selection and interaction.
- **Healthy Green:** Marks online status, healthy utilization below 60%, and disk history.

### Tertiary

- **Elevated Gold:** Marks utilization from 60% until the warning threshold, distinguishing a rising reading from both healthy and actionable states.
- **Warning Orange:** Marks utilization at the warning threshold, warning-card borders, compact warning conditions, and pending state.
- **Critical Red:** Marks utilization at 90% and above, critical-card borders, compact critical conditions, unavailable systems, and failure boundaries.

### Neutral

- **Warm Paper:** The default card, summary, detail-panel, and sheet surface.
- **Raised Paper:** A brighter hover and input surface that provides quiet tactile feedback.
- **Workshop Canvas:** The page field behind the fleet.
- **Exact Ink:** Primary text and active segmented controls.
- **Muted Ledger Ink:** Supporting copy, labels, timestamps, and secondary metadata.
- **Rule and Strong Rule:** Two levels of quiet structure for card borders, dividers, and controls.
- **Neutral Wash:** The normal risk-summary field and neutral hover fill.
- **Warning and Error Washes:** Localized fields inside the detail panel and inline error boundaries.

### Named Rules

**The Semantic Bar Rule.** Utilization bars progress through healthy green, elevated gold, warning orange, and critical red. An unavailable reading uses a neutral diagonal stripe, never a fabricated zero.

**The Exception Edge Rule.** Warning and critical color belongs on the card edge and its compact condition; keep the card body neutral so the fleet remains scannable.

**The One Cobalt Rule.** Cobalt owns action, focus, active measurement, and selection. Do not introduce a second interactive accent.

## Typography

**Display Font:** Archivo Variable (with sans-serif fallback)  
**Body Font:** Native UI sans-serif stack  
**Label/Mono Font:** Native UI monospace stack

**Character:** Archivo gives the connection title and expanded detail alert compact technical authority. Native sans keeps card names and rank explanations immediate, while monospaced tabular readings preserve measurement alignment.

### Hierarchy

- **Display:** Bold, tightly tracked, and compact; used for the Beszel Lens connection title.
- **Signal:** Heavy Archivo with tight tracking; reserved for the dominant risk value inside the expanded detail alert, not fleet cards.
- **Title:** Bold native sans with slightly tightened tracking; used for fleet, product, and selected-system titles.
- **Body:** Regular native sans with a relaxed reading line height; used for instructions, notices, and empty-state copy.
- **Condition:** Compact bold native sans; names the reason a card holds its place in the risk order.
- **Label:** Bold compact mono with expanded tracking; used for the brand index, metric names, counts, timestamps, and range controls.
- **Reading:** Bold mono with tabular numerals; used for gauges, percentages, and fleet totals.

### Named Rules

**The Condition-First Rule.** Every system card states why it is ranked in one compact condition line; do not repeat a large risk number in the grid.

**The Measured Number Rule.** Operational numbers use Archivo signal type or monospaced tabular figures according to hierarchy; prose never imitates telemetry styling.

## Layout

The dashboard occupies the full viewport width with fluid 10–28px horizontal padding. A low ruled header leads into a rounded four-cell fleet summary and then the priority heading. The fleet uses `auto-fill` tracks whose target minimum is itself fluid from 230px to 320px (`clamp(230px, 14vw, 320px)`), while never exceeding the available width. Gaps scale from 8px to 14px. Risk tone, weighted score, name, and stable ID determine DOM and reading order.

Cards establish an inline-size container so header type and utilization-track thickness respond to the actual card width rather than only the viewport. At 720px, the summary becomes three count cells with refresh spanning the next row. At 520px, the grid becomes a single full-width column, the external action becomes icon-only, gauges stack, and range tabs stretch across the detail panel. The history plot keeps a 520px minimum width inside deliberate horizontal overflow.

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
- **Internal Padding:** Card padding scales from 11px to 16px. Content has three bands: identity, compact rank condition, and a variable-length utilization stack.

### Inputs / Fields

- **Style:** Raised-paper field, one-pixel strong neutral stroke, 9px radius, and 12px by 13px inset.
- **Focus:** Border changes to cobalt and gains a 3px translucent cobalt outline.
- **Error / Disabled:** Errors use critical red rules and a pale red wash. Busy controls reduce opacity and retain an explicit wait cursor.

### Navigation

The top bar is a low, bottom-ruled instrument header. The brand index uses cobalt mono text; product name and actions remain neutral. External navigation is labeled on wider screens and collapses to a 40px icon target below 520px.

### Fleet Summary

Four softly rounded, internally divided cells present system count, online count, attention count, and freshness/action. Labels are small uppercase text; values are larger tabular mono readings. Attention changes to critical red only when nonzero.

### Risk Card

Each card has three dense bands: status/name/uptime, a compact explanation of the dominant risk condition, and a variable-length stack of utilization bars. No large risk number appears in the grid. Cards are ordered from highest risk to lowest. Hover brightens and lifts the card; selection adds a cobalt border and ring. Warning and critical states preserve the neutral surface while coloring the border and condition.

### Utilization Bar

Cards always show CPU, RAM, and the primary drive, followed by every extra drive in descending utilization order. Labels truncate safely; values remain visible as tabular numerals. Track height responds to card width from 6px to 9px. Fills are clamped to 0–100% and use healthy green below 60%, elevated gold from 60%, warning orange from the metric's warning threshold, and critical red from 90%. Missing readings show an em dash and a neutral diagonal-striped track.

### Detail Panel

The nonmodal detail panel is a full-width inspection region placed immediately above the grid. Its header contains system identity and a close action; a localized alert summarizes dominant risk; capped gauges show current CPU, memory, and disk; the plot and range controls show history. Escape and the close button collapse it without changing fleet order.

### Gauge and History Plot

Gauges use five-pixel fully capped tracks. Fill changes from cobalt to warning orange or critical red at the same thresholds as card telemetry. Historical CPU, memory, and disk lines use cobalt, indigo, and green respectively against a light ruled grid; axes and timestamps remain muted mono.

## Do's and Don'ts

### Do:

- **Do** rank system cards by risk tone and weighted score, then by name and stable ID.
- **Do** use the full viewport and the fluid 230–320px auto-fill card tracks with 8–14px gaps.
- **Do** explain each card's risk rank with a compact condition rather than a large score or percentage.
- **Do** show CPU, RAM, the primary drive, and every extra drive as size-responsive semantic bars.
- **Do** distinguish healthy, elevated, warning, critical, and unavailable readings without collapsing them into one accent.
- **Do** keep normal card surfaces neutral and concentrate exception color on borders, conditions, individual bars, and localized alerts.
- **Do** use 14px cards, 9px controls, and full caps for status and progress geometry.
- **Do** inspect a selected system in the inline panel above the grid while preserving the risk-ranked card order.
- **Do** honor reduced-motion preferences while keeping default transitions brief and mechanical.

### Don't:

- **Don't** turn the fleet back into a sequential table or manually arranged dashboard grid.
- **Don't** reintroduce a large dominant risk number inside fleet cards.
- **Don't** omit extra drives or present unavailable readings as zero.
- **Don't** flood warning or critical cards with saturated background color.
- **Don't** use pill shapes for text actions, cards, or general containers.
- **Don't** add elevation to resting cards or summary cells.
- **Don't** collapse the chart's information density on mobile; preserve the plot and allow deliberate horizontal inspection.
- **Don't** imply that Beszel Lens replaces Beszel administration or is an official Beszel product.
