import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // 讀取遷移 SQL 文件
    const migratePath = path.join(process.cwd(), 'prisma', 'migrate-add-isCustomerProvided.sql')
    const migrateSQL = fs.readFileSync(migratePath, 'utf8')
    
    // 執行遷移
    await prisma.$executeRawUnsafe(migrateSQL)
    
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
