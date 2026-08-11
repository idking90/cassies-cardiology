# Database Design

## Overview

Cloudflare D1 stores educator identity records, current-rotation progress, quiz
sessions, and anonymous student responses. Students do not have database
identity records.

## Educator

The `educators` table is keyed by the validated Cloudflare Access subject (`sub`).
The application does not trust an educator ID, email address, or name supplied by
the browser.

## Current rotation progress

The `educator_topic_progress` table stores one completion row per educator and
topic. Its composite primary key is `(educator_id, topic_id)`. Resetting a
rotation deletes only the authenticated educator's rows. Historical rotations
are not retained.

## Quiz sessions

The `quiz_sessions` table represents an educator currently asking a question to
a group of students. Each session stores:

- educator owner
- topic ID
- correct answer index
- choice count
- open, revealed, or closed status
- lifecycle timestamps

A partial unique index permits at most one open or revealed session per educator
and topic. Quiz sessions are separate from current-rotation progress.

## Responses

The `quiz_responses` table stores anonymous answer choices against a quiz session.
It does not store student names, email addresses, accounts, device identifiers, or
other learner identity data.

Students access a session using an opaque session value in the QR URL. The API
validates that value against the topic and active session before accepting a
response.

## Content and teaching material

Question and teaching content currently remains in the frontend topic modules.
Future Google Docs/content-import work can introduce durable content references
without changing the educator-progress or anonymous-response model.

## Migrations

- `0001_quiz_sessions.sql` created the original session and response tables.
- `0002_educators_and_progress.sql` added educator identity, current-rotation
  progress, educator-owned sessions, and the corresponding ownership indexes.
