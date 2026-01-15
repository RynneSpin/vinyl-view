# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinyl View is a vinyl record collection management web app with Discogs API integration and phone camera barcode scanning. Built as a multi-user app with Neon Auth authentication, Next.js 15, Neon Postgres, and Prisma ORM.

## Essential Commands

### Development
```bash
npm install           # Install dependencies (auto-runs prisma generate)
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production (includes prisma generate)
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:push      # Push Prisma schema to database (for development)
npm run db:migrate   # Create and apply migrations (for production)
npm run db:studio    # Open Prisma Studio GUI to view/edit database
```

**Important**: Use `db:push` during development for rapid iteration. Use `db:migrate` before deploying to production to create proper migration history.

### Syncing Schema to Production Database

This project uses **separate databases for dev and production**:
- **Dev**: `ep-little-lake-ah2sdshu` (configured in `.env.local`)
- **Production**: `ep-falling-sunset-ahnmw6k0` (configured in Vercel)

When you modify the Prisma schema, you must push changes to **both** databases:

```bash
# 1. Push to dev database (uses .env.local DATABASE_URL)
npm run db:push

# 2. Push to production database (use production DATABASE_URL from .env.local.production)
DATABASE_URL="<production-connection-string>" npx prisma db push
```

If there are potential data loss warnings (e.g., adding unique constraints), add `--accept-data-loss`:
```bash
DATABASE_URL="<production-connection-string>" npx prisma db push --accept-data-loss
```

**Common symptom of out-of-sync databases**: Production errors like "The column does not exist" or Prisma validation errors after deploying schema changes.

## Architecture Overview

### Data Flow Architecture

The app follows a three-tier architecture with a critical external API dependency:

```
Client (React) → API Routes → External API (Discogs)
                    ↓
                Database (Postgres via Prisma)
```

**Key Flow**: User searches/scans → API route calls Discogs → Transform Discogs data → Save to Postgres → Display in UI

### External API Integration: Discogs

The entire app depends on the Discogs API for vinyl metadata. **Critical implementation details**:

1. **Rate Limiting**: Discogs allows 60 requests/minute for authenticated users
   - Implemented in `src/lib/rate-limit.ts` with token bucket algorithm
   - Singleton rate limiter instance in `src/lib/discogs.ts`
   - Requests automatically queue when limit reached

2. **API Client Pattern**:
   - `DiscogsClient` class in `src/lib/discogs.ts`
   - Server-side only (uses `DISCOGS_USER_TOKEN`)
   - Helper function `getDiscogsClient()` for API routes

3. **Data Transformation**:
   - Discogs responses are transformed in `src/lib/utils.ts`
   - `discogsReleaseToRecord()` maps Discogs API schema to our Record model
   - Critical for handling nested Discogs data (artists[], labels[], formats[])

### Database Schema Design

Three models in `prisma/schema.prisma`:

1. **User**: User accounts from Neon Auth
   - `id`: String (CUID) - matches Neon Auth user ID
   - `email`: String (unique)
   - `name`: String (optional)
   - Auto-created when users authenticate (see Authentication section)

2. **Record**: Main vinyl record data with comprehensive metadata
   - Stores both user data (notes) and Discogs data (all other fields)
   - **Multi-user design**: `@@unique([userId, discogsId])` - Multiple users can own the same album
   - Each user can only have one copy of each album (prevents duplicates per user)
   - Indexed on: artist, title, discogsId, upc, dateAdded, userId
   - Arrays for genres/styles (PostgreSQL array type)
   - `userId` foreign key cascades deletes

3. **DiscogsCache**: Optional response caching (not yet implemented)
   - Designed for future optimization to reduce API calls

**Schema Connection**: The app uses Neon Postgres which requires connection strings:
- `DATABASE_URL`: For Prisma Client queries (connection pooling)
- `POSTGRES_URL_NON_POOLING` or `DIRECT_URL`: For migrations and Prisma Studio (direct connection)

### API Routes Structure

All API routes follow Next.js 15 App Router conventions:

**Records API** (`/api/records`):
- `GET /api/records` - List all with optional filters (sortBy, order, genre, artist)
- `POST /api/records` - Create new record (checks for duplicate discogsId)
- `GET /api/records/[id]` - Get single record
- `PUT /api/records/[id]` - Update record (typically just notes)
- `DELETE /api/records/[id]` - Delete record

**Discogs Proxy API** (`/api/discogs`):
- `GET /api/discogs/search?query=artist+album` - Search by text
- `GET /api/discogs/barcode?barcode=UPC` - Search by barcode/UPC
- `GET /api/discogs/release/[id]` - Get full release details

**Why proxy?**: Keeps `DISCOGS_USER_TOKEN` server-side, handles rate limiting centrally, enables future caching.

**Authentication API** (`/api/auth`):
- `/api/auth/[...all]` - Neon Auth API handler (handles all auth routes)
- `/api/user/sync` - Sync Neon Auth user to Prisma User table
- All record API routes require authentication via `requireAuth()` helper

**Important**: All `/api/records/*` routes now require authentication. The `requireAuth()` helper in `src/lib/auth/helpers.ts` automatically creates User records for new authenticated users.

### Component Organization Pattern

Components are organized by feature domain, not by type:

- `src/components/ui/` - Base UI primitives (Button, Card, Input, Modal, Toast, etc.)
- `src/components/layout/` - App shell (Header with navigation)
- `src/components/records/` - Record display components (Card, Grid, Filters, Stats, VinylFingerprint)
- `src/components/scanner/` - Barcode scanning (uses html5-qrcode library)
- `src/components/add/` - Add record flow components (not yet fully extracted)

**Pattern**: Domain components compose UI primitives. Example: `RecordCard` uses `Badge` and `motion.div` from framer-motion.

### Vinyl Fingerprint Visualization

The `VinylFingerprint` component (`src/components/records/VinylFingerprint.tsx`) is a custom SVG-based radial chart that visualizes the user's collection as a realistic vinyl record.

**Visual Design**:
- Realistic vinyl record appearance with grooves, center label, spindle hole, and shine effects
- Uses SVG gradients and blend modes for depth and realism
- Three data axes displayed as colored segments: Genre (purple), Decade (pink), Country (blue)
- Segment size represents percentage of collection (larger = more records)
- Interactive hover tooltips show detailed stats for each segment

**Data Aggregation**:
- Aggregates records by genre, decade, and country
- Limits to top 6 items per category to avoid visual clutter
- Percentages calculated against total collection size

**Layout**:
- Responsive: chart centered with legend below on mobile, legend to the right on desktop
- Chart scales to fill available space while maintaining aspect ratio
- Legend shows all values with counts for each category

**Key Implementation Details**:
- Pure SVG rendering (no external charting library)
- Uses `screen` blend mode for colored segments to glow on vinyl texture
- Custom tooltip using React state (native SVG `<title>` elements are unreliable)
- 40 concentric groove circles for realistic vinyl appearance

### Custom Hooks Pattern

Three main hooks in `src/hooks/`:

1. **useRecords(filters?)** - Collection data management
   - Fetches records from `/api/records` with filters
   - Provides `addRecord`, `updateRecord`, `deleteRecord` mutations
   - Auto-refetches on filter changes
   - Optimistic updates (mutates local state immediately)

2. **useDiscogs()** - Discogs API queries
   - Wraps `/api/discogs/*` endpoints
   - Methods: `searchByQuery`, `searchByBarcode`, `getRelease`
   - Shares loading/error state across methods

3. **useToast()** - Global toast notification state
   - Manages multiple toasts with unique IDs
   - Auto-dismiss after 3 seconds

**Hook Pattern**: All data-fetching hooks use similar shape: `{ data, loading, error, ...methods }`

### Barcode Scanning Implementation

Critical for UX but requires specific setup:

1. **Library**: html5-qrcode (not react-specific, needs wrapper)
2. **Component**: `src/components/scanner/BarcodeScanner.tsx`
3. **Requirements**:
   - HTTPS (works on localhost, required in production - Vercel provides)
   - Camera permissions (browser prompt)
   - Uses `{ facingMode: 'environment' }` to access back camera on mobile

4. **Flow**: Start scanner → Camera access → Scan barcode → Auto-stop → Search Discogs API

**Common Issue**: If camera doesn't work, check HTTPS and browser permissions.

## Theme System (Tailwind CSS v4)

The app uses a custom dark theme defined in `src/app/globals.css`:

**Color Palette**:
- `vinyl-*` scale (50-950): Grayscale for UI elements
- `accent-purple`: Primary CTA color (#a855f7)
- `accent-pink`, `accent-blue`, `accent-gold`: Secondary accents

**Usage in Components**:
```tsx
bg-vinyl-900    // Background
text-vinyl-50   // Light text
border-vinyl-700 // Borders
bg-accent-purple // Primary buttons
```

**Custom Animations**: Framer Motion used for page transitions and vinyl disc animation on detail page.

## Authentication System (Neon Auth)

The app uses **Neon Auth** (built on better-auth) for user authentication with email/password.

### Architecture

1. **Neon Auth** manages authentication state and sessions
2. **Prisma User table** stores user data for application use
3. **Auto-sync pattern**: Users are automatically created in Prisma when they first authenticate

### Key Files

- `src/lib/auth/server.ts` - Server-side auth client
- `src/lib/auth/client.ts` - Client-side auth client
- `src/lib/auth/helpers.ts` - Auth utilities including `requireAuth()` and auto-user creation
- `src/middleware.ts` - Route protection (redirects to sign-in for protected routes)
- `src/app/auth/*` - Authentication pages (sign-in, sign-up, verify-email)

### Auto-User Creation Pattern

**Critical**: Neon Auth and Prisma User table are separate. The `requireAuth()` helper automatically syncs them:

```typescript
// In src/lib/auth/helpers.ts
async function ensureUserExists(authUser) {
  // Check if user exists in Prisma
  let user = await prisma.user.findUnique({ where: { id: authUser.id } });

  // If not, create them (auto-sync from Neon Auth)
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
      },
    });
  }

  return user;
}
```

Every authenticated API request automatically ensures the user exists in the database. This prevents foreign key constraint errors when creating records.

### Protected Routes

Routes that require authentication (configured in `src/middleware.ts`):
- `/` (home/collection page)
- `/add` (add record page)
- `/records/*` (record detail pages)

Unauthenticated users are redirected to `/auth/sign-in` with a callback URL.

### Email Verification

**Important**: Email verification must be enabled in Neon Console:
1. Go to Neon Console → Your Project → Settings → Auth
2. Enable "Verify at Sign-up"
3. Configure email provider (Neon provides default email service)

Without this enabled, the `/api/auth/email-otp/*` endpoints will return 403 errors.

### Next.js 15 Suspense Requirement

**Critical for build**: Components using `useSearchParams()` must be wrapped in `<Suspense>` boundaries:

```tsx
// ❌ WRONG - Will cause build error
export default function SignInPage() {
  const searchParams = useSearchParams(); // Not wrapped in Suspense
  // ...
}

// ✅ CORRECT
function SignInForm() {
  const searchParams = useSearchParams(); // Component with useSearchParams
  // ...
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
```

This applies to `src/app/auth/sign-in/page.tsx` and `src/app/auth/verify-email/page.tsx`.

## Environment Variables

Required for development and production:

```bash
# Database (get from Neon Console)
DATABASE_URL=                        # Pooled connection (for Prisma queries)
POSTGRES_PRISMA_URL=                 # Same as DATABASE_URL
POSTGRES_URL_NON_POOLING=            # Direct connection (for migrations)
DIRECT_URL=                          # Alternative name for direct connection

# Neon Auth (get from Neon Console → Settings → Auth)
NEON_AUTH_BASE_URL=                  # Auth endpoint (e.g., https://ep-xxx.neonauth.us-east-1.aws.neon.tech/dbname/auth)

# Discogs API (get from discogs.com/settings/developers)
DISCOGS_USER_TOKEN=                  # Personal access token (server-side only)
NEXT_PUBLIC_DISCOGS_CONSUMER_KEY=    # Consumer key (unused but required)
NEXT_PUBLIC_DISCOGS_CONSUMER_SECRET= # Consumer secret (unused but required)

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # CRITICAL: Must be exact URL with no trailing spaces/newlines
                                            # Production: https://your-app.vercel.app
```

**Critical Notes**:
- `DISCOGS_USER_TOKEN` must never be exposed to client. Used only in API routes via `getDiscogsClient()`.
- `NEXT_PUBLIC_APP_URL` is trimmed in code to handle trailing newlines/spaces from environment variable input
- `NEON_AUTH_BASE_URL` must match exactly what's shown in Neon Console (no trailing slashes)

## Adding New Record Sources

If adding support for additional music databases beyond Discogs:

1. Create new API client in `src/lib/` (follow `discogs.ts` pattern)
2. Add transformation function in `src/lib/utils.ts` (follow `discogsReleaseToRecord`)
3. Create new API proxy routes in `src/app/api/`
4. Update `useDiscogs` hook or create new hook for new source
5. Update search UI to support multiple sources (tabs or dropdown)

## Common Gotchas

1. **Prisma Client Generation**: Must run after schema changes or npm install. Build script includes `prisma generate`.

2. **Next.js Image Domains**: Album art comes from Discogs CDN. **All four CDN domains must be configured** in `next.config.ts`:
   ```ts
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'i.discogs.com' },        // Primary image CDN
       { protocol: 'https', hostname: 'img.discogs.com' },      // Website images
       { protocol: 'https', hostname: 'st.discogs.com' },       // Static assets CDN
       { protocol: 'https', hostname: 'api-img.discogs.com' },  // API image CDN
     ]
   }
   ```

   Missing any of these will cause "unconfigured host" errors when loading images.

3. **Client vs Server Components**:
   - API routes and `getDiscogsClient()` are server-only
   - Barcode scanner must be client component ('use client')
   - Page components with hooks must be client components

4. **Discogs API Responses**: Deeply nested. Always check response structure before accessing. Example: `release.artists?.[0]?.name` (optional chaining critical).

5. **Rate Limit Recovery**: If you hit Discogs rate limits, wait 60 seconds. The rate limiter will automatically queue requests.

6. **Multi-User Database Constraints**: The schema uses `@@unique([userId, discogsId])` which means:
   - ✅ Multiple users can own the same album (different userIds, same discogsId)
   - ✅ One user cannot have duplicate albums (same userId + discogsId)
   - If you see "Unique constraint failed on discogsId", check if the user already has that album

7. **Authentication Foreign Key Dependencies**: Records must have a valid `userId` that exists in the User table. The `requireAuth()` helper handles this automatically by creating users on first authentication.

## Deployment (Vercel)

### Initial Setup

1. Connect GitHub repo to Vercel
2. Create Neon Postgres database:
   - Go to Neon Console (https://console.neon.tech)
   - Create new project or use existing
   - Create "main" branch database
   - Copy connection strings from "Connection Details"

3. Configure Neon Auth:
   - In Neon Console → Project Settings → Auth
   - Enable "Email/Password" authentication
   - **Enable "Verify at Sign-up"** (required for email verification to work)
   - Copy the "Auth Base URL"

4. Add environment variables in Vercel dashboard:
   ```
   DATABASE_URL=<from Neon>
   POSTGRES_URL_NON_POOLING=<from Neon>
   NEON_AUTH_BASE_URL=<from Neon Auth settings>
   DISCOGS_USER_TOKEN=<your token>
   NEXT_PUBLIC_DISCOGS_CONSUMER_KEY=<your key>
   NEXT_PUBLIC_DISCOGS_CONSUMER_SECRET=<your secret>
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Important**: Ensure `NEXT_PUBLIC_APP_URL` has no trailing spaces or newlines

5. Deploy - build automatically runs `prisma generate` and `next build`

### Common Deployment Issues

1. **Email verification 403 errors**: Check that "Verify at Sign-up" is enabled in Neon Console → Auth settings

2. **useSearchParams build errors**: Ensure all pages using `useSearchParams()` wrap it in `<Suspense>` boundaries

3. **Image loading errors**: Verify all four Discogs CDN domains are in `next.config.ts`

4. **Foreign key constraint errors**: Usually means authentication isn't working properly. Check `NEON_AUTH_BASE_URL` is correct.

5. **Invalid base URL errors**: Environment variable has trailing newline - the code trims it, but verify the URL in Vercel settings

### Post-Deploy Testing

1. Test sign-up flow (should receive verification email)
2. Test barcode scanning (requires HTTPS which Vercel provides)
3. Test adding records to collection
4. Verify images load from Discogs CDN

## Utility Scripts

Helper scripts in `scripts/` directory for debugging:

- `verify-records.ts` - Check all records in database with details
- `check-users.ts` - List all users and their record counts
- `check-duplicates.ts` - Find duplicate userId+discogsId combinations
- `check-tables.ts` - Inspect database schema and structure
- `delete-records.ts` - Clean up records (use with caution)

Run with: `npx tsx scripts/<script-name>.ts`
