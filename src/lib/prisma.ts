import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Please configure the connection string in your environment variables.')
}

const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    return false
  }
}
