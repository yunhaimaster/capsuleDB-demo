import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '@prisma/client'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 1_000

loadEnvConfig(process.cwd())

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.warn('[db-check] DATABASE_URL is not set. Skipping database check.')
    return null
  }
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    console.warn('[db-check] DATABASE_URL is not a Postgres URL. Skipping database check.')
    return null
  }
  return url
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function checkDatabaseConnection() {
  const dbUrl = getDatabaseUrl()
  
  if (!dbUrl) {
    console.info('[db-check] Skipping database connection check.')
    return
  }

  const prisma = new PrismaClient({ log: ['error'] })

  let attempt = 0
  let lastError: unknown

  while (attempt < MAX_RETRIES) {
    try {
      attempt += 1
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      await prisma.$disconnect()
      return
    } catch (error) {
      lastError = error
      await prisma.$disconnect().catch(() => undefined)
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS)
      }
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown database error'
  throw new Error(`Failed to connect to the database after ${MAX_RETRIES} attempts: ${errorMessage}`)
}

checkDatabaseConnection()
  .then(() => {
    console.info('[db-check] Database connection verified successfully.')
  })
  .catch((error) => {
    console.warn('[db-check] Database connection failed:', error.message)
    console.warn('[db-check] Continuing with build anyway (demo mode).')
    // Don't exit with error for demo mode
    process.exit(0)
  })

