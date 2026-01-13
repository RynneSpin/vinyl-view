import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Create PostgreSQL connection pool and adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function verifyRecords() {
  try {
    console.log('🔍 Checking collection records...\n')

    // Get total count
    const totalRecords = await prisma.record.count()
    console.log(`📊 Total Records: ${totalRecords}`)

    if (totalRecords === 0) {
      console.log('⚠️  No records found in the database.')
      return
    }

    // Get all records with details
    const records = await prisma.record.findMany({
      orderBy: { dateAdded: 'desc' },
      take: 10 // Show first 10
    })

    console.log(`\n✅ Found ${totalRecords} record(s) in the collection:\n`)

    records.forEach((record, index) => {
      console.log(`${index + 1}. "${record.title}" by ${record.artist}`)
      console.log(`   ID: ${record.id}`)
      console.log(`   Label: ${record.label || 'N/A'}`)
      console.log(`   Year: ${record.year || 'N/A'}`)
      console.log(`   Format: ${record.format || 'N/A'}`)
      console.log(`   Discogs ID: ${record.discogsId || 'N/A'}`)
      console.log(`   Genres: ${record.genres.join(', ') || 'N/A'}`)
      console.log(`   Added: ${record.dateAdded.toISOString()}`)
      console.log(`   Cover Art: ${record.coverArtUrl ? '✓' : '✗'}`)
      console.log()
    })

    if (totalRecords > 10) {
      console.log(`... and ${totalRecords - 10} more records`)
    }

    // Get some stats
    const genresCount = await prisma.record.findMany({
      select: { genres: true }
    })
    const allGenres = new Set(genresCount.flatMap(r => r.genres))
    console.log(`\n📈 Collection Stats:`)
    console.log(`   Unique Genres: ${allGenres.size}`)
    console.log(`   Records with Cover Art: ${records.filter(r => r.coverArtUrl).length}/${records.length} (of first 10)`)
    console.log(`   Records with Discogs ID: ${records.filter(r => r.discogsId).length}/${records.length} (of first 10)`)

  } catch (error) {
    console.error('❌ Error verifying records:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyRecords()
