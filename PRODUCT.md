# Blood Sugar Calculator

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and browser JavaScript; Azure Static Web Apps. No application
backend, accounts, database or framework. Node and Python are development/test
tools, not production runtimes. Existing pinned Tailwind and Google Fonts remain
network dependencies; local CSS owns functional hiding and navigation states.

## Users

Assumption accepted under the owner's 2026-11-02 approval to proceed: people
trying to understand the relationship between an A1C percentage and estimated
average glucose, on a phone or desktop. No clinician workflow is claimed.

## Product Purpose

Convert A1C to estimated average glucose (eAG) and back, with clear units and
educational explanations. Success means a current, comprehensible estimate that
can be revised, shared deliberately, and distinguished from medical advice.

## Capabilities and Constraints

- Both conversion directions; mg/dL and mmol/L. Preserve existing input limits:
  4–20% A1C, 70–600 mg/dL, 3.9–33.3 mmol/L. Limits are not diagnostic targets.
- Full-precision calculation, rounded display; imported results are recomputed.
- Shareable timestamped links and optional social/email/ChatGPT handoffs. Health
  data transfers require an explicit destination/data preview. Encoding is not
  encryption; anyone receiving the link can read its values.
- New links use fragments; legacy query links are still understood. The initial
  request for a legacy query already reaches the host.
- Preferences use localStorage. No health records are deliberately persisted
  there. Existing browser history and receiving services can retain shared data.
- Educational content lives on resources/tips pages. No diagnoses, medication
  dosing, universal treatment goals, clinical approval, or compliance claims.

## Brand Commitments

Preserve the existing eAG/A1C Diabetes Calculator name, calculator-first layout,
blue navigation, light surfaces, and current assets. This task refines an
incumbent interface; it does not establish a new brand or visual world.

## Evidence on Hand

Application source, [approved design](docs/designs/design_draft.md),
[source assessment](docs/designs/repository-assessment.md), and Goldfish reports.
The [ADA converter](https://professional.diabetes.org/glucose_calc) supplies the
equation. [NIDDK](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test)
explains estimated averages and A1C limitations. Neither source endorses this app.

## Accessibility and Inclusion

Keyboard conversion and recovery, announced results/errors, visible focus,
44px actions, reflow on phones, and reduced motion. Verify the finished build;
these requirements do not establish whole-site accessibility conformance.
