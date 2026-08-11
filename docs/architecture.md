# Architecture

## Overview

Cassie's Cardiology is a serverless web application hosted on Cloudflare Pages.

The React frontend is served by Cloudflare Pages, and Pages Functions expose the
quiz API backed by a Cloudflare D1 database. The browser uses the same API for
educator session management and learner responses.

The application has three access levels: public demo browsing, authenticated
educator operations, and anonymous student participation. Cloudflare Access
controls the educator allowlist, while Pages Functions validate the Access JWT
and enforce ownership server-side.

The application contains:

- Educator interface.
- Learner question interface.
- Local topic and teaching-content modules.

## Roles

## Educator

The educator can:
- Sign in through Cloudflare Access.
- View topics.
- Select a topic.
- View learner responses.
- Mark topics complete.
- Access teaching material, which also marks a topic complete.
- Reset progress.

Educator completion is stored in D1 per educator and represents the educator's
single current rotation. There is no historical rotation data.

## Learner

Learners can:
- Scan QR codes.
- Open a separate learner-only question page.
- Submit answers.

Learner responses are submitted anonymously to the Pages Functions API and
stored in D1. No learner identity or authentication data is collected.

Learners do not authenticate.

Unauthenticated visitors can browse the application and use its read-only demo
mode. Demo actions do not create educator sessions or save educator progress.

## Application Flow

### Public Demo Flow

1. Open the dashboard without signing in.
2. Browse topics, questions, and teaching content.
3. See clearly labeled demo/read-only educator actions.
4. Sign in as an educator to create live sessions or save progress.

### Educator Flow

1. Sign in through Cloudflare Access.
2. Load the educator's current completed topics from D1.
3. View the topic list.
4. Select a topic tile.
5. Create or load the educator-owned active quiz session through the educator API.
6. Display a read-only question, a session-qualified QR code, and D1-backed response summary.
7. Monitor aggregate responses returned by the educator API.
8. Either:
   - Mark topic complete and return to the dashboard.
   - View teaching material, which marks the topic complete.
9. Reveal the answer through the educator API when ready.
10. Reset only this educator's current rotation when needed.

Reset progress closes active quiz sessions through the existing server-side
completion behavior. The next educator visit creates a fresh session.

### Learner Flow

1. Scan a QR code that links to `/topics/:topicId/respond?session=<opaque-session-id>`.
2. Open the learner-only topic question.
3. Select one answer.
4. Submit it to the student API, which stores the response in D1.
5. Poll the student API for the educator's reveal state. The correct answer is
   not returned before the educator reveals it.

## API Flow

Educator endpoints:

- `GET /api/educator/me` validates the Cloudflare Access identity.
- `GET /api/educator/progress` loads the authenticated educator's completed topics.
- `POST /api/educator/progress/:topicId` saves one completed topic.
- `POST /api/educator/progress/reset` clears the educator's current rotation and
   closes that educator's active sessions.
- `GET /api/educator/topics/:topicId` loads the authenticated educator's active
   session summary.
- `POST /api/educator/topics/:topicId` creates an active session owned by the
   authenticated educator.
- `POST /api/educator/topics/:topicId/reveal` reveals the answer and returns
   the updated summary.
- `POST /api/educator/topics/:topicId/complete` closes the authenticated
   educator's active session.

Student endpoints:

- `GET /api/student/topics/:topicId?session=<opaque-session-id>` returns session
   availability and reveal state.
- `POST /api/student/topics/:topicId/responses?session=<opaque-session-id>`
   records a learner choice in D1.

## Initial Development Strategy

Implemented:
- React frontend.
- Cloudflare Pages Functions API.
- Cloudflare D1 database and migrations.
- Shared frontend API client in `src/data/quizApi.ts`.
- Cloudflare Access JWT validation for educator operations.
- Per-educator current-rotation progress.
- Educator-owned quiz sessions.
- Public demo mode without localStorage persistence.
- Anonymous student responses routed by opaque session token.
- Local question/content files.
- Browser History API for dashboard, educator topic, teaching, and learner routes.
- Client-side QR generation from the learner response URL.

Future:
- Cloudflare R2 image storage.
