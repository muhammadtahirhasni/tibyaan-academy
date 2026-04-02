# Tibyaan Academy

**Modern Digital Madrasah** — Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz.

## Features

- **4 Course Tracks** — Nazra (Quran reading), Hifz (memorization), Arabic Language, Aalim (Dars-e-Nizami)
- **Live 1-on-1 Classes** — Matched teachers with video recordings & scheduling
- **AI Ustaz** — Claude-powered Islamic tutor with per-course specialization
- **AI Tajweed Checker** — Audio recitation analysis with Whisper + Claude
- **Teacher AI Assistant** — Lesson planning, quiz generation, student analysis
- **Multi-Agent System** — 10 AI agents (content, SEO, moderation, matching, scheduling, etc.)
- **Gamification** — Points, streaks, badges, leaderboard for student engagement
- **Kids Activities** — 8 interactive Arabic learning games
- **Daily Dars** — AI-generated daily Islamic lessons (5 categories)
- **Dars Circles** — Group study sessions with enrollment & reminders
- **Parent Reports** — Weekly WhatsApp summaries of student progress
- **5 Languages** — Urdu, Arabic, English, French, Indonesian (with RTL support)
- **Stripe Payments** — Monthly/yearly subscriptions with family discounts
- **PWA** — Installable with offline support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Database | Neon PostgreSQL (serverless), Drizzle ORM |
| Auth | Supabase Auth (email + OAuth) |
| AI | Anthropic Claude, Groq Whisper |
| Payments | Stripe (subscriptions + webhooks) |
| Email | Resend (transactional) |
| Video Storage | Cloudflare R2 |
| Monitoring | Sentry, Vercel Analytics |
| i18n | next-intl (5 locales) |
| Deployment | Vercel (Edge + Cron) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd tibyaan-academy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

See `.env.example` for all required variables. Key services:

- **Supabase** — Authentication
- **Neon** — PostgreSQL database
- **Anthropic** — Claude AI (Ustaz, blog, tajweed, teacher assistant)
- **Groq** — Whisper audio transcription
- **Stripe** — Payments & subscriptions
- **Resend** — Transactional emails
- **Sentry** — Error tracking

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
src/
  app/
    [locale]/(public)/    # Public pages (home, courses, blog, etc.)
    [locale]/(auth)/      # Login, signup, onboarding
    [locale]/student/     # Student dashboard (13 pages)
    [locale]/teacher/     # Teacher dashboard (13 pages)
    [locale]/admin/       # Admin dashboard (12 pages)
    api/                  # 60+ API routes
  components/
    ui/                   # shadcn/ui base components
    shared/               # Navbar, footer, notifications
    homepage/             # Landing page sections
    kids-games/           # 8 interactive games
  lib/
    agents/               # Multi-agent AI system (10 agents)
    db/                   # Drizzle schema + queries (36 tables)
    supabase/             # Auth utilities
    stripe/               # Payment helpers
    claude/               # AI system prompts
messages/                 # i18n translations (5 locales)
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full production deployment guide.

## License

All rights reserved.
