import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionOrderSchema, worklogSchema } from '@/lib/validations'
import { calculateWorkUnits } from '@/lib/worklog'
import { DateTime } from 'luxon'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: params.id },
      include: {
        ingredients: true,
        worklogs: {
          orderBy: { workDate: 'asc' }
        }
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
          order.completionDate) : null,
      worklogs: order.worklogs.map((log) => ({
        ...log,
        workDate: DateTime.fromJSDate(log.workDate, { zone: 'Asia/Hong_Kong' }).startOf('day').toFormat('yyyy-MM-dd')
      }))
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

    const order = await prisma.productionOrder.update({
      where: { id: params.id },
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
        // 更新原料：先刪除舊的再新增，包含客戶來源標記
        ingredients: {
          deleteMany: {},
          create: validatedData.ingredients.map(ingredient => ({
            materialName: ingredient.materialName,
            unitContentMg: ingredient.unitContentMg,
            isCustomerProvided: ingredient.isCustomerProvided ?? true,
            isCustomerSupplied: ingredient.isCustomerSupplied ?? true
          }))
        },
        worklogs: {
          deleteMany: {},
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
