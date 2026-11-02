# Test Plan: EGM Draft Skill

Upstream frontmatter and link checks run in `pytest tests/unit` from a complete
checkout of the pinned upstream source (see [upstream TESTING.md](https://github.com/google/elephant-goldfish-model/blob/403d8881d62022490637d740657b33f01e321ea8/TESTING.md)).
Those packaging tests are not included in this installed runtime; the manual
scenarios below apply locally.

## Protocol Verification Checklist

When evaluating or exploring `egm-draft` interactively in chat, verify:

-   **Step 4 (Alternatives):** Reads rejected alternatives from the brief's
    `Alternatives Weighed` section, or asks the user if it is absent.
-   **Step 6 (Finalize):** Reports contradictions between the brief and the
    draft before directory selection, and waits for the user to decide each
    one. Does not self-grade against
    the Zoom Out standard.
