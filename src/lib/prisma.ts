import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL

if (!datasourceUrl) {
  throw new Error('Database connection string is missing. Please set DATABASE_URL or PRISMA_DATABASE_URL.')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
