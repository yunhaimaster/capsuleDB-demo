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

請使用香港書面語繁體中文回答，確保內容專業、準確且符合 ISO 標準要求。`

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
        stream: true,
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
        { success: false, error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    // 生成工作單 ID
    const workOrderId = `workorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 創建流式響應
    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('無法讀取響應流')
          }

          const decoder = new TextDecoder()
          let buffer = ''
          let fullContent = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // 發送完成事件
                  controller.enqueue(`event: done\ndata: {"success":true}\n\n`)
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  
                  if (content) {
                    fullContent += content
                    controller.enqueue(`event: delta\ndata: ${JSON.stringify(content)}\n\n`)
                  }

                  // 處理 reasoning
                  if (parsed.choices?.[0]?.delta?.reasoning) {
                    controller.enqueue(`event: reasoning\ndata: ${JSON.stringify(parsed.choices[0].delta.reasoning)}\n\n`)
                  }
                } catch (err) {
                  console.error('解析流式數據失敗:', err)
                }
              }
            }
          }

          // 如果沒有收到 [DONE]，手動關閉
          if (fullContent) {
            controller.enqueue(`event: done\ndata: {"success":true}\n\n`)
          }
          controller.close()
        } catch (error) {
          console.error('流式處理錯誤:', error)
          controller.enqueue(`event: error\ndata: {"error":"AI 服務暫時無法回應，請稍後再試"}\n\n`)
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('AI 工作單生成錯誤:', error)
    return NextResponse.json(
      { success: false, error: '工作單生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
