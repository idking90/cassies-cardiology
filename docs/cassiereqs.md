# Current requirements and workflow

## Educator workflow

- Authenticate with Google through Cloudflare Access for educator operations.
- View 25 topic tiles in a 5-by-5 desktop grid or single-column mobile layout.
- See “Genetics” as the topic display name.
- Select a topic to open the educator view with a read-only question, session QR code, and live anonymous response summary.
- Reveal the correct answer when ready.
- Open structured teaching content or mark the topic complete directly.
- Persist completion for the authenticated educator's current rotation.
- Reset only that educator's current rotation.

Completed tiles remain greyed out with a Completed badge. Multiple educators have independent progress. Historical rotations are not retained.

## Student workflow

- Scan the QR code to open a session-qualified learner page.
- Select and submit one answer anonymously.
- Receive a neutral submission confirmation.
- See no correctness information until the educator reveals the answer.

Students do not create accounts or provide identifying information.

## Curriculum requirements

- One question per topic.
- Stable option IDs with ordered, variable-length answer sets.
- Structured explanations containing paragraphs, lists, tables, and positional media.
- Distinct question and explanation media placement.
- Optional option rationales, Testing Point, Bottom Line, and references.
- Source wording must not be silently rewritten during import.

## V0 product focus

V0 focuses on live teaching and current-rotation progress. Gamification and bingo mechanics are possible future additions, not current requirements.
