# Branch workflow

Changes follow `feature/<topic>` → `develop` → `main`, using pull requests.
Both source and destination must belong to this repository. Fork contributions
must first be brought into a local feature branch by the maintainer.

- `main` accepts only `develop`.
- `develop` accepts only nonempty `feature/<topic>` branches.
- Both branches block direct pushes, deletion, force pushes, and merging with
  unresolved review conversations. The required `branch-policy` check validates
  source metadata using trusted base-branch workflow code without checking out
  the proposed code or accessing deployment secrets.
- Rulesets have no bypass actors. Human approval count is zero for this solo
  repository; Copilot comments are not human approvals.
- Automatic GitHub Copilot review is scoped to pull requests targeting
  `develop`, including subsequent real code pushes. Reviews depend on the
  author's Copilot eligibility and available credits. Never request a review
  manually or push an empty change to trigger one.
- Production deployment remains tied to `main`. Feature and develop changes
  reach production only through a release pull request from `develop`.

Create feature branches from current `develop`. Resolve divergence using merge
commits, never rebase. If a release merge leaves `main` ahead, merge `main` into
a new `feature/sync-main-<topic>` branch, then open that branch into `develop`.
Keep the long-lived `develop` branch after release merges.

## Bootstrap

The trusted workflow must exist on the default branch before its status check
can be required. Install it through a feature-to-develop pull request and then
a develop-to-main pull request before activating the required check. This
bootstrap does not permit a permanent bypass in the final rulesets.

## Verification

Inspect active rules with `gh api repos/ChiefInnovator/bloodsugarcalculator/rules/branches/main`
and the equivalent `develop` endpoint. The required check is bound to the
GitHub Actions app (integration ID 15368). Validate both allowed routes and
rejected routes after changing the policy. Repository admins can edit rulesets;
this policy prevents merging around them while those rulesets remain active.
