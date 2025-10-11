# Email Signup Tracking

## Overview

The `EmailSignup` model now tracks which user signed up for the newsletter and from which link they came from. This provides better analytics and user attribution.

## Updated Schema

```prisma
model EmailSignup {
  id        String   @id @default(cuid())
  email     String   @unique
  userId    String?  // ← NEW: Which user signed up
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  linkId    String?  // ← NEW: Which link they came from
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([linkId])
}
```

## What's Tracked

### 1. **User ID** (`userId`)
- If a logged-in user signs up for the newsletter, their user ID is captured
- If an anonymous visitor signs up, `userId` is `null`
- Allows you to see which of your users subscribed to the newsletter

### 2. **Link ID** (`linkId`)
- Tracks which shortened link led to the newsletter signup
- Helps you understand which links drive newsletter signups
- Useful for conversion tracking and marketing analytics

### 3. **Email** (`email`)
- The email address submitted
- Unique constraint ensures no duplicate signups

## User Flow

### Scenario 1: Anonymous User Clicks Link
```
1. Anonymous user clicks short link (yoursite.com/abc123)
2. Sees newsletter interstitial page
3. Enters email "user@example.com"
4. Submits form
```

**Database Record:**
```javascript
{
  id: "signup_789",
  email: "user@example.com",
  userId: null,              // ← Anonymous user
  linkId: "link_abc123",     // ← From this link
  createdAt: "2025-10-10"
}
```

### Scenario 2: Logged-In User Clicks Link
```
1. Logged-in user (John, user_456) clicks short link
2. Sees newsletter interstitial page
3. Enters email "john@example.com"
4. Submits form
```

**Database Record:**
```javascript
{
  id: "signup_890",
  email: "john@example.com",
  userId: "user_456",        // ← John's user ID
  linkId: "link_abc123",     // ← From this link
  createdAt: "2025-10-10"
}
```

## API Changes

### `/api/newsletter` (POST)

**Request Body:**
```json
{
  "email": "user@example.com",
  "linkId": "link_abc123"      // ← NEW: Link ID from interstitial page
}
```

**What it does:**
1. Gets current session (if user is logged in)
2. Validates email
3. Creates EmailSignup with:
   - Email
   - User ID (if logged in, null if anonymous)
   - Link ID (if provided)

### `/api/redirect/[shortCode]` (GET)

**Response:**
```json
{
  "originalUrl": "https://example.com",
  "linkId": "link_abc123"      // ← NEW: Returns link ID
}
```

## Analytics Possibilities

With this data, you can now answer:

### User Attribution
- "How many of my registered users signed up for the newsletter?"
- "Which users subscribed?"
- Query: `SELECT * FROM EmailSignup WHERE userId IS NOT NULL`

### Link Performance
- "Which short links drive the most newsletter signups?"
- "What's the conversion rate from link click to newsletter signup?"
- Query: `SELECT linkId, COUNT(*) FROM EmailSignup GROUP BY linkId`

### Conversion Tracking
```sql
-- Newsletter signup rate per link
SELECT
  l.shortCode,
  COUNT(DISTINCT c.id) as total_clicks,
  COUNT(DISTINCT e.id) as newsletter_signups,
  (COUNT(DISTINCT e.id)::float / COUNT(DISTINCT c.id) * 100) as conversion_rate
FROM Link l
LEFT JOIN Click c ON l.id = c.linkId
LEFT JOIN EmailSignup e ON l.id = e.linkId
GROUP BY l.id, l.shortCode
ORDER BY conversion_rate DESC
```

### User Engagement
```sql
-- Find users who both created links AND signed up for newsletter
SELECT
  u.name,
  u.email,
  COUNT(DISTINCT l.id) as links_created,
  COUNT(DISTINCT e.id) as newsletter_signups
FROM User u
LEFT JOIN Link l ON u.id = l.userId
LEFT JOIN EmailSignup e ON u.id = e.userId
GROUP BY u.id, u.name, u.email
HAVING COUNT(DISTINCT e.id) > 0
```

## Dashboard Enhancement Ideas

You could add to the dashboard:

1. **Newsletter Signups Widget**
   - Total signups
   - Signups from logged-in vs anonymous users
   - Signup rate per link

2. **Link Detail View**
   - Show how many newsletter signups each link generated
   - Conversion funnel: Clicks → Newsletter Signups

3. **User Profile**
   - Show if user is subscribed to newsletter
   - Which link they came from when they subscribed

## Testing

To test the functionality:

1. **Create a short link** (while logged in or out)
2. **Click the short link** to see newsletter page
3. **Submit email** on interstitial page
4. **Check database**:
   ```bash
   npx prisma studio
   ```
5. **Verify EmailSignup record** has:
   - ✅ Email
   - ✅ userId (if you were logged in)
   - ✅ linkId (link you clicked from)

## Benefits

✅ **Better Attribution** - Know where signups come from
✅ **User Insights** - Understand user engagement patterns
✅ **Marketing Analytics** - Track link-to-conversion rates
✅ **Privacy-Friendly** - Anonymous users can still sign up
✅ **Flexible** - Both fields are optional (nullable)

## Privacy Considerations

- Anonymous users can still sign up (userId is optional)
- Link tracking is passive (doesn't identify user, just tracks conversion)
- Email is still unique per signup (can't sign up twice)
- User data deleted if user account is deleted (onDelete: SetNull)

---

Now you have full attribution tracking for your newsletter signups! 🎯
