# Goldfish Annotated Review Report

Target: [approved design](design_draft.md). Owner authorized implementation of all
review findings on 2026-11-02. All Z/C/D/R findings are accepted as PROPOSE FIX;
none are contested, escalated, or discarded.

Design fixes: helper reuse; concrete cloud findings; local workflow/source links;
functional hiding and responsive navigation; precise import precedence and numeric
grammar; exact publisher lifecycle; safe form boundaries; stable phase exits.

## Implemented Evidence

- Z1/R5: `js/calculator.js` owns formulas, strict decimal validation, ranges,
  canonical dates, bounded versioned import and base64url encoding. Node tests
  verify full-precision arithmetic, limits and hostile/forged legacy inputs.
- D2: fragment namespace/precedence, empty/duplicate/oversized/unsupported data,
  legacy migration and recomputation have module and actual browser checks.
  Hash changes now refresh calculations or clear invalid state; unrelated anchors
  preserve the user's result. Two interaction regressions cover that browser gap.
- D1/R3: local hidden rules and explicit desktop navigation replace CDN-dependent
  functional state. Native and isolated browsers show desktop/mobile navigation
  and no horizontal overflow. Remote-CSS failure checks are recorded below.
  An isolated browser returned 503 for Tailwind at 390px and 1280px: imported
  estimates still rendered, inactive inputs/errors stayed hidden, and local
  desktop/mobile navigation rules worked. The temporary route was removed.
- R4: form ends before results, Calculate alone submits, all other buttons have
  explicit types, and the calculator module loads before DOM wiring. Seven-page
  static checks and interaction tests verify the boundary and action behavior.
- R1: `scripts/build_static.py` publishes exactly 23 paths, replaces old output,
  rejects symlinks/missing assets and excludes unlisted files. Nine Python
  publisher regressions cover positive and negative cases.
- R2: module, DOM, publication and tooling checks ran incrementally. Final code
  suite has 31 Node regressions and ten Python regressions. One Python
  regression prevents a stale verification stamp from trusting a replaced engine.
- C1–C3: concrete cloud findings, installed workflow references, source links and
  artifact paths are in the approved plan and durable review documents.
- G1–G6: cached engines are rehashed on every cache launch; missing development
  links target pinned upstream source; bootstrap's test matches its inline
  fallback. Local patches are recorded in the two provenance manifests.

## Impeccable Completion

PRODUCT.md, canonical token-bearing DESIGN.md, v2 sidecar and two surface briefs
are complete. Independent A/B critique and the shipped finish reviewer ran;
all material feedback was implemented. The final finish disposition is **ship**.
See [critique and fixes](impeccable_review.md) and
[finish verdict with six captures](impeccable_finish_review.md).

## Verification Limits and Delivery

Local tests, native browser interactions and isolated browser captures are
distinct evidence. No whole-site accessibility or clinical approval is claimed.
Windows launcher code was inspected and cache regression-tested through the shell
path; Windows native execution remains unavailable. Uncaptured reading/expanded
accordion states have source/test coverage, not full visual acceptance.

PR #6 targets develop. Live verification showed it mergeable after checks and
thread resolution despite the intended owner-review flag. With zero general
approvals, this owner-authored PR has no enforced independent owner gate; the
branch workflow documents that observed limitation. No protection was bypassed.
This branch has not been released to main or accepted in production.
Cloud-review G1–G6: [source findings](cloud-review-findings.md).

## Slam Review Follow-up

Automatic review identified publication-promotion failure safety, mobile target
width, and the confirmed email handoff. Previous output is now restored if
promotion fails, or retained at a reported recovery path if rollback also fails.
Three injected-failure regressions cover copy, promotion and rollback failure.
Email confirmation attempts the exact previewed mailto destination while keeping
a fallback; cancellation never navigates. Escape from a mobile navigation link
returns focus to its toggle, and that toggle measures 44×44px at 390px viewport.
These fixes pass 31 Node and ten Python tests, with actual browser checks for
menu states, Escape focus and target size.
