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

async function checkUsers() {
  try {
    console.log('🔍 Checking User table...\n')

    // Get total user count
    const totalUsers = await prisma.user.count()
    console.log(`📊 Total Users: ${totalUsers}`)

    if (totalUsers === 0) {
      console.log('⚠️  No users found in the database.')
      console.log('\nThis is likely why you\'re getting 500 errors when trying to save records.')
      console.log('The app requires users to be created through the authentication system.')
    } else {
      // Get all users
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: { records: true }
          }
        }
      })

      console.log(`\n✅ Found ${totalUsers} user(s):\n`)

      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Records: ${user._count.records}`)
        console.log(`   Created: ${user.createdAt.toISOString()}`)
        console.log()
      })
    }

    // Check orphaned records (records without valid userId)
    const records = await prisma.record.findMany({
      select: { userId: true }
    })

    const uniqueUserIds = new Set(records.map(r => r.userId))
    const users = await prisma.user.findMany({
      select: { id: true }
    })
    const validUserIds = new Set(users.map(u => u.id))

    const orphanedUserIds = Array.from(uniqueUserIds).filter(id => !validUserIds.has(id))

    if (orphanedUserIds.length > 0) {
      console.log(`\n⚠️  Found ${orphanedUserIds.length} orphaned userId(s) in Record table:`)
      orphanedUserIds.forEach(id => console.log(`   - ${id}`))
      console.log('\nThese records reference users that don\'t exist in the User table.')
    }

  } catch (error) {
    console.error('❌ Error checking users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
