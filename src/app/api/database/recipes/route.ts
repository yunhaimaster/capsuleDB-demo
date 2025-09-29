import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    // 構建查詢條件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = category
    }

    const [products, total] = await Promise.all([
      prisma.productDatabase.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      prisma.productDatabase.count({ where })
    ])

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        productName: product.productName,
        category: product.category,
        formula: product.formula,
        efficacy: product.efficacy,
        safety: product.safety,
        regulatoryStatus: product.regulatoryStatus,
        version: product.version,
        isActive: product.isActive,
        tags: product.tags ? JSON.parse(product.tags) : [],
        notes: product.notes,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('獲取產品列表錯誤:', error)
    return NextResponse.json(
      { success: false, error: '獲取產品列表失敗' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productName, category, formula, efficacy, safety, tags, notes } = await request.json()

    if (!productName) {
      return NextResponse.json(
        { success: false, error: '產品名稱不能為空' },
        { status: 400 }
      )
    }

    const product = await prisma.productDatabase.create({
      data: {
        productName,
        category,
        formula: JSON.stringify(formula || {}),
        efficacy: efficacy ? JSON.stringify(efficacy) : null,
        safety: safety ? JSON.stringify(safety) : null,
        regulatoryStatus: null,
        version: '1.0',
        isActive: true,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        createdBy: '系統'
      }
    })

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        productName: product.productName,
        category: product.category,
        formula: product.formula,
        efficacy: product.efficacy,
        safety: product.safety,
        regulatoryStatus: product.regulatoryStatus,
        version: product.version,
        isActive: product.isActive,
        tags: product.tags ? JSON.parse(product.tags) : [],
        notes: product.notes,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

  } catch (error) {
    console.error('創建產品錯誤:', error)
    return NextResponse.json(
      { success: false, error: '創建產品失敗' },
      { status: 500 }
    )
  }
}