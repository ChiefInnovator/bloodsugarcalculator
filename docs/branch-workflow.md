# Branch workflow

Changes follow `feature/<topic>` → `develop` → `main`, using pull requests.
Both source and destination must belong to this repository. Fork contributions
must first be brought into a local feature branch by the maintainer.

- `main` accepts only `develop`.
- `develop` accepts only nonempty `feature/<topic>` branches.
- Both branches block direct pushes, deletion, force pushes, and merging with
  unresolved review conversations. The required `branch-policy/main` or
  `branch-policy/develop` status validates
  source metadata using trusted base-branch workflow code without checking out
  the proposed code or accessing deployment secrets.
- Rulesets have no bypass actors and require zero general human approvals for
  this solo repository. CODEOWNERS names workflow ownership and the code-owner
  flag is enabled. However, GitHub reported owner-authored PR #6 as mergeable
  after its checks passed and review threads were resolved, despite workflow
  changes and no independent approval. This configuration therefore does not
  establish an independent workflow-approval barrier. Copilot comments are not
  human approvals. A stronger approval policy is a separate owner decision.
- Automatic GitHub Copilot review is scoped to pull requests targeting
  `develop`, including subsequent real code pushes. Reviews depend on the
  author's Copilot eligibility and available credits. Never request a review
  manually or push an empty change to trigger one.
- Account-wide automatic review is independent of repository rulesets and can
  also review `main`. Develop-only behavior requires disabling that account
  setting; do not change other repositories' rulesets to accomplish this.
- Production deployment remains tied to `main`. Feature and develop changes
  reach production only through a release pull request from `develop`.

Create feature branches from current `develop`. Resolve divergence using merge
commits, never rebase. If a release merge leaves `main` ahead, merge `main` into
a new `feature/sync-main-<topic>` branch, then open that branch into `develop`.
Keep the long-lived `develop` branch after release merges.

## Security boundary

These source-branch checks prevent ordinary accidental promotion from the wrong
branch; they are not an immutable authorization service. A repository writer can
execute a new push-triggered workflow on an unprotected branch before code-owner
review and use its GitHub Actions token to spoof statuses on another commit.
Statuses also attach to commits, not uniquely to a PR. Target-specific contexts
prevent a develop result from satisfying main's check, but do not isolate two
PRs with the same head and target. Binding to Actions app 15368 prevents a
personal-token status from impersonating Actions, not another Actions workflow.

For protection against hostile repository writers, use an independently hosted
GitHub App or organization-level required-workflow enforcement with an external
trusted policy. This personal public repository cannot use push file-path rules;
GitHub rejected that configuration. Do not represent these rules as that stronger
guarantee. Admins can also change repository rulesets themselves.

## Bootstrap

The trusted workflow must exist on the default branch before its status check
can be required. Install it through a feature-to-develop pull request and then
a develop-to-main pull request before activating the required check. This
bootstrap does not permit a permanent bypass in the final rulesets. Install
CODEOWNERS before activating its review requirement.

## Verification

Inspect active rules with `gh api repos/ChiefInnovator/bloodsugarcalculator/rules/branches/main`
and the equivalent `develop` endpoint. Each required status is bound to the
GitHub Actions app (integration ID 15368). Validate both allowed routes and
rejected routes after changing the policy. Repository admins can edit rulesets;
this policy prevents merging around them while those rulesets remain active.
