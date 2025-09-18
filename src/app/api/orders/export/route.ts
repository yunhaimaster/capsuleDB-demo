import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCSV } from '@/lib/utils'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, includeIngredients = false, dateRange } = body

    const where: any = {}
    if (dateRange) {
      where.createdAt = {
        gte: new Date(dateRange.from),
        lte: new Date(dateRange.to)
      }
    }

    const orders = await prisma.productionOrder.findMany({
      where,
      include: {
        ingredients: includeIngredients
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (format === 'csv') {
      const headers = [
        '建檔日期',
        '客戶名稱',
        '產品代號',
        '生產數量',
        '單粒總重量(mg)',
        '批次總重量(mg)',
        '完工日期',
        '建檔人員'
      ]

      if (includeIngredients) {
        headers.push('原料明細')
      }

      const csvData = orders.map(order => {
        const row = [
          order.createdAt.toISOString().split('T')[0],
          order.customerName,
          order.productCode,
          order.productionQuantity.toString(),
          order.unitWeightMg.toString(),
          order.batchTotalWeightMg.toString(),
          order.completionDate?.toISOString().split('T')[0] || '',
          order.createdBy || ''
        ]

        if (includeIngredients) {
          const ingredientsText = order.ingredients
            .map(ing => `${ing.materialName}: ${ing.unitContentMg}mg`)
            .join('; ')
          row.push(ingredientsText)
        }

        return row
      })

      // 添加 BOM 以支持中文
      const csvContent = '\uFEFF' + generateCSV(csvData, headers)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="production-orders-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'pdf') {
      const doc = new jsPDF()
      
      // 標題
      doc.setFontSize(16)
      doc.text('Capsule Production Records', 20, 20)
      
      // 表格標題
      const tableHeaders = ['Date', 'Customer', 'Product Code', 'Quantity', 'Unit Weight(mg)', 'Status']
      const tableData = orders.map(order => [
        order.createdAt.toISOString().split('T')[0],
        order.customerName,
        order.productCode,
        order.productionQuantity.toString(),
        order.unitWeightMg.toFixed(3),
        order.completionDate ? 'Completed' : 'Pending'
      ])

      // 簡單的表格實現
      let y = 40
      const rowHeight = 8
      const colWidths = [25, 30, 25, 20, 25, 20]

      // 表頭
      doc.setFontSize(10)
      let x = 20
      tableHeaders.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += rowHeight

      // 表格內容
      tableData.forEach(row => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        
        x = 20
        row.forEach((cell, i) => {
          doc.text(cell, x, y)
          x += colWidths[i]
        })
        y += rowHeight
      })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="production-orders-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Unsupported format' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting orders:', error)
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    )
  }
}
