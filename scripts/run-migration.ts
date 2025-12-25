/**
 * Run SQL migrations against Supabase using direct Postgres connection
 * Run with: npx tsx scripts/run-migration.ts
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import pg from 'pg'

const DATABASE_URL = 'postgresql://postgres:nxd1YJU.dfg7rcj6dne@db.aogfhlompvfztymxrxfm.supabase.co:5432/postgres'
const MIGRATION_FILE = resolve(__dirname, '../supabase/migrations/20241224_broadband_plans.sql')

async function runMigration() {
  console.log('🚀 Running Supabase Migration\n')
  console.log('=' .repeat(50))

  // Read migration file
  if (!existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE)
    process.exit(1)
  }

  const sql = readFileSync(MIGRATION_FILE, 'utf-8')
  console.log('📄 Migration file loaded:', MIGRATION_FILE.split('/').pop())
  console.log(`   ${sql.split('\n').length} lines of SQL\n`)

  // Connect to database
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    console.log('🔄 Executing migration...')
    await client.query(sql)
    console.log('✅ Migration executed successfully!')

    // Verify table exists
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'broadband_plans'
      ORDER BY ordinal_position
      LIMIT 10
    `)

    console.log('\n📋 Table structure (first 10 columns):')
    for (const row of result.rows) {
      console.log(`   - ${row.column_name}: ${row.data_type}`)
    }

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message)

    if (err.message.includes('already exists')) {
      console.log('\n⚠️ Some objects already exist (this is usually OK)')
    }
  } finally {
    await client.end()
    console.log('\n🔌 Disconnected from database')
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Migration complete!')
}

runMigration().catch(console.error)
