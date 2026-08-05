# Architecture

## Overview

Cassie's Cardiology is a serverless web application hosted on Cloudflare Pages.

The application contains:

- Educator interface.
- Learner question interface.
- Content management system.

## Roles

## Educator

The educator can:
- View topics.
- Select a topic.
- View learner responses.
- Mark topics complete.
- Access teaching material.
- Reset progress.

## Learner

Learners can:
- Scan QR codes.
- View questions.
- Submit answers.
- Receive educator-controlled feedback.

Learners do not authenticate.

## Application Flow

### Educator Flow

1. Open dashboard.
2. View topic list.
3. Select topic.
4. Display question and QR code.
5. Monitor responses.
6. Either:
   - Complete topic.
   - View teaching material.

### Learner Flow

1. Scan QR code.
2. Open topic question.
3. Select answer.
4. Submit response.

## Initial Development Strategy

Prototype:
- React frontend.
- Mock local data.
- No database.
- No authentication.
- Local question/content files.

Future:
- Cloudflare D1 database.
- Cloudflare R2 image storage.
- Educator authentication.