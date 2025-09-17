import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionOrderSchema, searchFiltersSchema } from '@/lib/validations'
import { SearchFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: SearchFilters = {
      customerName: searchParams.get('customerName') || undefined,
      productCode: searchParams.get('productCode') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      isCompleted: searchParams.get('isCompleted') ? searchParams.get('isCompleted') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    }

    const validatedFilters = searchFiltersSchema.parse(filters)
    
    const where: any = {}
    
    if (validatedFilters.customerName) {
      where.customerName = {
        contains: validatedFilters.customerName,
        mode: 'insensitive'
      }
    }
    
    if (validatedFilters.productCode) {
      where.productCode = {
        contains: validatedFilters.productCode,
        mode: 'insensitive'
      }
    }
    
    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.createdAt = {}
      if (validatedFilters.dateFrom) {
        where.createdAt.gte = validatedFilters.dateFrom
      }
      if (validatedFilters.dateTo) {
        where.createdAt.lte = validatedFilters.dateTo
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
    
    const [orders, total] = await Promise.all([
      prisma.productionOrder.findMany({
        where,
        include: {
          ingredients: true
        },
        orderBy: {
          [validatedFilters.sortBy]: validatedFilters.sortOrder
        },
        skip,
        take: validatedFilters.limit
      }),
      prisma.productionOrder.count({ where })
    ])

    // 確保日期正確序列化
    const serializedOrders = orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completionDate: order.completionDate?.toISOString() || null
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
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productionOrderSchema.parse(body)
    
    // Calculate weights
    const unitWeightMg = validatedData.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.unitContentMg,
      0
    )
    const batchTotalWeightMg = unitWeightMg * validatedData.productionQuantity
    
    const order = await prisma.productionOrder.create({
      data: {
        customerName: validatedData.customerName,
        productCode: validatedData.productCode,
        productionQuantity: validatedData.productionQuantity,
        unitWeightMg,
        batchTotalWeightMg,
        completionDate: validatedData.completionDate,
        processIssues: validatedData.processIssues,
        qualityNotes: validatedData.qualityNotes,
        createdBy: validatedData.createdBy || '系統',
        ingredients: {
          create: validatedData.ingredients.map(ingredient => ({
            materialName: ingredient.materialName,
            unitContentMg: ingredient.unitContentMg
          }))
        }
      },
      include: {
        ingredients: true
      }
    })

    // 確保日期正確序列化
    const serializedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completionDate: order.completionDate?.toISOString() || null
    }

    return NextResponse.json(serializedOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
