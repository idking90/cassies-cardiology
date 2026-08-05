# Cassie's Cardiology

## Purpose

Cassie's Cardiology is an interactive clinical education tool designed to support live teaching sessions with medical students and residents.

The application helps educators guide discussion by presenting clinical questions, collecting anonymous learner responses, and providing optional teaching material.

## Primary User

The primary user is the educator.

The educator uses the application during in-person teaching sessions to:
- Select teaching topics.
- Present questions.
- Review learner responses.
- Decide whether additional teaching is needed.
- Track completion of curriculum topics.

## Learner Experience

Learners:
- Do not create accounts.
- Do not provide identifying information.
- Access questions through a QR code.
- Answer questions anonymously.

## Core Workflow

1. Educator opens the topic dashboard.
2. Educator opens a topic from a tile.
3. The educator view displays a read-only question, QR code, and simulated response summary.
4. Learners scan the QR code to open a separate, learner-only response page.
5. Learners select an answer and submit it anonymously.
6. Educator reviews the simulated anonymous response results.
7. Educator chooses:
   - Mark topic complete.
   - Review additional teaching material.

## Topic Completion

Topics become completed when the educator selects either **Mark topic complete** or **Learn more**. Completed tiles are greyed out and retain a Completed badge until the educator performs a reset. In Version 1, this state lasts for the active browser session only.

## Privacy Principles

The application will not:
- Require learner accounts.
- Store learner identities.
- Track individual learner performance.
- Collect unnecessary personal information.

## Version 1 Goals

Version 1 will:
- Display a list of teaching topics.
- Track completed topics.
- Display one question per topic.
- Generate a QR code for each topic.
- Provide a learner-only URL for every topic QR code.
- Accept a local, non-persistent learner submission.
- Display hardcoded aggregate response data to the educator.
- Provide optional teaching material.

## Out of Scope

Version 1 will not include:
- Student accounts.
- Individual performance tracking.
- Complex analytics.
- Automated grading history.
- Personalized learning paths.
