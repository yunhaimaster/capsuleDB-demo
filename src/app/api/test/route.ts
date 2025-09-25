import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // 測試數據庫連接
    const count = await prisma.productionOrder.count()
    console.log('Database connection successful, order count:', count)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      orderCount: count
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
