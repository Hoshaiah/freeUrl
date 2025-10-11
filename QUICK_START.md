# Quick Start Guide

## Step 1: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it into your `.env` file as the `NEXTAUTH_SECRET` value.

## Step 2: Set Up Google OAuth (Required for Sign-In)

### Option A: Follow the Full Guide
See `AUTH_SETUP.md` for detailed instructions.

### Option B: Quick Steps
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret
7. Paste them into your `.env` file

## Step 3: Update Your .env File

Open `.env` and fill in your credentials:

```env
# Database (already configured for Docker)
DATABASE_URL="postgresql://freeurl:freeurl_password@localhost:5432/freeurl?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-your-generated-secret-here"  # ← CHANGE THIS

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"  # ← CHANGE THIS
GOOGLE_CLIENT_SECRET="your-client-secret"  # ← CHANGE THIS
```

## Step 4: Start the Application

```bash
# Stop existing containers (if running)
docker-compose down

# Rebuild with new environment variables
docker-compose up -d --build

# Check logs to ensure it started successfully
docker-compose logs -f app
```

## Step 5: Test Authentication

1. Open http://localhost:3000
2. Click "Sign In" in the navbar
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to the dashboard!

## Troubleshooting

**"Configuration error"**
- Make sure you've set `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` in `.env`
- Rebuild the Docker containers: `docker-compose down && docker-compose up -d --build`

**"redirect_uri_mismatch"**
- Check that your Google OAuth redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`

**Container won't start**
- Check logs: `docker-compose logs app`
- Make sure ports 3000 and 5432 aren't already in use

## What's Required vs Optional

### ✅ Required (for full functionality):
- `DATABASE_URL` - ✅ Already configured for Docker
- `NEXTAUTH_URL` - ✅ Already set to localhost
- `NEXTAUTH_SECRET` - ❌ **YOU MUST GENERATE THIS**
- `GOOGLE_CLIENT_ID` - ❌ **YOU MUST GET FROM GOOGLE**
- `GOOGLE_CLIENT_SECRET` - ❌ **YOU MUST GET FROM GOOGLE**

### Without Google OAuth:
- You can still create short links (no sign-in required)
- You just won't be able to sign in or access the dashboard
- The app will work, but authentication features will be disabled

## Next Steps After Setup

- Create some links while signed in
- View your analytics in the dashboard
- Share your short links
- Deploy to production (see README.md)

## Need Help?

- Full auth setup guide: See `AUTH_SETUP.md`
- Docker issues: See `README.md`
- Google OAuth setup: https://console.cloud.google.com/
