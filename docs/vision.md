# Cassie's Cardiology

## Purpose

Cassie's Cardiology is an interactive clinical-education tool for live teaching with medical students and residents. It helps educators present clinical questions, collect anonymous responses, guide discussion, reveal answers at the appropriate time, and track curriculum progress for the current rotation.

## Current V0 experience

The production application is available at [https://cassiescardiology.com](https://cassiescardiology.com).

Educators authenticate with Google through Cloudflare Access. Each educator has independent, persistent current-rotation progress. V0 does not retain historical rotations.

Students:

- Do not create accounts.
- Do not provide identifying information.
- Join through a session QR code.
- Submit answers anonymously.
- Do not see correctness until the educator reveals it.

## Teaching workflow

1. The educator opens the 25-topic dashboard.
2. The educator selects a topic and starts or resumes its live session.
3. Students follow the QR link and submit anonymous answers.
4. The educator reviews aggregate response counts and leads discussion.
5. The educator reveals the correct answer when appropriate.
6. The educator reviews structured teaching content or marks the topic complete.
7. Progress remains available for that educator until the current rotation is reset.

## Curriculum principles

The curriculum uses structured JSON rather than presentation-specific prose fields. Each topic has one question, stable answer-option IDs, an ordered explanation made from `ContentBlock` values, and optional rationales, Testing Point, Bottom Line, references, and media attribution.

Question media and explanation media serve different teaching moments and preserve distinct positions. Imported source wording is preserved; ambiguous or inconsistent material must be flagged for human review rather than silently corrected.

## Privacy principles

The application does not require learner accounts, store learner identities, track individual learner performance, or expose the correct answer before educator reveal.

## Product direction

V0 prioritizes dependable live teaching and progress tracking over engagement mechanics. Gamification, bingo mechanics, historical rotations, and richer analytics may be explored later, with explicit product and privacy decisions before implementation.
