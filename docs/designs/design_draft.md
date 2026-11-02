# Blood Sugar Calculator: trustworthy conversion and delivery

- Author: Richard Crane with repository design assistance
- Status: Approved; Goldfish reviewed and ready for implementation
- Date: 2026-11-02
- Baseline: application source at `5822c87`; branch governance added separately

## Overview

The application is a public static website that converts A1C percentages and
estimated average glucose in mg/dL or mmol/L. It includes educational pages,
shareable timestamped results, social/email sharing, an external ChatGPT
handoff,
and consent preferences. Calculations run in the browser; several deliberate
sharing actions and remote dependencies send requests outside it.

This design will make calculation state, shared links, accessibility, and data
movement explainable and testable while preserving the static
HTML/CSS/JavaScript
application. Development follows `feature/<topic>` → `develop` → `main` with
automatic Copilot code review on develop PRs. The design-review workflow adds
fresh-context Goldfish review followed by an Impeccable review of the interface.

## The Problem

The most urgent source finding is URL-imported result text reaching `innerHTML`
without validation. Shared links can supply both markup and fabricated numbers.
Ordinary input edits can also leave an old result available for sharing.
Changing
glucose units leaves mg/dL hints and constraints in place. These behaviors
reduce
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

## Approval and Decisions

The owner approved everything on 2026-11-02 after the initial Overview and
Goals.
Proceed through the requested reviews and implementation without further section
approval prompts. The following conservative implementation choices resolve the
recorded questions; they preserve the application's scope and incumbent look.

- Keep educational conversion and the optional ChatGPT handoff. Replace the
  fixed treatment target with a request for an explanation and questions to ask
  a healthcare professional. Preview the exact values/prompt and destination
  before opening the external site. Never imply AI advice is medical care.
- Preserve accepted input ranges: A1C 4–20%, eAG 70–600 mg/dL or 3.9–33.3 mmol/L.
  They are input limits, not diagnostic thresholds or reciprocal output limits.
  Calculate at full precision; round only displayed mg/dL to an integer and
  displayed A1C/mmol/L to one decimal. Do not derive mmol/L from rounded mg/dL.
- New share links use a URL fragment with version, direction, numeric input,
  units when relevant, and timestamp. Include no authoritative result fields.
  Legacy query links remain readable after validation/recomputation; remove the
  health query from the current address and replace it with the new fragment.
  The initial legacy request has already reached the host and cannot be undone.
- Retain the existing pinned CSS/font resources for this refinement and disclose
  their network requests. Replace the executable donation widget with its static
  donation link. Do not add analytics, advertising, accounts, or persistence of
  health measurements. Consent preferences remain localStorage, not cookies.
- Use an allowlisted static publish directory so skill bundles, design notes,
  and tests are not deployed as application content. Keep Azure production on
  main and test feature PRs without deploying them to production.

## Critical User Journeys

### Convert and revise

Given an empty calculator in either direction, when a user selects a unit,
enters an in-range value and presses Enter or Calculate, then the page displays
the recomputed estimate and explicit units, announces completion without reading
the entire sharing toolbar, and offers sharing. Editing any contributing field
immediately clears the old calculation and sharing state. Invalid/blank input
shows a linked, announced error and focuses the relevant input.

### Open a shared calculation

Given a new fragment link or a legacy query link, when the page loads, then it
validates the bounded payload and date, direction, units, and finite numeric
input against the same ranges as typed input. It recomputes the result and marks
the imported timestamp as the link's supplied time, not verified provenance.
Malformed, unsupported, oversized, or out-of-range data shows a recoverable
error without rendering supplied HTML. No supplied result is authoritative.

### Share or ask for an explanation

Given a current result, when a user chooses sharing or ChatGPT, then a native
confirmation dialog names the destination, exact data, and privacy consequence.
Cancel sends nothing. Confirm copies a link or opens the named destination with
noopener/noreferrer. A missing clipboard API falls back to selectable link text.
Anyone with the link can decode its health values; fragments reduce automatic
server transmission but do not encrypt content. Social services may process the
entire submitted link. Refreshing a result while confirmation is open cancels
it.

### Preferences and reading

Given any user-facing page, a user can reach its main content, open/close mobile
navigation, expand educational sections, and accept/reject/customize preferences
using keyboard controls. The preferences panel is a nonmodal region, hidden
controls are removed from focus order, and returning to Manage Preferences moves
focus to its heading. No unnecessary modal interrupts calculation.

## Technical Plan (Architecture)

Keep seven HTML pages with shared CSS and JavaScript. Extract only the pure
conversion/validation/link codec into `js/calculator.js`, reusable in Node tests
and the browser with no bundler or runtime dependency. `js/script.js` retains
DOM wiring, navigation, preferences, results, external actions, and accordions.
Move and adapt the existing formula and base64url helpers rather than retaining
two implementations. Before defining local `.hidden` and `[hidden]` with
`display:none !important`, replace all seven desktop navigation utility pairs
`hidden md:flex` with `desktop-navigation`, whose local CSS hides below 768px
and displays flex at/above 768px. Locally hide the mobile toggle at/above 768px.
All functional hidden states remain hidden if Tailwind fails; test that failure
mode and desktop/mobile navigation with and without the CDN.

```text
typed value or URL payload → shared validator → full precision conversion
                                         → safe DOM text → current result
current result → explicit destination confirmation → fragment link / handoff
repository source → allowlisted static publish → Azure Static Web Apps
```

Use a single active calculation object. Clear it when any input/unit/direction
changes. Generate all displayed values, explanations, timestamps, share text,
and AI prompts from this validated object. Construct result nodes with
textContent
or createElement, never imported innerHTML. Reject all unsupported
versions/types
and nonfinite/wrongly typed numbers. Limit encoded payloads to 2048 characters;
accept legacy numeric input strings only if the whole string is a finite number.
Legacy result fields are ignored. Invalid dates never reach the formatter.

New payload shape: `{v:1,type,input,units?,date}`. Types are `a1c-to-eag` and
`eag-to-a1c`; units are `mgdl` or `mmoll`. Dates must parse to a finite instant;
future/old dates are not treated as clinical evidence. Unknown extra keys are
discarded. A date is a canonical UTC ISO timestamp matching
`new Date(date).toISOString()` exactly, with a finite instant. URLs preserve
unrelated query parameters but remove legacy `c`.
The namespace is `#c=<base64url JSON>`. A fragment `c` key takes precedence over
query `c`, even when empty or invalid; a rejected fragment never falls back to
the query. An unrelated anchor is ignored and allows legacy query import.
Multiple `c` keys in the selected source are invalid. Fragment sharing uses the
same base64url JSON encoding as the old links; legacy imports explicitly opt
into whole-string numeric input conversion. New schemas require numeric input.

`js/calculator.js` exposes `BloodSugarCalculator` in browsers and
`module.exports`
in Node. Its public functions are `createCalculation({type,input,units,date})`,
`encodeCalculation(calculation)`, `decodeCalculation(encoded,{legacy:false})`,
`readCalculationUrl(url)` and `generateShareUrl(url,calculation)`. Creation
requires
finite numeric input; typed input is converted by the DOM layer only after an
entire nonempty numeric string passes validation. Creation returns a canonical
object with input fields plus full-precision `a1c`, `eagMgdl`, and `eagMmoll`.
Encoding serializes only canonical input fields. Invalid data throws an Error
with fixed, recoverable text; never echo supplied payloads. A missing URL import
returns null; a valid import returns `{calculation,source}` where source is
`fragment` or `query`. Generated links replace the fragment and remove query
`c`.
Numeric text is trimmed, then must match `^(?:\d+(?:\.\d*)?|\.\d+)$` in ASCII
decimal notation. Accept `7`, `7.0`, `4.11`, `.5`, `7.`, and surrounding
whitespace
before applying ranges. Reject signs, exponents, radix prefixes, separators,
units, trailing text, empty input, and nonfinite values. The same grammar
applies
to typed input and legacy string input; new links accept numbers only.

Use a real form with novalidate and a submit handler so browser range bubbles do
not compete with accessible application errors. Hide/disable the inactive input.
Update the active glucose input's label, min/max/step/hint when units change;
clear input on unit changes to prevent silently reinterpreting an old number.
Keep input precision rather than reformatting the user's entered value in the
explanation. Announcements live separately from the visible result toolbar.
`index.html` loads `js/calculator.js` immediately before `js/script.js`. The
form
contains direction, units, inputs and Calculate only; close it before results.
Only Calculate is `type="submit"`; all share, preference, navigation, and dialog
buttons are explicitly `type="button"`. Opening any share preview must preserve
the calculation's timestamp and must not submit the form.

The external-action dialog uses native `<dialog>` focus handling plus a Cancel
button. It shows exact destination and payload, restores invoking focus, and
closes if input changes. Do not open a window or mail client before
confirmation.
If popups are blocked, offer an explicit destination link after confirmation.

Validate consent version, booleans, and finite timestamp before reuse; expire at
12 calendar months. A malformed record is absent. Storage failures keep the
calculator operational. There is currently no configured tracking loader, so
state that preferences control the consent signal rather than claiming existing
tracking cookies. Remote CSS/fonts requests happen regardless of those toggles.

Preserve blue navigation, white calculator panel, pale page background, Roboto
with system fallback, existing educational content and layout. Add visible
focus,
44px actions, wrapping share controls in normal flow, live errors, accessible
accordion state, reduced-motion handling, and a skip link. Record actual design
tokens in the existing root design file, `.impeccable/design.json`, PRODUCT.md,
and per-surface briefs. Case-insensitive filesystems must not receive a
competing
DESIGN.md alongside the existing `design.md`; rename it through a temporary path
to canonical `DESIGN.md` without creating
a competing case variant.

## Alternatives Considered

- A framework/backend rewrite would add migration and data-storage work without
  addressing the current converter's problems more directly. Keep static assets.
- Removing all sharing would eliminate a useful existing function. Fragment
  links plus explicit disclosure preserve it without treating encoding as privacy.
- Keeping query links for new exports would continue sending values in initial
  hosting requests. Read legacy links but write fragments only.
- Trusting stored result fields would preserve forged numbers and markup risk.
  Recompute from input, even if an old rounded result changes by one unit.
- A focus-trapped consent modal would interrupt conversion unnecessarily.
  Use a nonmodal region; reserve a dialog for deliberate external data transfer.
- Self-hosting every existing stylesheet/font is outside this surgical reliability
  change. Keep documented dependencies; remove the arbitrary executable widget.

## Risks and Limits

The converter remains an estimate; no claim of medical approval or individual
target follows from the equation. Clinical resource text needs source-specific
verification and a qualified review before expanding medical advice. Remove
unsubstantiated approval/compliance wording from product metadata and docs.
Preserve factual copy otherwise. Reference the ADA's converter documentation for
the equation and explain that estimated averages do not replace measured
results.
See [formula requirements](../../requirements.md), the
[ADA converter](https://professional.diabetes.org/glucose_calc), and
[NIDDK
explanation](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test).

Operational branch checks are already installed, but do not resist a malicious
repository writer executing another Actions workflow. See
[branch workflow](../branch-workflow.md) for the independently hosted App /
trusted
organization-workflow alternative. Do not claim that stronger protection here.
CODEOWNERS and its ruleset flag were intended to add workflow review. Live
verification showed owner-authored PR #6 mergeable under the zero-approval
configuration; it is not an independent approval barrier. Do not claim that
unverified gate exists. Keep any actually required approvals intact.

## Detailed Implementation Plan

1. Complete the five fresh-context Goldfish stages. Save raw reports and a
   consolidated findings/disposition matrix. Amend this design before app edits.
2. Write PRODUCT.md, update existing `design.md` with actual tokens and
canonical
   sections, write its sidecar and calculator/reading surface briefs. These are
   product/design context, while agent rules remain exclusively in AGENTS.md.
3. Leave EGM's design-only workflow. Implement the pure calculator/link module,
   wire typed and imported calculation through it, and add real form semantics.
4. Implement state invalidation, safe results, explicit external transfer
preview,
   nonmodal preferences, live announcements, navigation and accordion semantics,
   touch sizing, focus visibility, and reduced motion without redesigning pages.
5. Correct privacy/cookie/AI notes and unsupported blanket claims. Remove the
   donation script, retain its link, and set no-referrer policy on user pages.
6. Add a deterministic allowlist publisher and wire Azure to its output folder.
   Add CI validation on develop/main PRs using the standard-library unit tests,
   JavaScript syntax checks, and publisher check. Keep production deploy on main.
7. Apply [cloud-review findings](cloud-review-findings.md) G1–G6: rehash cached
   engines on every cache launch, fix concrete upstream-document links, correct
   bootstrap's fallback test, and record local patches. Preserve skill methods.
8. Run Impeccable's independent design and detector/browser assessments on the
   implemented interface, persist the critique, apply its findings, and inspect
   the finished result at mobile and desktop sizes. Capture exact limitations.
9. Commit real changes on the feature branch, monitor automatic develop review,
   resolve addressed threads, and leave required independent approvals intact.

Review instructions: [Goldfish
protocol](../../.agents/skills/egm-review/SKILL.md),
[Impeccable critique](../../.agents/skills/impeccable/reference/critique.md),
and
[design documentation](../../.agents/skills/impeccable/reference/document.md).
Reports live beside this draft. Surface briefs are written using the installed
`impeccable surface-brief write` command for `index.html` and `resources.html`
(related: tips, about, privacy, terms, cookie). The sidecar lives at
`.impeccable/design.json`, and root `PRODUCT.md` holds product context.

Changed production files: `js/calculator.js` (new), `js/script.js`,
`css/styles.css`, all seven user-facing root HTML pages, README, requirements,
and `docs/AskChatGPT.md`. Add `tests/calculator.test.js`,
`scripts/build_static.py`, `tests/test_build_static.py`, and
`.github/workflows/validate.yml`; update the existing Azure workflow to run
`python3 scripts/build_static.py` and deploy `.output/public` with app build
skipped. The publisher uses exactly these relative paths, with no recursive
directory copying or wildcard extension matching:

```text
index.html about.html cookie.html privacy.html resources.html terms.html tips.html
googlebf96f5e560998a67.html robots.txt sitemap.xml site.webmanifest
android-chrome-192x192.png android-chrome-512x512.png apple-touch-icon.png
favicon-16x16.png favicon-32x32.png favicon.ico og-image.png
css/styles.css js/script.js js/calculator.js
img/richard_crane_profile.jpeg img/richard_crane_profile.png
```

Refuse symlinked `.output` or `.output/public`, any symlink in a selected source
path's ancestry, and any symlink inside an existing output tree. Fail on a
missing required asset before replacing output. Recreate `.output/public` on
every successful build so stale forbidden files cannot survive. Unlisted source
files are ignored. Tests seed forbidden output, add an unlisted root HTML file,
and exercise file/directory/output symlinks and a missing required file. CI runs
`node --test tests/*.test.js`, `node --check js/script.js`,
`python3 -m unittest discover -s tests -p 'test_*.py'`, and the publisher.
Azure PR previews stay scoped to main; validation runs on main/develop PRs.

### Stable Phase Exits

1. Pure module and its Node tests must pass before DOM integration.
2. DOM integration includes safe rendering, state invalidation, form semantics,
   link migration, and UI checks as one phase; pass the listed native browser
   checks and Node regressions before declaring it complete.
3. Shared-page changes pass keyboard/mobile/desktop checks, including a fixture
   without remote CSS, before publisher integration.
4. Publisher/CI passes positive and negative publication tests plus syntax
checks.
5. Tooling patches pass cached-engine tamper tests and installed link checks.
6. Impeccable findings are applied, then repeat only tests implicated by the
   changes and inspect the final mobile/desktop result before committing.

## Validation and Acceptance

- Node's built-in test runner covers formulas, full-precision rounding, all input
  limits, empty/nonfinite values, strict numeric parsing, codec round trips,
  wrong schema/types/units/dates, oversized input, hostile HTML result fields,
  and legacy result recomputation.
- Browser checks use synthetic inputs: 7% → 154 mg/dL and 8.6 mmol/L; 154 mg/dL
  → 7.0%; 8.6 mmol/L → 7.0%. Edge outputs may lie outside reverse input limits.
  Test Enter, invalid recovery, input edits, unit changes, imported timestamps,
  sharing cancel/confirm, unavailable clipboard, and preferences reload.
- Run keyboard checks, automated accessibility checks where tooling is available,
  and visual inspection at 390px and 1280px. Check short mobile preference panels,
  visible focus, result announcements, toolbar wrapping, and reduced motion.
- The generated publish directory contains application assets only and no
  `.agents`, `.github`, docs, tests, or private/local files. Verify output contents
  and require CI to run those checks; do not equate local proof with live deployment.
- Reports map each Goldfish/Impeccable finding to code or an explicit residual
  limitation. A launched review is not a completed review. Final delivery names
  remaining approval/deployment gates without marking them complete.
