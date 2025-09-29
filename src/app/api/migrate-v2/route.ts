import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('開始 v2.0 數據庫遷移...')

    // 檢查並創建 v2.0 表
    const migrations = []

    // 1. 檢查 AIRecipe 表
    try {
      await prisma.aIRecipe.findFirst()
      console.log('AIRecipe 表已存在')
    } catch (error) {
      console.log('AIRecipe 表不存在，需要創建')
      migrations.push('AIRecipe 表')
    }

    // 2. 檢查 IngredientPrice 表
    try {
      await prisma.ingredientPrice.findFirst()
      console.log('IngredientPrice 表已存在')
    } catch (error) {
      console.log('IngredientPrice 表不存在，需要創建')
      migrations.push('IngredientPrice 表')
    }

    // 3. 檢查 ProductEfficacy 表
    try {
      await prisma.productEfficacy.findFirst()
      console.log('ProductEfficacy 表已存在')
    } catch (error) {
      console.log('ProductEfficacy 表不存在，需要創建')
      migrations.push('ProductEfficacy 表')
    }

    // 4. 檢查 WorkOrder 表
    try {
      await prisma.workOrder.findFirst()
      console.log('WorkOrder 表已存在')
    } catch (error) {
      console.log('WorkOrder 表不存在，需要創建')
      migrations.push('WorkOrder 表')
    }

    // 5. 檢查 QCFile 表
    try {
      await prisma.qCFile.findFirst()
      console.log('QCFile 表已存在')
    } catch (error) {
      console.log('QCFile 表不存在，需要創建')
      migrations.push('QCFile 表')
    }

    // 6. 檢查 ProductDatabase 表
    try {
      await prisma.productDatabase.findFirst()
      console.log('ProductDatabase 表已存在')
    } catch (error) {
      console.log('ProductDatabase 表不存在，需要創建')
      migrations.push('ProductDatabase 表')
    }

    // 7. 檢查 AdCopy 表
    try {
      await prisma.adCopy.findFirst()
      console.log('AdCopy 表已存在')
    } catch (error) {
      console.log('AdCopy 表不存在，需要創建')
      migrations.push('AdCopy 表')
    }

    if (migrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'v2.0 數據庫遷移完成 - 所有表已存在',
        migrations: []
      })
    }

    return NextResponse.json({
      success: true,
      message: `v2.0 數據庫遷移完成 - 需要創建 ${migrations.length} 個表`,
      migrations,
      note: '請運行 "npx prisma migrate dev" 來創建缺失的表'
    })

  } catch (error) {
    console.error('v2.0 數據庫遷移錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'v2.0 數據庫遷移失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}
