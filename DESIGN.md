---
name: Blood Sugar Calculator
description: Clear educational conversion between A1C and estimated average glucose.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  page: "#f3f4f6"
  surface: "#ffffff"
  text: "#333333"
  heading: "#1f2937"
  secondary-text: "#4b5563"
  muted-text: "#6b7280"
  result: "#eff6ff"
  border: "#d1d5db"
  error: "#dc2626"
  result-border: "#bfdbfe"
  action-text: "#374151"
  preference-panel: "rgba(17, 24, 39, 0.98)"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
  headline:
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  section-title:
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333333
  supporting:
    fontSize: "0.875rem"
    lineHeight: 1.428571
  label:
    fontSize: "1rem"
    fontWeight: 500
  result:
    fontSize: "1.5rem"
    fontWeight: 700
rounded:
  compact: "4px"
  control: "6px"
  panel: "8px"
spacing:
  small: "8px"
  medium: "16px"
  panel: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  result-panel:
    backgroundColor: "{colors.result}"
    rounded: "{rounded.control}"
    padding: "16px"
---

# Design System: Blood Sugar Calculator

## Overview

**Creative North Star: “The Clear Conversion Desk.”** Preserve the incumbent
blue navigation, pale page, white calculator and familiar controls. The owner
approved refinement of this existing system, not a replacement visual world.
The useful distinction is between input, calculated estimate, and deliberate
sharing; decoration must not compete with those states.

**Key Characteristics:**

- Familiar controls
- Explicit units
- Current state
- Deliberate sharing

## Colors

The palette pairs a single clear blue accent with light neutral surfaces.

### Primary

- **Conversion blue:** navigation, Calculate, selected radios and preference
toggles,
  confirmation actions, and result emphasis. The deeper hover blue also marks
focus.
- **Estimate blue:** pale result fill and its light blue border distinguish an
estimate
  from editable fields without adding elevation.

### Neutral

- **Page gray / white surface:** the page surrounds white calculator and reading
panels.
- **Dark text / heading:** body copy and section hierarchy; supporting grays
serve hints,
  timestamps and disclosures.
- **Preference charcoal:** a translucent dark panel with light text and blue
links.

Errors use red text and a labeled, pale red bordered container, never color
alone.

**The State Clarity Rule.** Distinguish input, estimate and error with labels
and
structure as well as color.

## Typography

Tailwind's existing font-sans stack is the UI authority. Roboto is among its
fallbacks and is requested from Google Fonts; do not infer that it wins the
class's specificity. Use 16px body/controls, 14px supporting text, 24px result
values and clear heading steps. Page headlines grow from 30px/36px to
36px/40px at the desktop navigation breakpoint; section titles use 24px/32px,
sidebar titles 20px/28px and minor headings 18px/28px. Use tabular numerals for
results. Keep explanatory
prose readable; no new display font or ornamental uppercase labels.

## Layout

Retain the existing 64rem maximum content width. Calculator and educational
sidebar use the incumbent two-column desktop layout at 1024px and stack below.
Desktop navigation starts at 768px; mobile navigation and its toggle own smaller
widths. Share actions wrap with an 8px gap in normal flow after the result text.
Reading paragraphs and list items stop at 70ch. Panel padding and column gaps
use the 24px step, with 16px content gutters. Preferences occupy normal document
flow after the footer, with internal scrolling capped at the smaller of 70dvh
and 36rem; they never cover page content. Local CSS owns
functional hiding and navigation even when remote Tailwind fails.

## Elevation & Depth

Preserve the incumbent soft panel shadow. Results use their existing one-pixel
blue border without an additional shadow. The external-action dialog is above
the page using native top-layer behavior, a dim backdrop and a deeper soft
shadow. The preference panel has an upward soft shadow. Focus uses a three-pixel
deep blue outline with a three-pixel offset; existing input/button glow remains.
Exact shadow and motion values live in the sidecar.

## Shapes

Inputs, primary buttons and disclosures use gently curved control corners;
calculator panels and the dialog use the larger panel radius. Compact navigation
and share buttons keep the smaller compact radius. Buttons, support links, radio
labels and disclosure summaries have a 44px minimum height. Custom-styled radio
inputs retain circular outlines and a white selected dot.

## Components

### Buttons and fields

Calculate is a full-width blue button with white medium-weight text and a deeper
hover state. Number fields use white fill, a gray one-pixel border and visible
focus. Labels and hints remain beside the fields. Invalid fields connect to a
visible error. Preference actions share the blue primary treatment; secondary
and outline variants sit on the charcoal panel.

### Cards and result

White calculator and reading panels use soft shadows and generous panel padding.
The result uses a pale blue fill, thin blue border and no extra shadow. Result
numerals are bold and tabular, followed by units, explanation and timestamp.
Editing a contributing input clears the stale result.

### Navigation and reading

A sticky blue bar carries white text and darker hover fills. At smaller widths a
labeled toggle exposes stacked links; local CSS owns hiding independently of the
remote utility sheet. Reading pages retain native headings and gray accordion
buttons with a rotating SVG indicator and exposed expanded state.

### Sharing and preview

Labeled Copy link and Explain with ChatGPT actions stay visible. A native More
sharing disclosure groups social/email controls. Controls wrap after the result
text. A native dialog previews the destination and exact values, with the full
address collapsed in a separate disclosure. Preview text wraps long addresses;
the dialog is at most 34rem wide, fits the viewport and scrolls internally.

### Preferences and motion

Preferences are a nonmodal labeled region in document flow. Hidden controls
leave
the focus order. Binary choices use blue-on/gray-off switches. Short state
transitions and fades support feedback; reduced-motion preference disables all
animations, transitions and smooth scrolling.

## Do's and Don'ts

- Do preserve the incumbent composition and use explicit labels and units.
- Do keep input hints synchronized with the selected units.
- Do expose errors/status to assistive technology without reading a toolbar.
- Don't overlap result text with sharing controls or leave stale results
visible.
- Don't imply that estimates diagnose illness or establish treatment targets.
- Don't describe base64 as encryption, or intentions as compliance evidence.
