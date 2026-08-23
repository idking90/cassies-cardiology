# Roadmap

## V0 — current production state

- Canonical deployment at [https://cassiescardiology.com](https://cassiescardiology.com) on Cloudflare Pages.
- React, TypeScript, and Vite frontend with Cloudflare Pages Functions.
- Cloudflare D1-backed sessions, responses, educator ownership, and current-rotation progress.
- Google authentication through Cloudflare Access for `/api/educator/*`.
- Public anonymous `/api/student/*` participation.
- 25-topic curriculum with structured JSON explanations and seven production media assets.
- Stable curriculum option IDs with the existing index-based session API.
- Educator-controlled answer reveal.
- DOCX preview importer and human-review promotion workflow.
- Desktop 5-by-5 and mobile single-column dashboard.

## Near-term hardening

- Continue validating curriculum imports and media accessibility.
- Preserve privacy and educator-ownership boundaries as the curriculum evolves.
- Improve operational testing and observability without changing learner anonymity.

## Future possibilities

- Historical rotations.
- Gamification or bingo-style teaching mechanics.
- Question history and richer analytics.
- Content-management tooling beyond the reviewed import workflow.
- Additional specialties beyond cardiology.

These are not V0 commitments and should not be implemented by assuming new data, privacy, or session requirements.
