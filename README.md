# Vinyl View

A modern web application for cataloging and managing your vinyl record collection. Search by artist/album name or scan UPC barcodes with your phone camera to quickly add records to your collection.

## Features

- **Vinyl Collection Management**: View, add, edit, and delete vinyl records from your collection
- **Discogs Integration**: Search for albums by artist/album name with data from the Discogs API
- **Barcode Scanning**: Use your phone camera to scan UPC codes and quickly find records
- **Rich Metadata**: Store detailed information including genres, label, year, format, and personal notes
- **Dark Theme UI**: Modern, trendy dark interface with smooth animations
- **Sorting & Filtering**: Organize your collection by date added, artist, title, year, or genre
- **Collection Statistics**: View total records, unique artists, and genre counts

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: Vercel Postgres with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Barcode Scanning**: html5-qrcode
- **External API**: Discogs API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Discogs account and API token (free)
- Vercel account (for deployment and database)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Discogs API

1. Go to [https://www.discogs.com/settings/developers](https://www.discogs.com/settings/developers)
2. Create a new application or use an existing one
3. Generate a personal access token

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Discogs API
DISCOGS_USER_TOKEN="your_discogs_personal_access_token"
NEXT_PUBLIC_DISCOGS_CONSUMER_KEY="your_consumer_key"
NEXT_PUBLIC_DISCOGS_CONSUMER_SECRET="your_consumer_secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (will be added after creating Vercel Postgres)
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
```

### 4. Set Up Database (Development)

For local development, you have two options:

#### Option A: Use Vercel Postgres (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Create a Postgres database in your Vercel dashboard
4. Pull environment variables: `vercel env pull .env.local`
5. Push the schema: `npm run db:push`

#### Option B: Use Local Postgres

1. Install and run PostgreSQL locally
2. Update `.env.local` with your local database URL:
   ```
   POSTGRES_URL="postgresql://user:password@localhost:5432/vinyl_view"
   POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/vinyl_view"
   POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/vinyl_view"
   ```
3. Push the schema: `npm run db:push`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Create Vercel Project

- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repository

### 3. Set Up Database

- In your Vercel project dashboard, go to "Storage"
- Click "Create Database" → "Postgres"
- Name it `vinyl-view-db`
- Vercel will automatically add database environment variables

### 4. Add Environment Variables

Go to Project Settings → Environment Variables and add:
- `DISCOGS_USER_TOKEN`
- `NEXT_PUBLIC_DISCOGS_CONSUMER_KEY`
- `NEXT_PUBLIC_DISCOGS_CONSUMER_SECRET`
- `NEXT_PUBLIC_APP_URL` (your production URL)

### 5. Deploy

Vercel will automatically deploy on every push to main. Your database schema will be applied during build.

## Usage

### Adding Records

**Method 1: Search**
1. Click "Add Record" in the header
2. Enter artist/album name in the search box
3. Select the correct release from results
4. Add optional notes
5. Click "Add to Collection"

**Method 2: Barcode Scan**
1. Click "Add Record" in the header
2. Switch to "Scan Barcode" tab
3. Click "Start Scanner" and allow camera access
4. Point camera at the barcode on your vinyl
5. Select the correct release from results
6. Click "Add to Collection"

### Managing Records

- **View Details**: Click any record card to see full details
- **Edit Notes**: Click "Edit" in the notes section on the detail page
- **Delete Record**: Click "Delete from Collection" on the detail page
- **Filter**: Use the dropdowns on the home page to filter by genre or sort by different fields

## Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS (localhost works, or deploy to Vercel)
- Check browser permissions for camera access
- Try a different browser (Chrome/Safari recommended)

### Discogs API Rate Limits
- Free tier: 60 requests per minute
- The app includes built-in rate limiting
- If you hit limits, wait a minute and try again

### Database Connection Issues
- Verify environment variables are set correctly
- For Vercel Postgres, ensure you're using both `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
- Check Vercel logs for detailed error messages

## Project Structure

```
vinyl-view/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── api/                # API endpoints
│   │   ├── records/[id]/       # Record detail page
│   │   ├── add/                # Add record page
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   ├── records/            # Record-specific components
│   │   ├── scanner/            # Barcode scanner
│   │   └── add/                # Add record components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and API clients
│   └── types/                  # TypeScript type definitions
└── public/                     # Static assets
```

## License

MIT

## Acknowledgments

- Album data provided by [Discogs](https://www.discogs.com/)
- Barcode scanning powered by [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- Built with [Next.js](https://nextjs.org/) and deployed on [Vercel](https://vercel.com/)
