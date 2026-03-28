# Tibyaan Academy — Production Deployment Guide

## Prerequisites

- GitHub repository with all code pushed
- Accounts: Vercel, Neon, Supabase, Stripe, Anthropic, Resend, Sentry
- Custom domain (tibyaan.com) with DNS access

---

## 1. Neon Database (Production)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or use production branch
3. Enable **connection pooling** (recommended for serverless)
4. Copy the pooled connection string
5. Run migrations:
   ```bash
   DATABASE_URL="your-production-url" npm run db:push
   ```

---

## 2. Supabase (Production)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a production project (or use existing)
3. Go to **Authentication > URL Configuration**:
   - Site URL: `https://tibyaan.com`
   - Redirect URLs: `https://tibyaan.com/**`
4. Go to **Authentication > Providers** and configure OAuth providers if needed
5. Copy: Project URL, Anon Key, Service Role Key

---

## 3. Stripe (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from **Test mode** to **Live mode**
3. Copy live API keys (publishable + secret)
4. Create a production webhook:
   - Endpoint: `https://tibyaan.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the webhook signing secret

---

## 4. Sentry (Error Tracking)

1. Go to [Sentry](https://sentry.io) and create a Next.js project
2. Copy the DSN
3. Set both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to the same value

---

## 5. Vercel Deployment

### Import & Configure

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New > Project**
3. Import the GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./` (or `tibyaan-academy/` if monorepo)

### Environment Variables

Add all variables from `.env.example` in Vercel dashboard (**Settings > Environment Variables**):

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |
| `DATABASE_URL` | Production |
| `ANTHROPIC_API_KEY` | Production |
| `STRIPE_SECRET_KEY` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production |
| `STRIPE_WEBHOOK_SECRET` | Production |
| `RESEND_API_KEY` | Production |
| `NEXT_PUBLIC_APP_URL` | Production (`https://tibyaan.com`) |
| `CRON_SECRET` | Production |
| `ADMIN_SECRET` | Production |
| `SENTRY_DSN` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Production |

Generate secrets:
```bash
openssl rand -hex 32  # For CRON_SECRET
openssl rand -hex 32  # For ADMIN_SECRET
```

### Enable Analytics

1. Go to **Vercel Dashboard > Project > Analytics**
2. Click **Enable** for Web Analytics
3. Click **Enable** for Speed Insights

### Cron Jobs

The `vercel.json` configures a daily cron job at 6:00 AM UTC for blog generation.
Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` header.

Verify in **Vercel Dashboard > Project > Cron Jobs** after deployment.

---

## 6. DNS Configuration

Add these DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

Then in Vercel: **Settings > Domains > Add `tibyaan.com`** and `www.tibyaan.com`.

---

## 7. Monitoring Setup

### UptimeRobot (Free Tier)

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://tibyaan.com/api/health`
   - Monitoring interval: 5 minutes
3. Add alert contacts (email / Slack / Telegram)

---

## Post-Deployment Checklist

- [ ] Site loads at `https://tibyaan.com`
- [ ] HTTPS redirect works (http → https)
- [ ] All 5 locales load (`/en`, `/ur`, `/ar`, `/fr`, `/id`)
- [ ] Supabase auth works (sign up, sign in, sign out)
- [ ] Student dashboard loads after login
- [ ] Teacher panel accessible for teacher accounts
- [ ] AI Ustaz chat responds correctly
- [ ] Kids activities page loads
- [ ] Stripe checkout completes (use test card first if needed)
- [ ] Blog posts display correctly
- [ ] Health endpoint returns 200: `curl https://tibyaan.com/api/health`
- [ ] Cron job appears in Vercel dashboard
- [ ] Sentry captures test error (check Sentry dashboard)
- [ ] Security headers present: `curl -I https://tibyaan.com`
- [ ] UptimeRobot monitoring active

---

## Useful Commands

```bash
# Database
npm run db:generate    # Generate migration files
npm run db:migrate     # Run pending migrations
npm run db:push        # Push schema directly (dev/initial setup)
npm run db:studio      # Open Drizzle Studio GUI

# Development
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
```

---

## Rollback Procedure

1. Go to **Vercel Dashboard > Deployments**
2. Find the last working deployment
3. Click **...** > **Promote to Production**
4. If DB migration caused issues, restore from Neon point-in-time recovery

---

## Environment-Specific Notes

- **CRON_SECRET**: Vercel uses this to authenticate cron job requests. Must match in both Vercel env vars and `vercel.json` cron config.
- **DATABASE_URL**: Use the **pooled** connection string from Neon for serverless environments.
- **STRIPE_WEBHOOK_SECRET**: Different for test vs live mode. Update when switching.
- **NEXT_PUBLIC_APP_URL**: Must be `https://tibyaan.com` in production (no trailing slash).
