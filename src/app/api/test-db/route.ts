import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 檢查 ingredients 表的結構
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ingredients' 
      ORDER BY ordinal_position
    `
    
    return NextResponse.json({ 
      success: true, 
      ingredientsTableStructure: result 
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
