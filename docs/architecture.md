# Architecture

## Current V0 deployment

Cassie's Cardiology is a serverless application deployed on Cloudflare Pages at [https://cassiescardiology.com](https://cassiescardiology.com). The former `pages.dev` hostname redirects to the custom domain and is not canonical.

The frontend uses React, TypeScript, and Vite. Cloudflare Pages Functions expose the API, and Cloudflare D1 stores live application state.

The application has three access modes:

- Public demo browsing, which does not create educator sessions or persist progress.
- Educator operations authenticated with Google through Cloudflare Access.
- Public, anonymous student participation.

Cloudflare Access protects `/api/educator/*`. Pages Functions validate the Access identity and enforce educator ownership. `/api/student/*` remains public; students do not authenticate and no student identity is stored.

## Frontend and routing

The browser uses History API routes:

- `/` — topic dashboard.
- `/topics/:topicId` — educator question and live response view.
- `/topics/:topicId/learn` — structured explanation and teaching content.
- `/topics/:topicId/respond?session=<opaque-session-id>` — anonymous student response page.

The dashboard contains 25 topics, including Genetics. It defaults to a 5-by-5 grid on desktop and one topic per row on normal mobile screens.

## Roles and state

### Educator

An authenticated educator can start or resume an educator-owned topic session, display its QR code, monitor aggregate responses, reveal the correct answer, view teaching content, mark topics complete, and reset the current rotation.

Completion persists in D1 independently for each educator. V0 stores only the current rotation; it does not retain historical rotations.

### Student

A student follows a session-qualified QR link, selects an answer, and submits it anonymously. The student API returns session availability and reveal state. It does not return the correct answer until the educator reveals it.

### Public demo

An unauthenticated visitor can browse topics and teaching content in read-only demo mode. Demo actions do not create quiz sessions or save progress.

## API boundary

Educator endpoints:

- `GET /api/educator/me`
- `GET /api/educator/progress`
- `POST /api/educator/progress/:topicId`
- `POST /api/educator/progress/reset`
- `GET|POST /api/educator/topics/:topicId`
- `POST /api/educator/topics/:topicId/reveal`
- `POST /api/educator/topics/:topicId/complete`

Student endpoints:

- `GET /api/student/topics/:topicId?session=<opaque-session-id>`
- `POST /api/student/topics/:topicId/responses?session=<opaque-session-id>`

The session API remains index-based: sessions store `choiceCount` and `correctAnswerIndex`, submissions use `choiceIndex`, and response summaries return index-aligned counts. The curriculum uses stable option IDs; the frontend converts between an option ID and its position without changing the API contract.

## Curriculum architecture

Production topic JSON lives in `src/content/topics/`, and seven current media assets live in `public/media/topics/<topic-id>/`.

Each topic supports:

- ID, display name, and optional description.
- Question stem, prompt, and optional question media.
- Stable option IDs, ordered options, and `correctOptionId`.
- Ordered `ContentBlock` explanations: paragraphs, bullet lists, numbered lists, tables, and positional media.
- Optional per-option rationales, Testing Point, Bottom Line, and references.
- Media alt text, optional caption, and optional source attribution.

Question media is rendered between the stem and prompt. Explanation media remains at its exact `ContentBlock` position. These are distinct placements and are not interchangeable.

Runtime content validation checks topic IDs, option IDs, answer references, blocks, tables, rationales, media metadata, and reference URLs. Before every build, `scripts/check-question-keys.mjs` verifies the server question-key manifest against all curriculum JSON files.

## Curriculum import workflow

The DOCX importer is `scripts/import-curriculum-preview.py`. A source DOCX belongs under the gitignored `import-source/` directory and must not be committed.

The controlled workflow is:

```text
source DOCX -> import-preview -> human review -> production JSON/media
```

The importer extracts topic sections and media, preserves source wording, removes confirmed source-page navigation debris, and reports ambiguities or inconsistencies. It must not silently medically correct or reinterpret source material. Production promotion uses only reviewed preview artifacts.

## V0 scope

V0 focuses on live question delivery, anonymous response collection, educator reveal, and current-rotation progress. Gamification and bingo mechanics may be considered later but are not part of the current architecture.
