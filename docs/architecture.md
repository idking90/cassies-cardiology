# Architecture

## Overview

Cassie's Cardiology is a serverless web application hosted on Cloudflare Pages.

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

In Version 1, learner submission calls a local client-side handler only; no response data is transmitted or retained.

Learners do not authenticate.

## Application Flow

### Educator Flow

1. Open dashboard.
2. View topic list.
3. Select topic tile.
4. Display a read-only question, QR code, and hardcoded response summary.
5. Monitor simulated aggregate responses.
6. Either:
   - Mark topic complete and return to the dashboard.
   - View teaching material, which marks the topic complete.

### Learner Flow

1. Scan a QR code that links to `/topics/:topicId/respond`.
2. Open the learner-only topic question.
3. Select one answer.
4. Submit it to a local no-op handler.

## Initial Development Strategy

Prototype:
- React frontend.
- Mock local data.
- No database.
- No authentication.
- Local question/content files.
- Browser History API for dashboard, educator topic, teaching, and learner routes.
- Client-side QR generation from the learner response URL.

Future:
- Cloudflare D1 database.
- Cloudflare R2 image storage.
- Educator authentication.
