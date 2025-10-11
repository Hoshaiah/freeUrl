# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it "FreeURL" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Click "Create"
   - Fill in required fields:
     - App name: `FreeURL`
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Skip this (click "Save and Continue")
   - Test users: Add your email for testing
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "FreeURL Web Client"
   - Authorized JavaScript origins:
     - http://localhost:3000
     - http://localhost:3000 (for development)
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - https://yourdomain.com/api/auth/callback/google (for production)
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: `xxxxx.apps.googleusercontent.com`
     - **Client Secret**: `xxxxxxx`
   - Copy both values!

## Step 2: Update Environment Variables

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Add your Google credentials to `.env`**:
   ```env
   # Database
   DATABASE_URL="postgresql://freeurl:freeurl_password@localhost:5432/freeurl?schema=public"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secret-key-here"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-client-id-from-google-console.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret-from-google-console"
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as your `NEXTAUTH_SECRET`

## Step 3: Update Database Schema

Run the Prisma migration to add authentication tables:

```bash
# Stop Docker containers
docker-compose down

# Generate Prisma client
npx prisma generate

# Restart Docker (database will be updated automatically via db push)
docker-compose up -d --build
```

## Step 4: Test Authentication

1. **Start the app** (if not already running):
   ```bash
   docker-compose up -d
   ```

2. **Visit**: http://localhost:3000

3. **Click "Sign In"** in the navbar

4. **Click "Continue with Google"**

5. **Sign in with your Google account**

6. **You should be redirected back to the dashboard!**

## For Production Deployment

When deploying to production (e.g., Vercel):

1. **Add environment variables** in your hosting platform:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. **Update Google OAuth redirect URIs**:
   - Go back to Google Cloud Console
   - Add production callback URL:
     - `https://yourdomain.com/api/auth/callback/google`

3. **Run database migrations** on production:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

**"Error: redirect_uri_mismatch"**
- Make sure the redirect URI in Google Console matches exactly:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://yourdomain.com/api/auth/callback/google` (prod)

**"Error: Configuration"**
- Check that all environment variables are set correctly
- Make sure `NEXTAUTH_SECRET` is generated and set

**Dashboard shows "no links"**
- That's normal! Create a link while signed in
- Links are now associated with your user account
- Old links (created before auth) won't show up

## Features Now Available

✅ **Google Sign-In** - Users can sign in with their Google account
✅ **Protected Dashboard** - Only logged-in users can access their dashboard
✅ **User-Specific Links** - Each user only sees their own links
✅ **Anonymous Link Creation** - Users can still create links without signing in
✅ **Profile Display** - User name and profile picture shown in navbar
✅ **Sign Out** - Users can sign out

## Next Steps

Consider adding:
- Email/password authentication
- GitHub OAuth provider
- Link editing/deletion
- Link expiration
- Custom short codes
- Team collaboration
