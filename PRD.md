## Alex — SOP Expert System

### 1) Vision and Problem
- Mission: Turn expert knowledge (transcripts, audio, video, notes) into clear, accurate SOPs in one session so teams adopt and maintain process.
- Pain today: SOPs are slow to write, become stale, and live in scattered tools. Knowledge from calls and experts is lost.

### 2) Product Goals (12 months)
- Reduce time-to-first-SOP from days to minutes.
- Drive adoption: 60%+ of generated SOPs get edited, published, and exported or shared.
- Enable governance: versioning, approvals, and audit trail built in.
- Ship integrations to slot into existing workflows (Notion/Slack/Cal.com).

### 3) Scope Overview
- MVP (done/in progress): Upload → Transcribe (A/V) → Generate SOP → Edit → Version → Export (MD/PDF) with Dashboard, Auth/Orgs, Jobs, Supabase Storage presign.
- V1: Real-time jobs via SSE, DOCX export, search/command palette, role/audience variants, approvals, analytics.
- V2: Semantic search (pgvector), structured interviews, org charts/owners, notifications, billing/sessions.

### 4) Personas & JTBD
- Founder/Operator: capture process fast, share with team, baseline governance.
- Team lead/IC: ask questions, tailor SOP for role, see changes.
- Compliance/QA: approvals, audit trail, export for audits.
- Expert/Consultant: record session, produce a professional SOP for client.

### 5) High-level User Flows
1. Landing → Signup/Login → Dashboard → Upload/Record → Job progress → Transcription → Generate → SOP Editor → Edit/Version → Export/Share.
2. Search → open SOP → ask questions in chat → export.
3. Reviewer → open SOP → compare versions → approve/publish.

---

## 6) Epics and Features (detailed)

### Epic A: Core Upload → AI → SOP (MVP)
- A1 Upload File (text/audio/video) with presigned URL to Supabase Storage
  - Accept: .txt/.md/.docx/.pdf/.mp3/.m4a/.wav/.mp4/.mov
  - Validate: mime, size; show progress
  - Creates `Source` with `orgId`
- A2 Transcription (Whisper) as background job
  - Create `Job` (ANALYZE_SOURCE), retries/backoff, messages/progress
  - Store transcriptText in `Source`
- A3 Generate SOP (OpenAI GPT‑4o family)
  - Prompt templates & audience option
  - Create `Sop` (DRAFT) + `SopVersion` v1
- A4 SOP Editor
  - Markdown edit/preview split view
  - Save = new `SopVersion` snapshot
  - Diff view (word/line highlights)
- A5 Export
  - MD and PDF (server) now; DOCX in V1
- Acceptance:
  - 100MB text/audio/video upload success; visible job progress; generated SOP opens in editor; MD/PDF export downloadable.

### Epic B: Dashboard & Discovery
- B1 Overview & Activity (real‑time)
  - Stat cards (SOPs, Sources, Jobs) with deltas/sparklines
  - Timeframe selector (7/30/90d) that drives both cards and lists
  - Live Activity widget (last N events: uploads, job progress, saves, publishes) fed by SSE
- B2 Lists & Filtering
  - Recent SOPs with URL‑persisted filters (status, q, owner, tags) and quick actions (preview, export, share)
  - Saved views (e.g., “My Drafts”, “Changed last 7d”) with shareable URLs; stat‑card click applies filters
  - Rows live‑update while jobs or edits happen (SSE)
- B3 Org‑scoped pages
  - SOPs/Sources/Jobs index pages (org scoping enforced) with owner/tag chips, status dots, time‑ago
- B4 Global search & Command palette (V1)
  - Cmd/Ctrl‑K opens palette with grouped results (SOPs, Sources, Jobs) and quick actions (New, Upload, Import)
- Acceptance:
  - Overview SSR TTFB <200ms locally
  - Filters/sorts/search persist in URL and restore on reload
  - Stat‑card click navigates to lists with filters applied; timeframe syncs cards and lists
  - Activity feed and list rows update within <1s via SSE
  - Saved views can be created, named, shared, and loaded in <200ms locally

### Epic C: Auth & Orgs (multi‑tenant)
- C1 Auth.js (Email/Google), sessions
- C2 `Organization`, `Membership`, `Role`
- C3 Middleware protects `/dashboard/*`, `/sop/*`
- C4 Org switcher & `currentOrgId` cookie; default org bootstrap
- Acceptance:
  - Non-members blocked from data; new users auto‑get an org.

### Epic D: Jobs & Reliability (V1)
- D1 Redis + BullMQ queues, worker service (Fly/Render/Railway)
- D2 Job states (pending/active/completed/failed), retries/backoff, lastError
- D3 SSE `/api/jobs/stream` → live updates in UI
- Acceptance:
  - Long jobs don’t block API; progress updates <1s.

### Epic E: Storage & Presigned Uploads (MVP → V1)
- E1 Supabase Storage bucket `uploads`
- E2 `/api/uploads/presign` returns signed URL; write `Source` metadata
- E3 RLS policies (later): users can only read within org
- Acceptance:
  - Uploads go directly to Storage; server stores path/metadata only.

### Epic F: Editor & Authoring UX (V1)
- F1 Toolbar (headings, lists, code, tables)
- F2 Section templates and reordering
- F3 Role/audience variants; side-by-side compare
- F4 Comments/mentions (V2)

### Epic G: Governance & Review (V1)
- G1 Statuses: Draft, In Review, Published, Archived
- G2 Approvers list & approvals log
- G3 Version compare and rollback
- G4 Audit trail (who/when, changes)

### Epic H: Chat & Q&A (MVP)
- H1 Per‑SOP thread; Q&A grounded in SOP content
- H2 Mobile-friendly chat pane; caching of recent answers
- H3 Guardrails: cite sections/lines (V1)

### Epic I: Integrations (V1 → V2)
- I1 Cal.com booking & payment webhooks (sessions with experts)
- I2 Notion/Slack notifications of job success/publish/approvals
- I3 Public share links with watermark options

### Epic J: Search & Semantics (V1 → V2)
- J1 SQLite/Postgres FTS for title/content search
- J2 pgvector embeddings for semantic search and chat grounding

### Epic K: Analytics, Billing & Ops (V1)
- K1 Sentry (client/server) and request-id logging
- K2 PostHog funnels (upload started, transcription done, SOP generated, published, export)
- K3 Usage metering & plan gates (requests/min, storage)

---

## 7) Functional Requirements
1. Users can upload supported files and see progress/errors.
2. Audio/video are transcribed; text/document sources are parsed.
3. A generated SOP is editable, versioned, and exportable.
4. Dashboard reflects live counts and recent SOPs by org.
5. All reads/writes are scoped to `currentOrgId`.
6. Errors are visible (toast/UI) and traceable (Sentry).

## 8) Non-functional Requirements
- Performance: dashboard SSR <500ms p95; job enqueue <200ms.
- Reliability: worker retries x3 with exponential backoff; dead-letter view (V1).
- Security: org isolation; input validation (Zod); Markdown sanitization; CSP; rate limiting on upload/generate.
- Accessibility: keyboard navigation, focus-visible, color contrast.

## 9) System Architecture
- Next.js (App Router, RSC), Node runtime for Prisma routes
- Prisma ORM → Postgres (Supabase in prod)
- Supabase Storage for uploads (presigned PUT/GET)
- Redis (Upstash) + BullMQ worker for long jobs
- OpenAI GPT‑4o for generation; Whisper for transcription
- SSE for job updates; optional WebSocket later
- Sentry + PostHog

## 10) Data Model (key tables)
- Organization(id, name, createdAt)
- User(id, name, email, image)
- Membership(id, userId, orgId, role)
- Source(id, orgId, kind, originalName, mimeType, sizeBytes, filePath, transcriptText, createdAt)
- Sop(id, orgId, title, audience, contentMd, status, createdAt, updatedAt, sourceId)
- SopVersion(id, sopId, version, title, audience, contentMd, createdAt)
- Job(id, orgId, type, status, progress, message, sourceId, sopId, attempts, lastError, createdAt, updatedAt)
- ChatThread(id, sopId, createdAt)
- ChatMessage(id, threadId, role, content, createdAt)

## 11) APIs (representative)
- `POST /api/uploads/presign` → { uploadUrl, path, sourceId }
- `POST /api/upload` (legacy local) → to be retired in favor of presign + worker
- `GET /api/stats?days=7|30|90` → { sops, sources, jobs, recent[], series[] }
- `GET|PUT /api/sop/[id]` → CRUD, version on save
- `GET /api/sop/[id]/versions` → versions
- `POST|GET /api/sop/[id]/chat` → Q&A
- `GET /api/jobs/[id]` and `GET /api/jobs/stream` (SSE)
- `GET /api/sources` (org-scoped)

## 12) UX Requirements (pages)
- Marketing: Landing, Pricing, About, Contact, Legal
- Auth: Login, Signup, Reset, Invite
- App: Dashboard Overview, SOPs list, Sources list, Jobs, SOP Editor, Settings/Org (later)
- Mobile: sticky bottom nav; chat optimized

## 13) Security & Compliance
- Org scoping enforced on every query
- Zod validation on request payloads
- Sanitized markdown rendering
- CSP via next-safe; no inline scripts; allowlist OpenAI/Supabase
- Rate limiting on `generate` and `uploads/presign`

## 14) Observability
- Sentry DSN (server/client); attach request-id to logs
- Prisma middleware for slow-query warnings (>500ms)
- PostHog events: upload_started/completed, job_succeeded/failed, sop_generated/published/exported

## 15) Performance/SLOs
- Dashboard TTFB <500ms p95; job enqueue <200ms
- SSE events under 1s latency; PDF/DOCX export under 5s typical for 10–20 page docs

## 16) Release Plan & Environments
- Local: SQLite (dev), Supabase for storage; Redis mock or Upstash
- Preview: Vercel web, Supabase Postgres/Storage, Upstash Redis
- Prod: Vercel web, Supabase, Upstash Redis, Worker on Fly/Render
- CI/CD: GitHub Actions — lint/typecheck/test, Prisma migrate, build

## 17) Work Breakdown & Timeline (example)
### Sprint 1 (complete/finishing touches)
- Auth + Orgs; org scoping for core APIs; dashboard SSR; landing; generator; MD/PDF; Supabase presign endpoint; tooltips, empty states.

### Sprint 2 (5–6 days)
- Redis + BullMQ worker; SSE job stream; full presigned upload client path; DOCX export; Sentry/PostHog; rate limits; CSP; Markdown sanitize.

### Sprint 3 (5 days)
- Search (FTS) + command palette; role/audience variants; approvals + statuses; version compare/rollback; share links.

### Sprint 4 (5–7 days)
- Notion/Slack notifications; Cal.com sessions; usage metering, billing scaffolding; semantic search (pgvector) behind flag.

## 18) Acceptance Criteria (MVP/V1)
- Upload (100MB) succeeds to Supabase; job created; progress visible; transcript stored.
- Generate SOP produces structured MD with required sections; editor saves create versions.
- Export MD/PDF (plus DOCX in V1) downloads correctly.
- Dashboard SSR; timeframe switch updates series; stat cards navigate and filters persist.
- All data access respects `orgId`; non-members blocked.
- Sentry shows errors; PostHog shows key funnels.

## 19) Risks & Mitigations
- OpenAI API changes/cost: add provider abstraction & caching.
- Large media uploads: use multipart/resumable; size gates.
- Prompt hallucinations: include structured outline and validation checks; allow quick edits.
- Multi-tenant leaks: add org scoping tests and query guards.

## 20) Testing Strategy
- Unit: prompt builder, diff generator, validation schemas.
- Integration: route handlers (stats/sop/chat/uploads), org scoping, SSE stream.
- E2E: critical flows (upload → job → generate → edit → export), auth redirects.
- Performance checks: dashboard SSR timing, job latency.

## 21) Documentation
- README quickstart, ENV template, local dev
- API doc (OpenAPI or markdown tables)
- Admin runbook (worker, queues, DLQ)

## 22) KPIs
- Time-to-first-SOP, upload success rate, job failure rate, edit rate, publish/export rate, 7/30-day retention, NPS.

---

### Launch Checklist
- [ ] Auth/orgs in prod; SSO plan for enterprise later
- [ ] Upload via presign; worker + SSE working; exports functioning
- [ ] Dashboard SSR OK; search/filters acceptable
- [ ] Sentry/PostHog live; rate limits on sensitive routes
- [ ] Privacy/Terms updated; marketing complete
- [ ] Playbook of sample SOPs for demo


