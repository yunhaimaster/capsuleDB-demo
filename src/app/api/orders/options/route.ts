import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // 獲取所有訂單數據
    const allOrders = await prisma.productionOrder.findMany({
      include: {
        ingredients: true
      }
    })

    // 提取所有客戶名稱（去重）
    const allCustomers = Array.from(new Set(allOrders.map(order => order.customerName))).sort()

    // 根據客戶名稱篩選產品
    let filteredOrders = allOrders
    const customerName = searchParams.get('customerName')
    if (customerName) {
      filteredOrders = filteredOrders.filter(order => order.customerName === customerName)
    }

    // 根據產品名稱進一步篩選
    const productName = searchParams.get('productName')
    if (productName) {
      filteredOrders = filteredOrders.filter(order => order.productName === productName)
    }

    // 根據原料名稱進一步篩選
    const ingredientName = searchParams.get('ingredientName')
    if (ingredientName) {
      filteredOrders = filteredOrders.filter(order => 
        order.ingredients.some(ingredient => ingredient.materialName === ingredientName)
      )
    }

    // 提取產品名稱（基於篩選後的訂單）
    const products = Array.from(new Set(filteredOrders.map(order => order.productName))).sort()

    // 提取原料名稱（基於篩選後的訂單）
    const ingredients = Array.from(new Set(filteredOrders.flatMap(order => 
      order.ingredients.map(ingredient => ingredient.materialName)
    ))).sort()

    // 提取膠囊類型（基於篩選後的訂單）
    const capsuleTypes = Array.from(new Set(filteredOrders
      .map(order => order.capsuleType)
      .filter(Boolean)
    )).sort()

    return NextResponse.json({
      customers: allCustomers,
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
