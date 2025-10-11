# FreeURL - Link Shortener with Newsletter Interstitial

A Next.js link shortener that shows a newsletter signup page before redirecting users to their destination.

## Features

- 🔗 Shorten long URLs to short, shareable links
- 📧 Newsletter signup interstitial page before redirect
- 📊 Analytics dashboard with click tracking
- 🎨 Clean, responsive UI with Tailwind CSS
- 🗄️ PostgreSQL database with Prisma ORM
- ⚡ Built with Next.js App Router

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Option 1: Docker (Recommended - Easiest Setup)

**Prerequisites:**
- Docker and Docker Compose installed

**Steps:**

1. **Clone the repository** (or you're already here!)

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start a PostgreSQL database container
   - Build and start the Next.js app container
   - Automatically run database migrations
   - Expose the app on http://localhost:3000

3. **Open your browser** to [http://localhost:3000](http://localhost:3000)

4. **Stop the application**:
   ```bash
   docker-compose down
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

### Option 2: Local Development (Without Docker)

**Prerequisites:**
- Node.js 18+ installed
- PostgreSQL database (local or hosted)

**Steps:**

1. **Clone the repository** (or you're already here!)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your database**:

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/freeurl?schema=public"
   ```

   Replace with your PostgreSQL connection string. For cloud databases, you can use:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Neon](https://neon.tech/)
   - [Supabase](https://supabase.com/)

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── [shortCode]/          # Newsletter interstitial page
│   └── page.tsx
├── api/
│   ├── newsletter/       # Email signup endpoint
│   │   └── route.ts
│   ├── redirect/         # Fetch link and log clicks
│   │   └── [shortCode]/
│   │       └── route.ts
│   └── shorten/          # Create short links
│       └── route.ts
├── dashboard/            # Analytics dashboard
│   └── page.tsx
└── page.tsx              # Homepage with URL shortener form

lib/
└── prisma.ts             # Prisma client singleton

prisma/
└── schema.prisma         # Database schema
```

## Database Schema

### Link
- `id`: Unique identifier
- `shortCode`: Short URL code (unique)
- `originalUrl`: Original long URL
- `createdAt`: Timestamp
- `clicks`: Relation to Click records

### Click
- `id`: Unique identifier
- `linkId`: Foreign key to Link
- `timestamp`: When the click occurred

### EmailSignup
- `id`: Unique identifier
- `email`: Email address (unique)
- `createdAt`: Timestamp

## User Flow

1. User enters a long URL on the homepage
2. System generates a unique short code
3. User receives shortened URL (e.g., `yoursite.com/abc123`)
4. When someone clicks the short URL:
   - They see a newsletter signup page
   - They can either:
     - Enter their email and subscribe
     - Click "Continue without signing up"
   - Click is logged to the database
   - User is redirected to the original URL

## Deployment

### Deploy with Docker

The application is fully containerized and ready to deploy to any Docker-compatible hosting:

**Docker Hub / Container Registry:**
```bash
# Build the image
docker build -t freeurl:latest .

# Tag and push to your registry
docker tag freeurl:latest your-registry/freeurl:latest
docker push your-registry/freeurl:latest
```

**Deploy to Cloud Platforms:**
- **DigitalOcean App Platform**: Deploy directly from Docker Compose
- **AWS ECS/Fargate**: Use the Dockerfile
- **Google Cloud Run**: Deploy containerized app
- **Railway**: Connect your repo and deploy
- **Fly.io**: Use `flyctl deploy`

### Deploy to Vercel (Alternative)

1. **Push your code to GitHub**

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. **Add environment variables**:
   - Add your `DATABASE_URL` in the Vercel dashboard
   - For Vercel Postgres:
     ```bash
     # Install Vercel Postgres
     npm install @vercel/postgres
     ```
     Then use the connection string from your Vercel Postgres dashboard

4. **Deploy**:
   - Vercel will automatically build and deploy
   - Run migrations on your production database:
     ```bash
     npx prisma migrate deploy
     ```

## Development

- **View database in Prisma Studio**:
  ```bash
  npx prisma studio
  ```

- **Create a new migration**:
  ```bash
  npx prisma migrate dev --name your_migration_name
  ```

- **Reset database** (dev only):
  ```bash
  npx prisma migrate reset
  ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

## Features to Add

- [ ] Custom short codes (user-defined)
- [ ] Link expiration dates
- [ ] Password-protected links
- [ ] QR code generation
- [ ] Export analytics to CSV
- [ ] User authentication
- [ ] Link editing/deletion
- [ ] Bulk link creation
- [ ] API rate limiting
- [ ] Link preview cards

## License

MIT
