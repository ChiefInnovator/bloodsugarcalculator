# Optional ChatGPT Explanation

After a current calculation, Explain with ChatGPT opens a local confirmation
dialog. The dialog previews the exact prompt, values, timestamp, and destination.
Cancel makes no external request. Continue opens the confirmed destination using
noopener/noreferrer, retaining an explicit link if the browser blocks opening.
Changing a calculation closes the preview and clears stale sharing state.

The prompt asks ChatGPT to explain the educational estimate, its limitations,
and questions to ask a healthcare professional. It explicitly excludes diagnosis,
individualized treatment and treatment targets. The previous universal A1C goal,
fasting, supplementation and optimization instructions have been removed.

The destination remains `https://chat.openai.com/?q=<encoded prompt>`. This is a
browser handoff, not an integrated API. The receiving service may redirect or
change its behavior, process submitted values, and retain requests according to
its own policy. This repository does not verify the generated response or claim
that it supplies medical care. The preview displays the full prompt before any
such transfer; encoding does not encrypt it.

Calculation inputs are validated and imported results recomputed before sharing.
See [approved contract](designs/design_draft.md) and [privacy policy](../privacy.html).
The [NIDDK A1C explanation](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test)
describes why estimated averages and personal clinical decisions differ.
