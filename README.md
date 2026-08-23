# Cassie's Cardiology

Cassie's Cardiology is a live clinical-teaching application for educators and anonymous student participants.

Production: [https://cassiescardiology.com](https://cassiescardiology.com)

The application is deployed on Cloudflare Pages. The former `pages.dev` hostname redirects to the canonical custom domain.

## V0 capabilities

- 25 curriculum topics displayed as a 5-by-5 desktop dashboard and a single-column mobile dashboard.
- One question per topic with stable option IDs and variable answer counts.
- Anonymous student responses through session-qualified QR links.
- Educator-controlled answer reveal; students do not receive correctness before reveal.
- Independent, persistent current-rotation progress for each authenticated educator.
- Structured explanations with paragraphs, lists, tables, positional media, optional option rationales, Testing Point, Bottom Line, and references.
- Seven production curriculum media assets.

The current product focus is reliable live teaching and rotation-progress tracking. Historical rotations and gamification or bingo mechanics are not part of V0.

## Stack

- React, TypeScript, and Vite
- Cloudflare Pages and Pages Functions
- Cloudflare D1 for live quiz sessions, anonymous responses, educator records, and current-rotation progress
- Google authentication through Cloudflare Access for educator operations

`/api/educator/*` is Access-protected. `/api/student/*` remains public and accepts anonymous participation.

## Development

```sh
npm install
npm run dev
npm run build
npm run lint
```

Wrangler and D1 development commands are documented in `package.json` and [docs/database.md](docs/database.md). Do not place credentials, OAuth secrets, or educator allowlists in repository documentation.

## Curriculum workflow

Production content lives in `src/content/topics/`; production media lives in `public/media/topics/`.

The one-time DOCX workflow is:

1. Place the source DOCX under the gitignored `import-source/` directory.
2. Run `scripts/import-curriculum-preview.py`.
3. Review the generated `import-preview/topics/`, `import-preview/media/`, and migration reports.
4. Promote only approved preview JSON and media into the production directories.
5. Build the application. The prebuild consistency check verifies that `functions/lib/questionKeys.ts` matches the curriculum's option order, answer index, and choice count.

The importer preserves source wording and flags ambiguities instead of silently correcting source material.

See [architecture](docs/architecture.md), [database design](docs/database.md), [product vision](docs/vision.md), and [roadmap](docs/roadmap.md) for more detail.
