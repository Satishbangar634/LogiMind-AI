import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')

    console.log('✅ PostgreSQL connected:', result.rows[0])
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    process.exit(1)
  }
}