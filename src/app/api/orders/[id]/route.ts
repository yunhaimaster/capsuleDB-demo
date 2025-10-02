import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionOrderSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: params.id },
      include: {
        ingredients: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

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

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error('載入訂單錯誤:', error)
    return NextResponse.json(
      { error: '載入訂單失敗' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = productionOrderSchema.parse(body)
    
    // Calculate weights
    const unitWeightMg = validatedData.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.unitContentMg,
      0
    )
    const batchTotalWeightMg = unitWeightMg * validatedData.productionQuantity

    const order = await prisma.productionOrder.update({
      where: { id: params.id },
      data: {
        customerName: validatedData.customerName,
        productName: validatedData.productName,
        productionQuantity: validatedData.productionQuantity,
        unitWeightMg,
        batchTotalWeightMg,
        completionDate: validatedData.completionDate && validatedData.completionDate !== '' ? new Date(validatedData.completionDate) : null,
        processIssues: validatedData.processIssues,
        qualityNotes: validatedData.qualityNotes,
        capsuleColor: validatedData.capsuleColor,
        capsuleSize: validatedData.capsuleSize,
        capsuleType: validatedData.capsuleType,
        customerService: validatedData.customerService,
        // 更新原料：先刪除舊的再新增，包含客戶來源標記
        ingredients: {
          deleteMany: {},
          create: validatedData.ingredients.map(ingredient => ({
            materialName: ingredient.materialName,
            unitContentMg: ingredient.unitContentMg,
            isCustomerProvided: ingredient.isCustomerProvided ?? true,
            isCustomerSupplied: ingredient.isCustomerSupplied ?? true
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
      completionDate: order.completionDate ? 
        (order.completionDate instanceof Date ? 
          order.completionDate.toISOString().split('T')[0] : 
          order.completionDate) : null
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error('更新訂單錯誤:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '驗證失敗', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '更新訂單失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.productionOrder.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '訂單刪除成功' })
  } catch (error) {
    console.error('刪除訂單錯誤:', error)
    return NextResponse.json(
      { error: '刪除訂單失敗' },
      { status: 500 }
    )
  }
}
