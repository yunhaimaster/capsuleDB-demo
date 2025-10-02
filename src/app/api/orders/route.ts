import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionOrderSchema, searchFiltersSchema, worklogSchema } from '@/lib/validations'
import { SearchFilters } from '@/types'
import { calculateWorkUnits } from '@/lib/worklog'
import { DateTime } from 'luxon'

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
    
    // 自定義排序邏輯：進行中 > 未開始 > 已完成（依完工日期）
    const [allOrders, total] = await Promise.all([
      prisma.productionOrder.findMany({
        where,
        include: {
          ingredients: true,
          worklogs: {
            orderBy: { workDate: 'asc' }
          }
        }
      }),
      prisma.productionOrder.count({ where })
    ])

    // 應用自定義排序
    const sortedOrders = allOrders.sort((a, b) => {
      const getStatusRank = (order: typeof a) => {
        const hasWorklogs = order.worklogs && order.worklogs.length > 0
        const completed = order.completionDate !== null
        if (hasWorklogs && !completed) return 0 // 進行中
        if (!completed) return 1 // 未開始
        return 2 // 已完成
      }

      const rankA = getStatusRank(a)
      const rankB = getStatusRank(b)

      if (rankA !== rankB) {
        return rankA - rankB
      }

      // 同一狀態下進行排序：已完成依完成日期，其餘依建立時間
      if (rankA === 2) {
        const aDate = a.completionDate ? new Date(a.completionDate) : new Date(0)
        const bDate = b.completionDate ? new Date(b.completionDate) : new Date(0)
        return validatedFilters.sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
      }

      const aCreated = new Date(a.createdAt)
      const bCreated = new Date(b.createdAt)
      return validatedFilters.sortOrder === 'asc' ? aCreated.getTime() - bCreated.getTime() : bCreated.getTime() - aCreated.getTime()
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
          order.completionDate) : null,
      totalWorkUnits: order.worklogs?.reduce((sum, log) => sum + (log.calculatedWorkUnits || 0), 0) ?? 0
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
    
    const { worklogs = [], ...orderPayload } = validatedData as typeof validatedData & { worklogs?: any[] }

    const preparedWorklogs = worklogs.map((entry) => {
      const parsed = worklogSchema.parse(entry)
      const { minutes, units } = calculateWorkUnits({
        date: parsed.workDate,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        headcount: parsed.headcount
      })

      const workDate = DateTime.fromISO(parsed.workDate, { zone: 'Asia/Hong_Kong' })

      return {
        workDate: workDate.toJSDate(),
        headcount: parsed.headcount,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        notes: parsed.notes || null,
        effectiveMinutes: minutes,
        calculatedWorkUnits: units
      }
    })

    const order = await prisma.productionOrder.create({
      data: {
        customerName: orderPayload.customerName,
        productName: orderPayload.productName,
        productionQuantity: orderPayload.productionQuantity,
        unitWeightMg,
        batchTotalWeightMg,
        completionDate: orderPayload.completionDate && orderPayload.completionDate !== '' ? new Date(orderPayload.completionDate) : null,
        processIssues: orderPayload.processIssues,
        qualityNotes: orderPayload.qualityNotes,
        capsuleColor: orderPayload.capsuleColor,
        capsuleSize: orderPayload.capsuleSize,
        capsuleType: orderPayload.capsuleType,
        customerService: orderPayload.customerService,
        actualProductionQuantity: orderPayload.actualProductionQuantity ?? null,
        materialYieldQuantity: orderPayload.materialYieldQuantity ?? null,
        ingredients: {
          create: validatedData.ingredients.map(ingredient => ({
            materialName: ingredient.materialName,
            unitContentMg: ingredient.unitContentMg,
            isCustomerProvided: ingredient.isCustomerProvided ?? true,
            isCustomerSupplied: ingredient.isCustomerSupplied ?? true
          }))
        },
        worklogs: {
          create: preparedWorklogs
        }
      },
      include: {
        ingredients: true,
        worklogs: {
          orderBy: { workDate: 'asc' }
        }
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
