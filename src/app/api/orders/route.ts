import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionOrderSchema, searchFiltersSchema } from '@/lib/validations'
import { SearchFilters } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    const filters: SearchFilters = {
      customerName: searchParams.get('customerName') || undefined,
      productName: searchParams.get('productName') || undefined,
      ingredientName: searchParams.get('ingredientName') || undefined,
      capsuleType: searchParams.get('capsuleType') || undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      minQuantity: searchParams.get('minQuantity') ? parseInt(searchParams.get('minQuantity')!) : undefined,
      maxQuantity: searchParams.get('maxQuantity') ? parseInt(searchParams.get('maxQuantity')!) : undefined,
      isCompleted: searchParams.get('isCompleted') ? searchParams.get('isCompleted') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    }

    const validatedFilters = searchFiltersSchema.parse(filters)
    
    const where: any = {}
    
    // 構建搜尋條件
    const searchConditions: any[] = []
    
    if (validatedFilters.customerName) {
      searchConditions.push({
        customerName: {
          contains: validatedFilters.customerName,
          mode: 'insensitive'
        }
      })
    }
    
    if (validatedFilters.productName) {
      searchConditions.push({
        productName: {
          contains: validatedFilters.productName,
          mode: 'insensitive'
        }
      })
    }
    
    if (validatedFilters.ingredientName) {
      searchConditions.push({
        ingredients: {
          some: {
            materialName: {
              contains: validatedFilters.ingredientName,
              mode: 'insensitive'
            }
          }
        }
      })
    }
    
    if (validatedFilters.capsuleType) {
      searchConditions.push({
        capsuleType: {
          contains: validatedFilters.capsuleType,
          mode: 'insensitive'
        }
      })
    }
    
    // 如果有搜尋條件，使用 AND 邏輯
    if (searchConditions.length > 0) {
      where.AND = searchConditions
    }
    
    if (validatedFilters.dateTo) {
      where.completionDate = {
        gte: new Date(validatedFilters.dateTo.getFullYear(), validatedFilters.dateTo.getMonth(), validatedFilters.dateTo.getDate()),
        lt: new Date(validatedFilters.dateTo.getFullYear(), validatedFilters.dateTo.getMonth(), validatedFilters.dateTo.getDate() + 1)
      }
    }
    
    if (validatedFilters.minQuantity !== undefined || validatedFilters.maxQuantity !== undefined) {
      where.productionQuantity = {}
      if (validatedFilters.minQuantity !== undefined) {
        where.productionQuantity.gte = validatedFilters.minQuantity
      }
      if (validatedFilters.maxQuantity !== undefined) {
        where.productionQuantity.lte = validatedFilters.maxQuantity
      }
    }
    
    if (validatedFilters.isCompleted !== undefined) {
      if (validatedFilters.isCompleted) {
        where.completionDate = { not: null }
      } else {
        where.completionDate = null
      }
    }

    const skip = (validatedFilters.page - 1) * validatedFilters.limit
    
    // 自定義排序邏輯：未完工的在前，已完工的按日期排序
    const [allOrders, total] = await Promise.all([
      prisma.productionOrder.findMany({
        where,
        include: {
          ingredients: true
        }
      }),
      prisma.productionOrder.count({ where })
    ])

    // 應用自定義排序
    const sortedOrders = allOrders.sort((a, b) => {
      // 未完工的訂單排在前面
      const aCompleted = a.completionDate !== null
      const bCompleted = b.completionDate !== null
      
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1 // 未完工的在前
      }
      
      // 如果都是未完工或都是已完工，按指定字段排序
      if (validatedFilters.sortBy === 'createdAt') {
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        return validatedFilters.sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
      } else if (validatedFilters.sortBy === 'completionDate') {
        const aDate = a.completionDate ? new Date(a.completionDate) : new Date(0)
        const bDate = b.completionDate ? new Date(b.completionDate) : new Date(0)
        return validatedFilters.sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
      } else {
        // 其他字段的排序
        const aValue = (a as any)[validatedFilters.sortBy]
        const bValue = (b as any)[validatedFilters.sortBy]
        if (aValue < bValue) return validatedFilters.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return validatedFilters.sortOrder === 'asc' ? 1 : -1
        return 0
      }
    })

    // 應用分頁
    const orders = sortedOrders.slice(skip, skip + validatedFilters.limit)

    // 確保日期正確序列化
    const serializedOrders = orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completionDate: order.completionDate ? 
        (order.completionDate instanceof Date ? 
          order.completionDate.toISOString().split('T')[0] : 
          order.completionDate) : null
    }))

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total,
        totalPages: Math.ceil(total / validatedFilters.limit)
      }
    })
  } catch (error) {
    console.error('載入訂單錯誤:', error)
    return NextResponse.json(
      { error: '載入訂單失敗' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/orders - Starting request')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = productionOrderSchema.parse(body)
    console.log('Validated data:', validatedData)
    console.log('Completion date type:', typeof validatedData.completionDate)
    console.log('Completion date value:', validatedData.completionDate)
    
    // Calculate weights
    const unitWeightMg = validatedData.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.unitContentMg,
      0
    )
    const batchTotalWeightMg = unitWeightMg * validatedData.productionQuantity
    
    console.log('Calculated weights:', { unitWeightMg, batchTotalWeightMg })
    
    const order = await prisma.productionOrder.create({
      data: {
        customerName: validatedData.customerName,
        productName: validatedData.productName,
        productionQuantity: validatedData.productionQuantity,
        unitWeightMg,
        batchTotalWeightMg,
        completionDate: validatedData.completionDate ? new Date(validatedData.completionDate) : null,
        processIssues: validatedData.processIssues,
        qualityNotes: validatedData.qualityNotes,
        capsuleColor: validatedData.capsuleColor,
        capsuleSize: validatedData.capsuleSize,
        capsuleType: validatedData.capsuleType,
        createdBy: validatedData.createdBy || '系統',
        ingredients: {
          create: validatedData.ingredients.map(ingredient => ({
            materialName: ingredient.materialName,
            unitContentMg: ingredient.unitContentMg,
            isCustomerProvided: ingredient.isCustomerProvided ?? true
          }))
        }
      },
      include: {
        ingredients: true
      }
    })

    console.log('Order created successfully:', order)

    // 確保日期正確序列化
    const serializedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completionDate: order.completionDate ? 
        (order.completionDate instanceof Date ? 
          order.completionDate.toISOString().split('T')[0] : 
          order.completionDate) : null
    }

    return NextResponse.json(serializedOrder, { status: 201 })
  } catch (error) {
    console.error('創建訂單錯誤:', error)
    console.error('錯誤詳情:', {
      name: error instanceof Error ? error.name : '未知',
      message: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : '無堆疊追蹤'
    })
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '驗證失敗', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: '創建訂單失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}
