import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n')

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `)

    console.log(`📊 Tables in database:\n`)
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.tablename}`)
    })

    // Check for Neon Auth tables
    const authTables = tablesResult.rows.filter(row =>
      row.tablename.includes('auth') ||
      row.tablename.includes('user') ||
      row.tablename.includes('session')
    )

    if (authTables.length > 0) {
      console.log(`\n🔐 Authentication-related tables:`)
      authTables.forEach(row => console.log(`   - ${row.tablename}`))
    }

    // Check User table structure
    const userColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `)

    if (userColumns.rows.length > 0) {
      console.log(`\n📋 User table structure:`)
      userColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`)
      })
    }

    // Get all users
    const usersResult = await pool.query(`SELECT id, email, name FROM "User"`)
    console.log(`\n👥 Users in User table:`)
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
    })

  } catch (error) {
    console.error('❌ Error checking tables:', error)
    throw error
  } finally {
    await pool.end()
  }
}

checkTables()
