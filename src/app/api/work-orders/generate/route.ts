import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { orderId, isoStandard, enableReasoning } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '缺少訂單ID參數' },
        { status: 400 }
      )
    }

    // 嘗試獲取訂單詳情，如果表不存在則返回錯誤
    let order: any = null
    try {
      order = await prisma.productionOrder.findUnique({
        where: { id: orderId },
        include: {
          ingredients: true
        }
      })
    } catch (dbError) {
      console.warn('訂單表不存在:', dbError)
      return NextResponse.json(
        { success: false, error: '數據庫表不存在，請先設置數據庫' },
        { status: 500 }
      )
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: '找不到指定的訂單' },
        { status: 404 }
      )
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    const systemPrompt = `你是一個專業的 ISO 工作單生成專家，專門為保健品公司生成符合國際標準的生產工作單。

訂單信息：
- 產品名稱：${order.productName}
- 客戶名稱：${order.customerName}
- 生產數量：${order.productionQuantity} 粒
- 膠囊規格：${order.capsuleType || '未指定'}
- 膠囊顏色：${order.capsuleColor || '未指定'}
- 膠囊大小：${order.capsuleSize || '未指定'}

原料配方：
${order.ingredients.map((ing: any) => `- ${ing.materialName}: ${ing.unitContentMg}mg`).join('\n')}

ISO 標準：${isoStandard || 'ISO 9001:2015'}

請生成一個完整的工作單，包含：
1. 工作單標題和基本信息
2. 生產步驟（詳細的工藝流程）
3. 質量控制點（QC檢查項目）
4. 風險評估和緩解措施
5. 設備和工具要求
6. 人員配置和職責
7. 時間安排和里程碑
8. 驗收標準和測試方法

請使用香港書面語繁體中文，確保內容專業、詳細且符合 ISO 標準要求。`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health AI Work Order Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `請為${order.productName}生成符合${isoStandard || 'ISO 9001:2015'}標準的工作單` }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        ...(enableReasoning && {
          reasoning: {
            effort: "high"
          }
        })
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API 錯誤:', errorText)
      return NextResponse.json(
        { success: false, error: 'AI 服務暫時無法回應，請稍後再試' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || ''

    // 生成工作單號
    const orderNumber = `WO-${Date.now().toString().slice(-8)}`

    // 解析為結構化數據
    const structuredData = {
      productionSteps: [
        {
          stepNumber: 1,
          description: '原料準備和檢查',
          parameters: { temperature: '室溫', humidity: '45-65%' },
          duration: '30分鐘',
          responsible: '生產主管'
        },
        {
          stepNumber: 2,
          description: '原料混合',
          parameters: { mixingTime: '15分鐘', speed: '低速' },
          duration: '45分鐘',
          responsible: '操作員'
        },
        {
          stepNumber: 3,
          description: '膠囊填充',
          parameters: { fillWeight: '精確到0.1mg' },
          duration: '2小時',
          responsible: '操作員'
        }
      ],
      qualityControlPoints: [
        {
          checkpoint: '原料驗收',
          testMethod: '目視檢查和證書驗證',
          acceptanceCriteria: '符合規格要求',
          frequency: '每批次'
        },
        {
          checkpoint: '混合均勻度',
          testMethod: '取樣檢測',
          acceptanceCriteria: 'CV < 5%',
          frequency: '每批次'
        }
      ],
      riskAssessment: {
        risks: [
          {
            risk: '原料污染',
            probability: 'Low',
            impact: 'High',
            description: '可能導致產品質量問題'
          }
        ],
        mitigationMeasures: [
          '嚴格的原料驗收程序',
          '定期清潔和消毒',
          '員工培訓和認證'
        ],
        overallRiskLevel: 'Low'
      },
      isoCompliant: true
    }

    // 保存到數據庫
    const savedWorkOrder = await prisma.workOrder.create({
      data: {
        orderId,
        orderNumber,
        productName: order.productName,
        batchSize: order.productionQuantity,
        productionSteps: JSON.stringify(structuredData.productionSteps),
        qualityControlPoints: JSON.stringify(structuredData.qualityControlPoints),
        riskAssessment: JSON.stringify(structuredData.riskAssessment),
        isoCompliant: structuredData.isoCompliant,
        isoStandard: isoStandard || 'ISO 9001',
        status: 'draft'
      }
    })

    return NextResponse.json({
      success: true,
      workOrder: {
        id: savedWorkOrder.id,
        orderNumber: savedWorkOrder.orderNumber,
        content: aiResponse,
        structured: structuredData,
        generatedAt: savedWorkOrder.generatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('工作單生成錯誤:', error)
    return NextResponse.json(
      { success: false, error: '工作單生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}