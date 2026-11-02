# Cloud review findings

Source: automatic Copilot review of PR #6 at commit
`aabefcc103b866419c388d89a3afef6e28103a98`, retrieved 2026-11-02.
Review: <https://github.com/ChiefInnovator/bloodsugarcalculator/pull/6>.
These are packaging/tooling findings, separate from the application Goldfish review.

## Integrity

- G1 (comments 4441526723, 4441526783, 4441526835): shell and Windows Impeccable
  launchers trust an existing `.verified` stamp without rechecking cached engine
  bytes. Remove that fast path and hash the cache against the pinned checksum
  manifest on every cached-engine execution. Verify that a valid stamp plus a
  replaced binary does not execute that binary. Treat explicit local overrides
  separately from the checksum-verified download/cache guarantee.

## Runtime documentation

- G2 (4441526888): `.agents/docs/designs/README.md` links a missing root README.
  Point the framework architecture entry at the pinned upstream README.
- G3 (4441526939): `skill_icons.md` links missing `scripts/pack_plugin.py`.
  Link the pinned upstream source and state that rebuilding packages requires
  that complete source checkout.
- G4 (4441526997, 4441527097, 4441527155, 4441527223, 4441527276, 4441527334,
  4441527380): all seven skill TEST documents link a missing TESTING.md and
  describe `pytest tests/unit`, absent from this installed runtime. Link pinned
  upstream test documentation and distinguish upstream packaging tests from
  local manual scenarios.
- G5 (4441527042): bootstrap's manual test says to halt without subagents, while
  the installed bootstrap skill permits inline scouts. Correct the manual test
  to verify that documented fallback, leaving skill instructions intact.
- G6 (4441527427): checksum-manifest comments mention missing upstream release
  scripts. Identify them as upstream-maintainer tools rather than installed
  commands; retain pinned hashes unchanged.

Acceptance: cached-byte tamper regression passes; shell syntax passes; Windows
branch is inspected and its lack of native execution is disclosed; concrete
installed Markdown links resolve or explicitly target upstream; provenance
records local tooling patches without claiming pristine upstream byte parity.
