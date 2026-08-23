# Database Design

## Overview

Cloudflare D1 stores live state: educator identity records, current-rotation progress, educator-owned quiz sessions, and anonymous student responses. Curriculum JSON and media are deployed static assets and are not stored in D1.

## Educators

Google authentication is provided through Cloudflare Access. The `educators` table is keyed by the validated Access subject (`sub`). The application does not trust an educator ID, email address, or name supplied by the browser.

Multiple educators have independent records, sessions, and progress. Ownership checks prevent one educator from operating another educator's session or progress.

## Current rotation progress

The `educator_topic_progress` table stores one completion row per educator and topic. Its composite primary key is `(educator_id, topic_id)`. Resetting a rotation deletes only the authenticated educator's completion rows and closes that educator's active sessions.

V0 retains no historical rotations.

## Quiz sessions

Each `quiz_sessions` row stores:

- Educator owner.
- Topic ID.
- Correct answer index.
- Choice count.
- `open`, `revealed`, or `closed` status.
- Lifecycle timestamps.

A partial unique index permits at most one open or revealed session per educator and topic. Sessions are separate from progress records.

The server contract is deliberately index-based. Curriculum options have stable IDs, but the server persists the selected position and correct position. A build-time check ensures `choiceCount` and `correctAnswerIndex` in `functions/lib/questionKeys.ts` match the ordered curriculum options.

## Anonymous responses

The `quiz_responses` table stores an answer-choice index against a quiz session. It does not store student names, email addresses, accounts, device identifiers, or other learner identity data.

Students access a session using the opaque value in the QR URL. The public student API validates that value and the topic before accepting a response. Correctness is withheld until the owning educator reveals the answer.

## Migrations

- `0001_quiz_sessions.sql` created session and response tables.
- `0002_educators_and_progress.sql` added educator identity, current-rotation progress, educator-owned sessions, and ownership indexes.

No historical-rotation or gamification schema exists in V0.
