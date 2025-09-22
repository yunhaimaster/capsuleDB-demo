import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message, orders, context } = await request.json()

    // 從環境變數獲取 API 配置
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not configured')
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請聯繫 Victor' },
        { status: 500 }
      )
    }

    // 構建智能系統提示詞
    const isSingleOrder = orders && orders.length === 1
    const hasContext = context && context.currentPage
    
    let systemPrompt = ''
    
    if (hasContext) {
      // 智能上下文模式
      systemPrompt = `你是一個專業的膠囊配方管理系統智能 AI 助手。用戶當前正在 "${context.pageDescription}"，你需要根據用戶的當前頁面和上下文提供相關的幫助。

當前頁面信息：
- 頁面：${context.currentPage}
- 描述：${context.pageDescription}
- 時間：${context.timestamp}
- 訂單總數：${context.ordersCount}
- 是否有當前訂單：${context.hasCurrentOrder ? '是' : '否'}

${context.currentOrder ? `當前查看的訂單：
${JSON.stringify(context.currentOrder, null, 2)}` : ''}

${context.recentOrders && context.recentOrders.length > 0 ? `最近的訂單數據：
${JSON.stringify(context.recentOrders, null, 2)}` : ''}

請根據用戶當前所在的頁面和上下文，提供相關的幫助。你可以：
1. 分析當前頁面顯示的數據
2. 提供頁面相關的操作建議
3. 回答關於當前頁面內容的問題
4. 提供頁面功能的指導
5. 分析相關的訂單數據
6. 提供專業的建議和見解

請用中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。`
    } else if (isSingleOrder) {
      // 單個訂單分析模式
      systemPrompt = `你是一個專業的膠囊配方管理系統 AI 助手。用戶正在查看一個特定的生產訂單，你需要針對這個訂單進行詳細分析。

當前訂單數據：
${JSON.stringify(orders[0], null, 2)}

請根據用戶的問題，針對這個特定訂單進行分析。你可以：
1. 分析原料配比和重量分配
2. 評估單粒重量是否合理
3. 檢查膠囊規格是否合適
4. 提供生產建議和注意事項
5. 分析品質風險點
6. 計算相關的統計數據
7. 評估製程問題和品管備註

請用中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。`
    } else {
      // 一般查詢模式
      systemPrompt = `你是一個專業的膠囊配方管理系統 AI 助手。你可以幫助用戶查詢和分析生產訂單數據。

系統數據：
${JSON.stringify(orders, null, 2)}

請根據用戶的問題，分析訂單數據並提供有用的回答。你可以：
1. 查詢特定客戶的訂單
2. 分析生產狀態
3. 統計原料使用情況
4. 查找特定產品的訂單
5. 分析生產趨勢
6. 計算統計數據

請用中文回答，並提供具體的數據支持。如果數據中有日期，請使用適當的日期格式。`
    }

    // 調用 OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'EasyPack AI Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error('OpenRouter API request failed')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // 基於 AI 回答動態生成建議問題
    let suggestions = []
    try {
      const suggestionsResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
          'X-Title': 'EasyPack AI Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            { 
              role: 'system', 
              content: `你是一個專業的膠囊灌裝生產管理系統 AI 助手。請根據用戶的問題和你的回答，生成4個與膠囊灌裝相關的建議問題。

用戶問題：${message}
AI回答：${aiResponse}

請分析 AI 回答的內容，生成4個與膠囊灌裝相關的建議問題。問題必須：
1. 只與膠囊灌裝、膠囊配方、膠囊生產相關
2. 基於剛才的回答內容深入分析
3. 涉及膠囊規格、原料配比、生產工藝、質量控制等
4. 有助於用戶進一步了解膠囊灌裝相關問題
5. 問題簡潔明確，可以直接點擊使用

請只返回4個問題，每行一個，不要編號，不要其他文字。`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      })

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json()
        const suggestionsText = suggestionsData.choices[0].message.content
        suggestions = suggestionsText.split('\n').filter((s: string) => s.trim()).slice(0, 4)
        console.log('Dynamic suggestions generated:', suggestions)
      } else {
        console.error('Suggestions API failed:', suggestionsResponse.status)
        // 如果 API 失敗，提供基於回答內容的默認建議
        suggestions = [
          '可以查看更多詳細分析嗎？',
          '如何深入分析這個問題？',
          '有哪些相關的統計數據？',
          '如何優化相關流程？'
        ]
      }
    } catch (error) {
      console.error('Error generating dynamic suggestions:', error)
      // 如果生成失敗，提供默認建議
      suggestions = [
        '可以查看更多詳細分析嗎？',
        '如何深入分析這個問題？',
        '有哪些相關的統計數據？',
        '如何優化相關流程？'
      ]
    }

    return NextResponse.json({ 
      response: aiResponse,
      suggestions: suggestions
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'AI 助手暫時無法回應，請稍後再試' },
      { status: 500 }
    )
  }
}