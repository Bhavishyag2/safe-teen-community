# Safe Teen Community

An **anonymous, safety-first community platform for teenage girls in India** — a place to ask questions and get advice on relationships, health, school, puberty, and self-care without exposing their real identity.

The product is built around a single hard problem: **how do you let teenagers talk freely online while protecting them from bullying, predators, self-harm spirals, and harmful content?** This repo is my exploration of that problem — the **verification, safety flows, and AI-guided moderation** that have to sit underneath a community like this before a single post goes live.

> ⚠️ **Portfolio / learning project.** It runs end-to-end in a mock "dev mode" with no backend required. Third-party integrations (Supabase, Google Perspective API, Anthropic, Resend, ID-verification providers) are wired as integration points rather than provisioned production services.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Web** (API + admin/moderation) | **Next.js 14** (App Router), **React 18**, TypeScript, Tailwind CSS, Radix UI |
| **Mobile** | **React Native** (Expo ~51), expo-router, Zustand |
| **Database** | **PostgreSQL** via Supabase — Row Level Security on every table |
| **AI moderation** | Google **Perspective API** + custom grooming/PII detection layer |
| **AI companion** | **Anthropic Claude** (`@anthropic-ai/sdk`) with crisis detection |
| **Validation** | Zod schemas on all API input |
| **Email** | Resend (verification, parental consent) |

Three surfaces (`web`, `mobile`) share one TypeScript source of truth (`shared`), backed by a versioned PostgreSQL schema (`supabase`).

---

## 🛡️ Safety & Trust Architecture

This is the core of the project. Everything below is implemented in the schema, services, and API routes — not just described.

### 1. Identity & Age Verification
*(`supabase/migrations/008_create_verification_tables.sql`)*

- **School-email verification** — a whitelist of verified Indian school domains (DPS, DAV, Kendriya Vidyalaya, etc.); a Postgres trigger auto-verifies users whose confirmed email matches a known school domain.
- **ID verification** — pluggable methods (`email_domain`, `idfy`, `digilocker`, `manual`) for Aadhaar / PAN / student-ID checks. Provider reference IDs are **hashed**, never stored raw.
- **Parental consent for under-16s (DPDP Act)** — token + OTP flow sent to a parent's email, with attempt limits, a 7-day expiry, and capture of consent IP / timestamp / user-agent for an auditable record.

### 2. Anonymous by Design
- Users have a validated **pseudo-name** (3–30 chars, alphanumeric) and a chosen **avatar** — real names are never displayed.
- The AI companion is explicitly instructed to **never solicit** a real name, location, or school, and to remind users not to share personal info.

### 3. AI-Guided Content Moderation (multi-layer)

Every piece of user content is screened *before* it can be published, by three complementary layers:

**Layer 1 — Toxicity scoring (bullying & harmful content)**
`web/lib/services/moderation.ts` scores text via Google Perspective API across `TOXICITY`, `SEVERE_TOXICITY`, `IDENTITY_ATTACK`, `INSULT`, `PROFANITY`, `THREAT`, and `SEXUALLY_EXPLICIT`. Thresholds drive the outcome: **auto-block ≥ 0.9**, **route to human review ≥ 0.6**, safe < 0.3.

**Layer 2 — Predatory-behavior & grooming detection**
A custom rule layer flags the patterns toxicity models miss: attempts to move kids off-platform or extract personal info — `"meet up"`, `"whatsapp"`, `"snapchat"`, `"which school"`, `"where do you live"` — plus regex for Aadhaar-style, phone-number, and PAN patterns. These short-circuit straight to block/review.

**Layer 3 — Crisis detection (self-harm & abuse)**
`shared/constants/chatbot.ts` monitors the AI companion's conversations for crisis signals across **self-harm/suicide, abuse, and eating disorders**, and responds with tailored, non-judgmental messages routing to **real Indian helplines** (Vandrevala, iCall, Childline 1098, Women Helpline 181, NIMHANS, Police 100).

### 4. Human-in-the-Loop Moderation
*(`supabase/migrations/005_create_moderation_queue.sql`)*

- A **moderation queue** with a DB trigger that auto-assigns priority (`urgent` / `high` / `normal` / `low`) from the AI score, so the worst content surfaces first.
- **User reporting** (`harassment`, `self_harm`, `violence`, `personal_info`, `underage_content`, …) that auto-creates/escalates a queue entry via trigger.
- A full **`moderation_actions` audit log** (approve / reject / warn / suspend / ban) plus a **`user_warnings`** system with severity and expiry.
- All of it gated behind **Row Level Security** so only `moderator` / `admin` roles can act.

### 5. Privacy & Compliance
- **Row Level Security** on every table; role-based access (`user` / `moderator` / `admin`).
- **DPDP Act (India)** alignment via under-16 parental consent.
- Pre-publication moderation — nothing user-generated goes live unreviewed.

---

## Repository Structure

```
safe-teen-community/
├── web/          # Next.js 14 — API routes, moderation/admin, App Router pages
│   ├── app/api/  #   auth · content · messages · chat · admin/moderation
│   └── lib/      #   services (chatbot, moderation, email) · Zod validators
├── mobile/       # Expo / React Native app (auth, tabs, content, chat)
├── shared/       # Shared TS types, constants (sections, chatbot, helplines), mock data
└── supabase/     # 8 PostgreSQL migrations + seed data (users, content, comments,
                  #   messages, moderation queue, chat history, notifications, verification)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- (Optional, for real backend) Supabase, and API keys for Perspective / Anthropic / Resend

### Run in dev mode (mock data, no backend)
```bash
# Web (Next.js) — http://localhost:3000
cd web
npm install
cp .env.example .env.local      # NEXT_PUBLIC_DEV_MODE=true
npm run dev

# Mobile (Expo)
cd ../mobile
npm install
cp .env.example .env            # EXPO_PUBLIC_DEV_MODE=true
npx expo start
```

Dev mode serves mock users and content from `shared/mock/`, so the UI and flows are fully explorable without provisioning a database.

### Connect a real backend (optional)
1. Create a Supabase project and run the migrations in `supabase/migrations/` (in order).
2. Fill in the credentials and API keys referenced in each `.env.example`.
3. Set `*_DEV_MODE=false`.

---

## Database Schema (PostgreSQL)

| Table(s) | Purpose |
| --- | --- |
| `users` | Pseudonymous profiles, verification & consent status, role |
| `content`, `comments` | Posts (article / forum / poll / quiz) and threaded comments — moderated |
| `conversations`, `messages` | Direct & group messaging |
| `chat_sessions`, `chat_messages` | AI companion history |
| `moderation_queue`, `reports`, `moderation_actions`, `user_warnings` | Trust & safety pipeline |
| `verification_requests`, `parental_consent_requests`, `school_email_domains` | Identity, age & consent |

---

## License

Private — all rights reserved. Shared publicly for portfolio and review purposes only.
