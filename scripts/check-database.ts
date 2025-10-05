import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '@prisma/client'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 1_000

loadEnvConfig(process.cwd())

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is missing. Please set it before running the build.')
  }
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid Postgres connection string (postgres://).')
  }
  return url
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function checkDatabaseConnection() {
  getDatabaseUrl()

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
    console.error('[db-check] Database connection failed:', error.message)
    process.exit(1)
  })

