# Architecture

## Overview

Cassie's Cardiology is a serverless web application hosted on Cloudflare Pages.

The React frontend is served by Cloudflare Pages, and Pages Functions expose the
quiz API backed by a Cloudflare D1 database. The browser uses the same API for
educator session management and learner responses.

The application contains:

- Educator interface.
- Learner question interface.
- Local topic and teaching-content modules.

## Roles

## Educator

The educator can:
- View topics.
- Select a topic.
- View learner responses.
- Mark topics complete.
- Access teaching material, which also marks a topic complete.
- Reset progress.

## Learner

Learners can:
- Scan QR codes.
- Open a separate learner-only question page.
- Submit answers.

Learner responses are submitted anonymously to the Pages Functions API and
stored in D1. No learner identity or authentication data is collected.

Learners do not authenticate.

## Application Flow

### Educator Flow

1. Open dashboard.
2. View topic list.
3. Select topic tile.
4. Create or load the active quiz session through the educator API.
5. Display a read-only question, QR code, and D1-backed response summary.
6. Monitor aggregate responses returned by the educator API.
7. Either:
   - Mark topic complete and return to the dashboard.
   - View teaching material, which marks the topic complete.
8. Reveal the answer through the educator API when ready.

Reset progress closes active quiz sessions through the existing server-side
completion behavior. The next educator visit creates a fresh session.

### Learner Flow

1. Scan a QR code that links to `/topics/:topicId/respond`.
2. Open the learner-only topic question.
3. Select one answer.
4. Submit it to the student API, which stores the response in D1.
5. Poll the student API for the educator's reveal state. The correct answer is
   not returned before the educator reveals it.

## API Flow

Educator endpoints:

- `GET /api/educator/topics/:topicId` loads the active session summary.
- `POST /api/educator/topics/:topicId` creates an active session when needed.
- `POST /api/educator/topics/:topicId/reveal` reveals the answer and returns
   the updated summary.
- `POST /api/educator/topics/:topicId/complete` closes the active session.

Student endpoints:

- `GET /api/student/topics/:topicId` returns session availability and reveal
   state.
- `POST /api/student/topics/:topicId/responses` records a learner choice in
   D1.

## Initial Development Strategy

Implemented:
- React frontend.
- Cloudflare Pages Functions API.
- Cloudflare D1 database and migrations.
- Shared frontend API client in `src/data/quizApi.ts`.
- No authentication.
- Local question/content files.
- Browser History API for dashboard, educator topic, teaching, and learner routes.
- Client-side QR generation from the learner response URL.

Future:
- Cloudflare R2 image storage.
- Educator authentication.
