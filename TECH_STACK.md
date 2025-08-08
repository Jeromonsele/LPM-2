## Alex — Tech Stack and Architecture

### Executive summary
- **Frontend**: Next.js App Router (RSC‑first), TypeScript, Tailwind v4 + shadcn/ui (Radix), server‑rendered dashboard, minimal client state, command palette, SSE for job updates, accessible components.
- **Backend**: Next.js Route Handlers (Node runtime), Prisma → Postgres (prod), Redis queue + worker (BullMQ), OpenAI (GPT‑4o + Whisper), S3/R2 object storage via presigned uploads, SSE endpoints, Sentry + PostHog, Auth.js with RBAC and org tenancy.

### Reference architecture
```mermaid
graph TD
  A[Browser\nNext.js App Router] -->|SSR/RSC| B(Next.js Web)
  A -->|SSE/WebSocket\n(Job updates, chat)| B
  B -->|Prisma| C[(Postgres)]
  B -->|enqueue| D[Redis]
  E[Worker service] -->|BullMQ| D
  E -->|Prisma| C
  B -->|Presigned PUT/GET| F[(S3/R2 Storage)]
  B -->|OpenAI API| G[(GPT‑4o/Whisper)]
  B -->|Sentry| H[(Observability)]
  B -->|PostHog| I[(Product analytics)]
```

### Frontend
- **Framework**: Next.js 15 (App Router), TypeScript. Use Node runtime for routes touching Prisma.
- **Styling/Design**: Tailwind v4 + shadcn/ui + Radix; brand tokens (radius/shadows/spacing), class‑based dark mode.
- **Components**: 
  - Header split‑actions (New, Upload, Record, Prompt, Import).
  - Dashboard stat cards with deltas and sparklines, clickable to filtered views.
  - Recent list rows show owner, time‑ago, status dot, tags, quick actions (preview/export/share).
  - Mobile sticky bottom‑nav (Overview, SOPs, Upload, Jobs), single‑column editor with docked “Ask Alex”.
  - Command palette via `cmdk` (⌘/Ctrl‑K) for search + actions.
- **Data‑fetching**: Server Components + Suspense for initial paint; client state only for interactive filters/search using SWR/React Query.
- **Realtime**: Server‑Sent Events for job progress; upgrade to WebSocket/Pusher if bi‑directional chat is needed.
- **Content**: Markdown editing; render with `react-markdown` + `rehype-sanitize` (XSS‑safe). For rich editing later: TipTap with MD extension.
- **Exports**: `@react-pdf/renderer` for PDF; `docx` for DOCX (run heavy exports in worker).
- **Accessibility**: focus‑visible rings, contrast‑safe palettes, aria labels on icons/nav, full keyboard support for dialogs/palette.

### Backend
- **App server**: Next.js Route Handlers (Node runtime). Validate inputs/outputs with Zod; standard error envelope.
- **Database**: Prisma ORM.
  - Dev: SQLite; Prod: Postgres (Neon/Supabase/RDS).
  - Core models: `Source`, `Sop`, `SopVersion`, `Job`, `ChatThread`, `ChatMessage`, plus `Organization`, `User`, `Membership`, `Role`, `NotificationPreference` (next).
  - Indexes: `Sop(updatedAt desc)`, `Job(createdAt desc, type)`, `SopVersion(sopId, version)`.
- **Jobs**: Redis + BullMQ; dedicated worker service (Fly/Render/Railway).
  - Tasks: transcription (Whisper), long exports (DOCX/PDF), Notion/Slack webhooks, analytics rollups.
  - Progress events via Redis pub/sub → SSE endpoint consumed by dashboard.
- **Storage**: S3/R2 for uploads; use presigned PUT/GET; persist only metadata in DB.
- **AI**: OpenAI SDK (GPT‑4o for SOP generation; Whisper for A/V transcription). Maintain prompt templates with versioning and sectioned outputs.
- **Search**: MVP FTS (SQLite FTS5 / Postgres `tsvector`/`pg_trgm`). Roadmap: embeddings + `pgvector` for semantic search and chat grounding.
- **Auth/Orgs**: Auth.js (Email + Google). Multi‑tenant RBAC (Owner/Admin/Editor/Viewer). Enforce row‑level auth via `orgId` from session in every handler.
- **Security**: Rate limiting (Upstash Redis), CSP via `next-safe`, sanitize Markdown, signed webhooks for Cal.com/Notion.
- **Observability**: Sentry (server + client) with request IDs; Prisma slow‑query middleware; PostHog for product analytics.
- **Caching**: Next `revalidateTag`/`unstable_cache` for stats; Redis for ephemeral caches.

### Environments & deployment
- **Local**: Next dev, SQLite.
- **Preview/Prod**: Next on Vercel (web), Redis (Upstash), Postgres (Neon), Worker (Fly/Render/Railway). Nightly DB backups and storage lifecycle rules.
- **CI/CD**: GitHub Actions → lint/typecheck/test, build, preview URLs; Prisma migrations on deploy.

### Migration plan from MVP
1) Keep SQLite locally; switch preview/prod to Postgres. Add Redis + BullMQ and move transcription/export to worker. Replace polling with SSE.
2) Add Auth.js + orgs/RBAC; protect dashboard and route handlers.
3) Harden Markdown pipeline and CSP; add DOCX export on worker.
4) FTS search + tags/owners; later, semantic search with embeddings.
5) Notion/Slack notifications; Cal.com booking/payments.

### Acceptance criteria
- Dashboard SSR with stats and recent items; stat cards show 7‑day delta + sparkline.
- SSE streams job updates within <1s of change.
- Uploads via presigned URLs; files never proxy through app server.
- Auth + orgs enforced; non‑members cannot access SOPs by ID.
- Outputs sanitized; CSP enabled; Sentry traces on errors; PostHog events on key actions.


