## Alex — Site Map (Marketing, Auth, App)

### Visual map
```mermaid
flowchart TD
  subgraph Marketing
    L1["Landing / (CTA)"]
    L2["Pricing /pricing"]
    L3["About /about"]
    L4["Contact /contact"]
    L5["Privacy /legal/privacy"]
    L6["Terms /legal/terms"]
  end

  subgraph Auth
    A1["Login /login"]
    A2["Sign Up /signup"]
    A3["Magic Link /auth/verify"]
    A4["Reset Password /reset"]
    A5["Org Invite /invite/[token]"]
  end

  subgraph App
    D1["Dashboard /dashboard (Overview)"]
    D2["SOPs /dashboard/sops"]
    D3["Sources /dashboard/sources"]
    D4["Jobs /dashboard/jobs"]
    D5["SOP Editor /sop/[id]"]
    D6["Settings /settings"]
    D7["Billing /settings/billing"]
    D8["Org Switcher"]
  end

  %% Primary CTA path
  L1 -->|"Try Alex"| A2 --> D1
  L1 -->|"Book a demo"| L4
  L1 -->|"Upload file"| D3
  A1 --> D1
  D1 --> D5
```

### Pages and purpose
- Landing `/`
  - Hero with value prop, video, trust logos
  - Primary CTA: “Try Alex” → `/signup`
  - Secondary CTAs: “Upload a file” → `/dashboard` (gated), “Book a demo” → `/contact`
- Pricing `/pricing`: tiers (Starter/Team/Business), feature matrix, FAQs, CTA to `/signup`
- About `/about`: mission, team, careers link
- Contact `/contact`: demo form (email+message), support links
- Legal `/legal/{privacy|terms}`

Auth
- Login `/login`: email+password or OAuth; magic link option
- Sign Up `/signup`: email+password or OAuth, org name
- Magic Link `/auth/verify`: completes email login
- Reset `/reset`: request + set-new
- Invite `/invite/[token]`: accept org invite

App
- Dashboard `/dashboard`: Overview with stat cards, deltas, sparklines, Recent SOPs, jobs widget
- SOPs `/dashboard/sops`: list with filters, tags, owners; create/Import actions
- Sources `/dashboard/sources`: recent uploads, statuses
- Jobs `/dashboard/jobs`: live progress (SSE), history
- SOP Editor `/sop/[id]`: edit/preview, versions, chat, export (MD/PDF/DOCX)
- Settings `/settings`: profile, notifications; `/settings/billing`: plan, invoices
- Org switcher: switch current organization

### Navigation & CTAs
- Header (marketing): Pricing, About, Login, primary CTA “Try Alex” (sign up)
- Header (app): New SOP, Upload, Record, Create from prompt, Import
- Footer: Legal links, email, social


