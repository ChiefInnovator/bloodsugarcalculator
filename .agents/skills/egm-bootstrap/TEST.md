# Verification and Evaluation Commands for `egm-bootstrap`

Upstream frontmatter and link checks run in `pytest tests/unit` from a complete
checkout of the pinned upstream source (see [upstream TESTING.md](https://github.com/google/elephant-goldfish-model/blob/403d8881d62022490637d740657b33f01e321ea8/TESTING.md)).
Those packaging tests are not included in this installed runtime; the manual
scenarios below apply locally.

## Manual Verification Scenarios

1. **Small Tree Execution (Sequential)**:
   - Target a directory with 2-5 subdirectories.
   - Verify that the agent executes sequentially without spawning subagents.
   - Verify generated `README.md` files contain Interface, Invariants, Side Effects, and relative links.
2. **Safety Gate Threshold (>15 Subdirectories)**:
   - Target a directory with 16+ subdirectories.
   - Verify that discovery pauses upon reaching >15 directories and requests user confirmation in chat before proceeding.
3. **Inline Scout Fallback**:
   - Run in an environment without task delegation tools.
   - Verify that the agent runs the scout steps inline in the current conversation,
     preserving the documented gates.
