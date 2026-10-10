import dotenv from 'dotenv'
import app from './app'
import { testDatabaseConnection } from './config/db'

dotenv.config()

const PORT = Number(process.env.PORT) || 5000

const startServer = async () => {
  try {
    console.log('Starting LogiMind backend...')

    await testDatabaseConnection()

    app.listen(PORT, () => {
      console.log(`LogiMind API running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}

startServer()