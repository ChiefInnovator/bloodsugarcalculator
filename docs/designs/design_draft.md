# Blood Sugar Calculator: trustworthy conversion and delivery

- Author: Richard Crane with repository design assistance
- Status: Draft — Overview and Goals awaiting owner approval
- Date: 2026-11-02
- Baseline: application source at `5822c87`; branch governance added separately

## Overview

The application is a public static website that converts A1C percentages and
estimated average glucose in mg/dL or mmol/L. It includes educational pages,
shareable timestamped results, social/email sharing, an external ChatGPT handoff,
and consent preferences. Calculations run in the browser; several deliberate
sharing actions and remote dependencies send requests outside it.

This design will make calculation state, shared links, accessibility, and data
movement explainable and testable while preserving the static HTML/CSS/JavaScript
application. Development follows `feature/<topic>` → `develop` → `main` with
automatic Copilot code review on develop PRs. The design-review workflow adds
fresh-context Goldfish review followed by an Impeccable review of the interface.

## The Problem

The most urgent source finding is URL-imported result text reaching `innerHTML`
without validation. Shared links can supply both markup and fabricated numbers.
Ordinary input edits can also leave an old result available for sharing. Changing
glucose units leaves mg/dL hints and constraints in place. These behaviors reduce
confidence in the calculator's displayed result.

The documentation promises privacy and accessibility more broadly than the
implementation demonstrates. Sharing links and external AI requests carry health
values; an encoded URL does not make them private. The consent panel declares
modal behavior without implementing keyboard focus management. Existing design
notes and completed todo entries do not provide acceptance evidence.

See [repository assessment](repository-assessment.md) for examined surfaces,
source references, arithmetic inconsistencies, dependency risks, and explicit
limits on what this review establishes.

## Goals

1. A shared URL cannot execute supplied markup or dictate the displayed numeric
   output. Valid imports are checked and their results recomputed from inputs.
2. Input, direction, and unit changes cannot leave an apparently current result
   or share action representing an earlier state.
3. One approved precision/range contract governs typed and imported inputs,
   both directions, unit hints, displayed values, and regression examples.
4. Users can complete conversion, recover from errors, manage consent, and use
   educational accordions with a keyboard and announced state changes.
5. Sharing and AI handoff describe which values leave the browser before the
   transfer. Documentation matches actual storage and external requests.
6. Changes reach protected main only through develop; develop accepts feature
   PRs only. Cloud Copilot review is automatically scoped to develop PRs.
7. Each Goldfish and Impeccable finding has an explicit disposition, implemented
   fix or recorded owner decision, and an appropriate verification result.

## Non-Goals

- Adding diagnosis, medication dosing, individualized treatment targets, or
  new clinical claims.
- Introducing accounts, cloud health-data storage, a backend, or a framework
  migration without an approved product/architecture decision.
- Replacing the visual identity without an approved redesign direction.
- Claiming legal compliance, clinical validation, accessibility conformance,
  deployment acceptance, or successful cloud review from installation alone.

## Open Questions

- Should the external AI handoff stay within educational explanation, be
  removed, or retain its present scope with an explicitly approved policy?
- Which precision and accepted-range policy should govern forward/reverse
  conversion and legacy shared links?
- Which sharing representation and legacy-link behavior should be adopted?
- Which external assets/scripts are necessary, and which should be hosted
  locally or removed? What deployment output should exclude repository tooling?

These are recorded questions, not simultaneous requests for answers. Resolve
one material choice at a time while drafting the technical plan.

## Remaining Draft Sections

Critical user journeys, technical plan, alternatives, detailed implementation
steps, and validation are pending Overview and Goals approval under EGM's
section approval gate. This document has not yet had a Goldfish review.
