import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, orders } = await request.json()

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

    // 構建系統提示詞
    const isSingleOrder = orders && orders.length === 1
    const systemPrompt = isSingleOrder 
      ? `你是一個專業的膠囊配方管理系統 AI 助手。用戶正在查看一個特定的生產訂單，你需要針對這個訂單進行詳細分析。

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
      : `你是一個專業的膠囊配方管理系統 AI 助手。你可以幫助用戶查詢和分析生產訂單數據。

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

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'AI 助手暫時無法回應，請稍後再試' },
      { status: 500 }
    )
  }
}