# Architecture

## Overview

Cassie's Cardiology is a lightweight web application hosted on Cloudflare Pages.

The application consists of:

- A public learner interface.
- A teacher/admin interface.
- A question/content management system.

## User Roles

### Learner

Learners:
- Do not create accounts.
- Do not provide personal information.
- View the currently active question.
- Submit answers.
- View feedback and teaching material.

### Teacher/Admin

The teacher:
- Authenticates to the admin area.
- Creates and edits questions.
- Selects the active question.
- Manages teaching content.

## Application Flow

### Learner Flow

1. Learner opens the website.
2. Application retrieves the active question.
3. Learner selects an answer.
4. Application determines whether the answer is correct.
5. Application displays feedback.

### Teacher Flow

1. Teacher logs in.
2. Teacher views available questions.
3. Teacher selects the active question.
4. All learners see the updated question.

## Initial Technical Approach

Version 1 will prioritize simplicity.

Initial implementation:
- React frontend.
- Local/mock question data.
- No database initially.
- No learner accounts.
- No tracking.

Backend/database functionality will be added after the user experience is validated.

## Future Architecture

Potential future additions:
- Cloudflare D1 database.
- Cloudflare R2 image storage.
- Teacher authentication.
- Question library.
- Multiple teaching topics.