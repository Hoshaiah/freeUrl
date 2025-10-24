# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreeURL is a Next.js link shortener with a unique twist: it shows customizable landing pages (typically newsletter signups) before redirecting users to their destination. The app includes user authentication via Google OAuth, Stripe subscription management with tiered plans, and analytics tracking.

## Development Commands

### Basic Operations
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with test data (uses tsx)
```

### Database Operations
```bash
npx prisma studio                           # Open Prisma Studio GUI
npx prisma migrate dev --name <name>       # Create and apply migration
npx prisma migrate deploy                  # Apply migrations (production)
npx prisma migrate reset                   # Reset database (dev only)
npx prisma generate                        # Generate Prisma Client
npx prisma db push                         # Push schema changes without migration
```

### Docker Operations
```bash
docker-compose up -d              # Start containers in background
docker-compose down               # Stop and remove containers
docker-compose up -d --build      # Rebuild and restart containers
docker-compose logs -f app        # Follow app logs
```

### Environment Setup
Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Architecture & Key Concepts

### Authentication & Authorization
- Uses **NextAuth.js v4** with Prisma adapter and database sessions
- Google OAuth is the primary authentication provider
- Auth configuration lives in `lib/auth.ts` with custom session callback that adds `user.id`
- Session strategy is `database` (not JWT)
- Protected routes check session using `getServerSession(authOptions)`
- Anonymous users can create links, but only authenticated users can access the dashboard

### Subscription & Plan Management
- Three-tiered subscription system: `free`, `core`, `pro` (defined in `lib/subscription.ts`)
- Plan limits enforced via `checkLinkLimit()` and `checkEmailSignupLimit()`
- Stripe integration for payment processing (`lib/stripe.ts`)
- Subscription status checked with 24-hour grace period for webhook delays
- Plan limits:
  - **Free**: 3 links, 10 email signups, 1 landing page, 0 QR codes
  - **Core**: 100 links, unlimited signups, 5 landing pages, 5 QR codes
  - **Pro**: 3000 links, unlimited signups, 20 landing pages, 200 QR codes

### Link Shortening Flow
1. User submits URL to `/api/shorten` (POST)
2. System generates 6-character `shortCode` (with collision detection, max 10 attempts)
3. Link record created in DB, associated with `userId` if authenticated
4. **Default landing page automatically created** from `PAGE_TEMPLATES.default`
5. User receives `shortCode` to share

### Landing Page System
- **Customizable interstitial pages** shown before redirect (stored in `Page` model)
- Four pre-built templates in `lib/pageTemplates.ts`: default, minimal, benefits, urgency
- Templates are full HTML/CSS documents with embedded JavaScript
- Landing pages use `window.__LINK_DATA__` for SSR data injection or fallback to `/api/redirect/[shortCode]`
- Forms post to `/api/newsletter` with `email` and `linkId`
- Default template auto-created for all new links in `/api/shorten`

### Redirect Flow
1. User visits `/{shortCode}` → renders landing page from `app/[shortCode]/page.tsx`
2. Page fetches custom HTML/CSS from `/api/pages/by-shortcode/[shortCode]`
3. Landing page calls `/api/redirect/[shortCode]` to get `originalUrl` and log click
4. After interaction (subscribe or skip), JavaScript redirects to `originalUrl`

### Analytics & Tracking
- Every click logged in `Click` model (via `/api/redirect/[shortCode]`)
- Email signups tracked in `EmailSignup` with `linkId` attribution
- Dashboard shows per-link metrics: clicks, signups, conversion rates
- Links can be toggled active/inactive via `/api/links/[linkId]/toggle`

### Database Schema Relationships
- `User` → `Link[]`, `Account[]`, `Session[]`, `Subscription?`
- `Link` → `Click[]`, `EmailSignup[]`, `Page?`, `User?`
- `EmailSignup` → `Link?` (for conversion attribution)
- `Page` → `Link` (one-to-one, cascade delete)
- `Subscription` → `User` (one-to-one, cascade delete)

### Client/Server Architecture
- **Server Components** by default (Next.js 15 App Router)
- Client components marked with `'use client'` (e.g., `LinksClient.tsx`, `SignupsClient.tsx`)
- Server actions not used; all mutations via API routes
- API routes use `NextRequest`/`NextResponse` with proper error handling
- Prisma client accessed via singleton pattern in `lib/prisma.ts`

## Important Patterns & Conventions

### Path Aliases
- `@/*` maps to project root (e.g., `@/lib/prisma`, `@/app/components`)

### Error Handling
- API routes return proper HTTP status codes (400, 403, 500)
- Always check `session?.user?.id` for authenticated endpoints
- Validate URLs with `isValidUrl()` helper (checks http/https protocols)
- Wrap Prisma queries in try-catch with fallback error responses

### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Generated via `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (client-side)

### Prisma Best Practices
- Use `prisma.link.findUnique({ where: { shortCode } })` for shortCode lookups
- Use `@@index` for frequently queried fields (`userId`, `linkId`, `isActive`)
- All IDs use `@default(cuid())` for collision-resistant identifiers
- Use `onDelete: Cascade` for dependent records, `SetNull` for optional relations

### Stripe Integration
- Webhooks at `/api/stripe/webhook` handle subscription lifecycle events
- Checkout session created via `/api/stripe/create-checkout-session`
- Customer portal accessed via `/api/stripe/create-portal-session`
- Always verify webhook signatures using `stripe.webhooks.constructEvent()`

## Testing & Development Workflow

### Quick Local Setup (Docker)
1. Copy `.env.example` to `.env` and fill in credentials
2. Run `docker-compose up -d`
3. Access app at `http://localhost:3000`

### Local Setup (Without Docker)
1. Install dependencies: `npm install`
2. Setup PostgreSQL database
3. Create `.env` with `DATABASE_URL` and auth credentials
4. Run migrations: `npx prisma migrate dev --name init`
5. Generate client: `npx prisma generate`
6. Start dev server: `npm run dev`

### Making Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma Client auto-regenerates
4. For production: `npx prisma migrate deploy`

### Adding New Landing Page Templates
1. Add template object to `PAGE_TEMPLATES` array in `lib/pageTemplates.ts`
2. Include unique `id`, `name`, `description`, `category`, `preview`, `html`, `css`
3. HTML must include newsletter form with `id="newsletter-form"` and skip button with `id="skip-btn"`
4. JavaScript must handle `window.__LINK_DATA__` and fetch from `/api/redirect/[shortCode]` as fallback

## Production Deployment

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Run `npx prisma migrate deploy` on production DB
4. Update Google OAuth redirect URIs to include production domain

### Docker Deployment
```bash
docker build -t freeurl:latest .
docker tag freeurl:latest your-registry/freeurl:latest
docker push your-registry/freeurl:latest
```

Compatible with DigitalOcean App Platform, AWS ECS/Fargate, Google Cloud Run, Railway, Fly.io

## Known Quirks & Important Notes

- **Auto-created pages**: Every link automatically gets a default landing page template on creation
- **Anonymous link creation**: Users don't need to sign in to create links, but won't see them in dashboard
- **Grace period**: Subscription checks include 24-hour grace period for webhook delays
- **Session strategy**: Uses database sessions (not JWT), so session data persists across deploys
- **TypeScript strict mode**: Enabled, so all types must be properly defined
- **Next.js 15**: Uses App Router, not Pages Router
- **React 19**: Latest React version with new features
- **Tailwind CSS 4**: Uses new `@tailwindcss/postcss` package
