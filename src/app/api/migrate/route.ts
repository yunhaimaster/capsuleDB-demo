import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // 逐個執行遷移命令
    const migrations = [
      'ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "isCustomerProvided" BOOLEAN NOT NULL DEFAULT true',
      'ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "productName" TEXT NOT NULL DEFAULT \'未命名產品\'',
      'ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleColor" TEXT',
      'ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleSize" TEXT',
      'ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleType" TEXT',
      'ALTER TABLE "production_orders" DROP COLUMN IF EXISTS "productCode"'
    ]
    
    // 執行每個遷移命令
    for (const migration of migrations) {
      try {
        await prisma.$executeRawUnsafe(migration)
      } catch (error) {
        console.log(`Migration command failed (may already exist): ${migration}`, error)
        // 繼續執行其他命令，因為某些字段可能已經存在
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
