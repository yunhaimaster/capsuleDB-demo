import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // 構建篩選條件
    const where: any = {}
    
    if (searchParams.get('customerName')) {
      where.customerName = searchParams.get('customerName')
    }
    
    if (searchParams.get('productName')) {
      where.productName = searchParams.get('productName')
    }
    
    if (searchParams.get('ingredientName')) {
      where.ingredients = {
        some: {
          materialName: searchParams.get('ingredientName')
        }
      }
    }

    // 獲取篩選後的訂單數據
    const orders = await prisma.productionOrder.findMany({
      where,
      include: {
        ingredients: true
      }
    })

    // 提取客戶名稱（去重）
    const customers = Array.from(new Set(orders.map(order => order.customerName))).sort()

    // 提取產品名稱（去重）
    const products = Array.from(new Set(orders.map(order => order.productName))).sort()

    // 提取原料名稱（去重）
    const ingredients = Array.from(new Set(orders.flatMap(order => 
      order.ingredients.map(ingredient => ingredient.materialName)
    ))).sort()

    // 提取膠囊類型（去重）
    const capsuleTypes = Array.from(new Set(orders
      .map(order => order.capsuleType)
      .filter(Boolean)
    )).sort()

    return NextResponse.json({
      customers,
      products,
      ingredients,
      capsuleTypes
    })

  } catch (error) {
    console.error('Error fetching dropdown options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dropdown options' },
      { status: 500 }
    )
  }
}
