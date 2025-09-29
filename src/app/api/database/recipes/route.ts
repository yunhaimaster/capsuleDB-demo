import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 構建查詢條件
    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { notes: { contains: search } }
      ]
    }

    // 獲取產品列表
    const products = await prisma.productDatabase.findMany({
      where,
      orderBy: {
        updatedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // 獲取總數
    const total = await prisma.productDatabase.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('獲取產品列表錯誤:', error)
    return NextResponse.json(
      { error: '獲取產品列表失敗' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, category, formula, efficacy, safety, tags, notes } = body

    // 驗證輸入
    if (!productName) {
      return NextResponse.json(
        { error: '產品名稱不能為空' },
        { status: 400 }
      )
    }

    // 創建產品
    const product = await prisma.productDatabase.create({
      data: {
        productName,
        category,
        formula: JSON.stringify(formula || {}),
        efficacy: efficacy ? JSON.stringify(efficacy) : null,
        safety: safety ? JSON.stringify(safety) : null,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        createdBy: 'system', // 可以從認證信息中獲取
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('創建產品錯誤:', error)
    return NextResponse.json(
      { error: '創建產品失敗' },
      { status: 500 }
    )
  }
}
