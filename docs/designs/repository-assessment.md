# Repository assessment

Date: 2026-11-02. Source baseline: application files at `5822c87` (the subsequent
governance commits do not change application behavior). This is a source review,
not a clinical review, browser acceptance, or a completed Goldfish review.

## Coverage

Read all seven user-facing HTML pages, Google verification page, shared JavaScript
and CSS, README, requirements, existing design notes, todo list, Ask ChatGPT notes,
Azure deployment workflow, robots, sitemap, and web manifest. Inspected the image
inventory: favicon variants, author portrait, social preview, and an apparently
unused profile PNG. There is no application backend, package manifest, build step,
or checked-in executable test suite. Tailwind 2.2.19 and Google Fonts load remotely;
the calculator additionally runs a remote donation script.

## Findings to carry into the design

1. **Untrusted shared results can inject markup or falsify outputs.**
   `js/script.js:607-665` decodes arbitrary URL JSON, trusts result fields, and
   inserts them into `innerHTML`. Imported inputs bypass normal range checks.
   The design must specify bounded schema validation, input validation, output
   recomputation, and safe text rendering, including legacy links.
2. **The privacy promise does not describe actual data movement.**
   `js/script.js:474-477` places encoded health values and timestamps in a URL
   query. Hosting receives that query when someone follows a shared link.
   Social, email, and ChatGPT actions transfer values or links to other services
   (`js/script.js:514-566`). README and about-page blanket claims that no data
   reaches servers need qualification. Base64 is encoding, not encryption.
3. **The AI handoff needs a product-scope decision.**
   `js/script.js:566` requests fasting/supplementation and a universal A1C target;
   the rest of the product describes educational conversion. The design must
   choose the handoff's scope and explain data transfer before navigation. No
   treatment target or medical recommendation is endorsed by this assessment.
4. **Changing units leaves stale constraints and results.**
   `index.html:257-258` retains mg/dL limits, step, and hint for mmol/L. Only
   changing conversion direction clears results (`js/script.js:305-319`).
   Editing values or changing units can leave old results/share actions visible.
5. **Precision and ranges need an explicit contract.**
   `js/script.js:350-353` rounds mg/dL before deriving mmol/L. Requirements state
   the direct formula. Input 4.11 gives a different one-decimal mmol/L display
   under those two methods. Forward range 4–20% and reverse range 70–600 mg/dL
   are not inverses; outputs may not be valid reverse inputs. Do not silently
   change ranges or formulas while documenting them.
6. **Consent is styled as a modal without modal behavior.**
   `index.html:403` declares a modal dialog, but the script does not trap,
   transfer, or restore focus. Offscreen CSS does not remove controls from the
   focus order (`css/styles.css:258-278`). Expiry checking ignores saved version
   and invalid dates (`js/script.js:197-225`).
7. **Cookie documentation exceeds implementation evidence.**
   Consent uses localStorage, not the cookie described by `cookie.html:106`.
   That page describes tracking cookies and persisted unit preferences not
   established by the examined code. Google consent queue stubs are present,
   but no analytics loader or tracking ID was found. Font/CDN/donation requests
   are independent of the consent toggles. Compliance needs separate evidence.
8. **Accessibility promises are unverified and have concrete gaps.**
   Results/errors/toasts lack announcement semantics (`index.html:282,319,457`).
   There is no form/Enter path, radio groups lack fieldsets/legends, errors lack
   input associations, accordion state is not exposed, share buttons are 32px,
   and reduced-motion handling is absent. Verify keyboard, screen reader,
   contrast, and mobile layouts after implementation.
9. **External dependencies and deployment need explicit boundaries.**
   Requirements claim no unavailable external-service dependency, but hiding
   and layout rely on remote Tailwind. The donation script can read the page
   and URL. Azure deploys the repository root; a later implementation must
   verify deployed content and exclude tooling and design artifacts as needed.
10. **Existing documentation is intent, not acceptance evidence.**
    `todo.md` checks off cross-browser and validation work without retained
    evidence. Existing `design.md` promises accessibility conformance without
    establishing it. Medical approval language across metadata and UI needs
    source-specific verification before it can be treated as product truth.

## Boundaries and next steps

The user requested EGM drafting, fresh Goldfish review, Impeccable context and
review, and implementation of review findings. Complete EGM's section approvals
before dispatching Goldfish reviewers. Carry unresolved product decisions into
the draft rather than inventing answers. After design approval and review,
leave EGM's design-only workflow before editing production files. Keep the
existing static stack and visual identity pending any approved change.
