import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, isoStandard = 'ISO 9001', enableReasoning } = body

    // 驗證輸入
    if (!orderId) {
      return NextResponse.json(
        { error: '訂單ID不能為空' },
        { status: 400 }
      )
    }

    // 獲取訂單詳情
    const order = await prisma.productionOrder.findUnique({
      where: { id: orderId },
      include: {
        ingredients: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '找不到指定的訂單' },
        { status: 404 }
      )
    }

    // 構建 AI 提示詞
    const systemPrompt = `你是一位專業的膠囊生產工程師和質量管理專家，具有豐富的 ISO 標準工作單編制經驗。請根據以下訂單信息生成符合 ${isoStandard} 標準的生產工作單：

**訂單信息：**
- 客戶名稱：${order.customerName}
- 產品名稱：${order.productName}
- 生產數量：${order.productionQuantity} 粒
- 膠囊規格：
  - 顏色：${order.capsuleColor || '未指定'}
  - 大小：${order.capsuleSize || '未指定'}
  - 類型：${order.capsuleType || '未指定'}
- 原料配方：
${order.ingredients.map(ing => `  - ${ing.materialName}: ${ing.unitContentMg}mg (${ing.isCustomerProvided ? '客戶指定' : '廠商提供'})`).join('\n')}

**請以香港書面語繁體中文回答，並按照以下格式生成工作單：**

## 生產工作單

### 基本資訊
- 工作單號：WO-${Date.now().toString().slice(-8)}
- 產品名稱：${order.productName}
- 客戶名稱：${order.customerName}
- 批次大小：${order.productionQuantity} 粒
- ISO 標準：${isoStandard}
- 生成日期：${new Date().toLocaleDateString('zh-TW')}

### 生產步驟
| 步驟 | 工序名稱 | 操作內容 | 參數設置 | 負責人員 | 預計時間 |
|------|----------|----------|----------|----------|----------|
| 1 | 原料準備 | [具體操作] | [參數] | [人員] | [時間] |
| 2 | 混合工藝 | [具體操作] | [參數] | [人員] | [時間] |
| 3 | 膠囊填充 | [具體操作] | [參數] | [人員] | [時間] |
| 4 | 質量檢驗 | [具體操作] | [參數] | [人員] | [時間] |
| 5 | 包裝封存 | [具體操作] | [參數] | [人員] | [時間] |

### 質量控制點
| 檢查點 | 檢查項目 | 接受標準 | 檢查方法 | 檢查頻率 | 負責人員 |
|--------|----------|----------|----------|----------|----------|
| CP1 | 原料品質 | [標準] | [方法] | [頻率] | [人員] |
| CP2 | 混合均勻度 | [標準] | [方法] | [頻率] | [人員] |
| CP3 | 膠囊重量 | [標準] | [方法] | [頻率] | [人員] |
| CP4 | 最終品質 | [標準] | [方法] | [頻率] | [人員] |

### 風險評估
**高風險項目：**
- [風險項目]: [風險描述] - 緩解措施：[措施]

**中風險項目：**
- [風險項目]: [風險描述] - 緩解措施：[措施]

**低風險項目：**
- [風險項目]: [風險描述] - 緩解措施：[措施]

### 設備清單
| 設備名稱 | 型號 | 狀態 | 負責人員 | 備註 |
|----------|------|------|----------|------|
| [設備1] | [型號] | [狀態] | [人員] | [備註] |
| [設備2] | [型號] | [狀態] | [人員] | [備註] |

### 環境條件
- 溫度：20-25°C
- 濕度：45-65% RH
- 潔淨度：符合 GMP 要求
- 光照：避免直射陽光

### 安全注意事項
1. [安全注意事項1]
2. [安全注意事項2]
3. [安全注意事項3]

### 批准簽名
- 生產經理：_________________ 日期：_______
- 質量經理：_________________ 日期：_______

請確保工作單內容符合 ${isoStandard} 標準要求，並提供實用的專業建議。`

    // 調用 OpenRouter API
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'EasyPack v2.0 Work Order Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `請為訂單 ${order.productName} 生成符合 ${isoStandard} 標準的工作單。`
          }
        ],
        max_tokens: 4000,
        temperature: 0.6,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        ...(enableReasoning && { reasoning: { effort: 'high' } })
      })
    })

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text()
      console.error('OpenRouter API 錯誤:', errorData)
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    const aiResponse = await openrouterResponse.json()
    const workOrderContent = aiResponse.choices[0]?.message?.content

    if (!workOrderContent) {
      return NextResponse.json(
        { error: 'AI 回應格式錯誤' },
        { status: 500 }
      )
    }

    // 解析 AI 回應並提取結構化數據
    const parsedWorkOrder = parseWorkOrderResponse(workOrderContent, order)

    // 保存到數據庫
    const savedWorkOrder = await prisma.workOrder.create({
      data: {
        orderId,
        orderNumber: parsedWorkOrder.orderNumber,
        productName: order.productName,
        batchSize: order.productionQuantity,
        productionSteps: JSON.stringify(parsedWorkOrder.productionSteps),
        qualityControlPoints: JSON.stringify(parsedWorkOrder.qualityControlPoints),
        riskAssessment: JSON.stringify(parsedWorkOrder.riskAssessment),
        isoCompliant: true,
        isoStandard,
        status: 'draft'
      }
    })

    return NextResponse.json({
      success: true,
      workOrder: {
        id: savedWorkOrder.id,
        content: workOrderContent,
        structured: parsedWorkOrder,
        generatedAt: savedWorkOrder.generatedAt
      }
    })

  } catch (error) {
    console.error('工作單生成錯誤:', error)
    return NextResponse.json(
      { error: '工作單生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

// 解析 AI 回應的輔助函數
function parseWorkOrderResponse(content: string, order: any) {
  const workOrder = {
    orderNumber: `WO-${Date.now().toString().slice(-8)}`,
    productName: order.productName,
    batchSize: order.productionQuantity,
    productionSteps: [] as any[],
    qualityControlPoints: [] as any[],
    riskAssessment: {
      risks: [] as any[],
      mitigationMeasures: [] as string[],
      overallRiskLevel: 'Medium' as string
    }
  }

  try {
    // 提取工作單號
    const orderNumberMatch = content.match(/工作單號：([^\n]+)/)
    if (orderNumberMatch) {
      workOrder.orderNumber = orderNumberMatch[1].trim()
    }

    // 提取生產步驟
    const stepsSection = content.match(/### 生產步驟[\s\S]+?(?=###|$)/)
    if (stepsSection) {
      const lines = stepsSection[0].split('\n')
      for (const line of lines) {
        if (line.includes('|') && !line.includes('步驟') && !line.includes('---')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p)
          if (parts.length >= 6) {
            workOrder.productionSteps.push({
              stepNumber: parts[0],
              processName: parts[1],
              operation: parts[2],
              parameters: parts[3],
              responsible: parts[4],
              duration: parts[5]
            })
          }
        }
      }
    }

    // 提取質量控制點
    const qcSection = content.match(/### 質量控制點[\s\S]+?(?=###|$)/)
    if (qcSection) {
      const lines = qcSection[0].split('\n')
      for (const line of lines) {
        if (line.includes('|') && !line.includes('檢查點') && !line.includes('---')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p)
          if (parts.length >= 6) {
            workOrder.qualityControlPoints.push({
              checkpoint: parts[0],
              item: parts[1],
              standard: parts[2],
              method: parts[3],
              frequency: parts[4],
              responsible: parts[5]
            })
          }
        }
      }
    }

    // 提取風險評估
    const riskSection = content.match(/### 風險評估[\s\S]+?(?=###|$)/)
    if (riskSection) {
      const lines = riskSection[0].split('\n')
      for (const line of lines) {
        if (line.includes('風險項目') || line.includes('緩解措施')) {
          // 這裡可以進一步解析風險項目
          workOrder.riskAssessment.risks.push({
            risk: '生產風險',
            probability: 'Medium',
            impact: 'Medium',
            description: line.trim()
          })
        }
      }
    }

  } catch (error) {
    console.error('解析工作單回應時出錯:', error)
  }

  return workOrder
}
