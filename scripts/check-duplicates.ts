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

async function checkDuplicates() {
  try {
    console.log('🔍 Checking for duplicate discogsId+userId combinations...\n')

    // Get all records
    const records = await prisma.record.findMany({
      select: {
        id: true,
        discogsId: true,
        userId: true,
        title: true,
        artist: true,
      },
      orderBy: [
        { userId: 'asc' },
        { discogsId: 'asc' },
      ],
    })

    // Group by userId and discogsId
    const groups = new Map<string, typeof records>()

    records.forEach(record => {
      if (record.discogsId) {
        const key = `${record.userId}:${record.discogsId}`
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(record)
      }
    })

    // Find duplicates
    const duplicates = Array.from(groups.entries()).filter(([_, records]) => records.length > 1)

    if (duplicates.length === 0) {
      console.log('✅ No duplicate discogsId+userId combinations found.')
      console.log('The migration can proceed safely.')
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate combinations:\n`)

      duplicates.forEach(([key, records]) => {
        const [userId, discogsId] = key.split(':')
        console.log(`User ${userId} has ${records.length} copies of Discogs ID ${discogsId}:`)
        records.forEach(r => {
          console.log(`  - ${r.title} by ${r.artist} (ID: ${r.id})`)
        })
        console.log()
      })
    }

  } catch (error) {
    console.error('❌ Error checking duplicates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicates()
