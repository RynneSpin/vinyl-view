# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinyl View is a vinyl record collection management web app with Discogs API integration and phone camera barcode scanning. Built as a single-user app (no authentication) with Next.js 15, Vercel Postgres, and Prisma ORM.

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

Two models in `prisma/schema.prisma`:

1. **Record**: Main vinyl record data with comprehensive metadata
   - Stores both user data (notes) and Discogs data (all other fields)
   - `discogsId` is unique to prevent duplicate records
   - Indexed on: artist, title, discogsId, upc, dateAdded
   - Arrays for genres/styles (PostgreSQL array type)

2. **DiscogsCache**: Optional response caching (not yet implemented)
   - Designed for future optimization to reduce API calls

**Schema Connection**: The app uses Vercel Postgres which requires two connection strings:
- `POSTGRES_PRISMA_URL`: For Prisma Client queries (connection pooling)
- `POSTGRES_URL_NON_POOLING`: For migrations and Prisma Studio (direct connection)

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

### Component Organization Pattern

Components are organized by feature domain, not by type:

- `src/components/ui/` - Base UI primitives (Button, Card, Input, Modal, Toast, etc.)
- `src/components/layout/` - App shell (Header with navigation)
- `src/components/records/` - Record display components (Card, Grid, Filters, Stats)
- `src/components/scanner/` - Barcode scanning (uses html5-qrcode library)
- `src/components/add/` - Add record flow components (not yet fully extracted)

**Pattern**: Domain components compose UI primitives. Example: `RecordCard` uses `Badge` and `motion.div` from framer-motion.

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

## Environment Variables

Required for development:

```bash
# Database (get from Vercel Postgres or local setup)
POSTGRES_URL=               # Direct connection
POSTGRES_PRISMA_URL=        # Pooled connection (for queries)
POSTGRES_URL_NON_POOLING=   # Direct connection (for migrations)

# Discogs API (get from discogs.com/settings/developers)
DISCOGS_USER_TOKEN=         # Personal access token (server-side only)
NEXT_PUBLIC_DISCOGS_CONSUMER_KEY=    # Consumer key (unused but required)
NEXT_PUBLIC_DISCOGS_CONSUMER_SECRET= # Consumer secret (unused but required)

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or production URL
```

**Critical**: `DISCOGS_USER_TOKEN` must never be exposed to client. Used only in API routes via `getDiscogsClient()`.

## Adding New Record Sources

If adding support for additional music databases beyond Discogs:

1. Create new API client in `src/lib/` (follow `discogs.ts` pattern)
2. Add transformation function in `src/lib/utils.ts` (follow `discogsReleaseToRecord`)
3. Create new API proxy routes in `src/app/api/`
4. Update `useDiscogs` hook or create new hook for new source
5. Update search UI to support multiple sources (tabs or dropdown)

## Common Gotchas

1. **Prisma Client Generation**: Must run after schema changes or npm install. Build script includes `prisma generate`.

2. **Next.js Image Domains**: Album art comes from Discogs CDN. Configured in `next.config.ts`:
   ```ts
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'i.discogs.com' },
       { protocol: 'https', hostname: 'img.discogs.com' },
     ]
   }
   ```

3. **Client vs Server Components**:
   - API routes and `getDiscogsClient()` are server-only
   - Barcode scanner must be client component ('use client')
   - Page components with hooks must be client components

4. **Discogs API Responses**: Deeply nested. Always check response structure before accessing. Example: `release.artists?.[0]?.name` (optional chaining critical).

5. **Rate Limit Recovery**: If you hit Discogs rate limits, wait 60 seconds. The rate limiter will automatically queue requests.

## Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Create Vercel Postgres database (auto-adds DB env vars)
4. Deploy - build automatically runs `prisma generate` and `next build`
5. Database schema is applied during first build

**Post-Deploy**: Test barcode scanning works (requires HTTPS which Vercel provides).
