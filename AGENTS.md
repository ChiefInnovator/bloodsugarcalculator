# Blood Sugar Calculator

- Use `feature/<topic>` branches from `develop`; open feature PRs into `develop`
  and release PRs from `develop` into `main`. Never bypass protections or rebase.
- Automatic Copilot code review belongs only on PRs targeting `develop`.
  Never manually request or re-request reviews.
- EGM artifact directory: docs/designs
- EGM is installed in `.agents/skills/egm-*`; its runtime lives in
  `.agents/agents`, `.agents/resources`, and `.agents/docs`.
- Preserve EGM's section approval gates and use fresh-context Goldfish reviewers.
  Design workflows produce documents; leave them before changing application code.
- Impeccable is installed in `.agents/skills/impeccable`. Preserve the existing
  static HTML/CSS/JavaScript stack and visual identity unless a redesign is approved.
- Keep health estimates distinct from diagnosis and treatment recommendations.
  Do not invent medical, privacy, or accessibility compliance claims.
