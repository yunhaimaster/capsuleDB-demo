import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message, orders, context } = await request.json()

    // 從環境變數獲取 API 配置
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API 密鑰未配置')
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請稍後再試或聯繫技術支援' },
        { status: 500 }
      )
    }

    // 構建智能系統提示詞
    const isSingleOrder = orders && orders.length === 1
    const hasContext = context && context.currentPage
    
    let systemPrompt = ''
    
    if (isSingleOrder) {
      // 單個訂單分析模式 - 優先級最高
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

請用中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。

重要：你的回答應該專注於膠囊灌裝相關的內容，包括膠囊規格、原料配比、生產工藝、質量控制等。請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。`
    } else if (hasContext) {
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

${orders && orders.length > 0 ? `完整的訂單數據庫統計：
- 總訂單數：${orders.length}
- 未完工訂單數：${orders.filter((order: any) => !order.completionDate).length}
- 已完工訂單數：${orders.filter((order: any) => order.completionDate).length}

當用戶詢問具體訂單信息時，請從以下完整數據中篩選：
${JSON.stringify(orders, null, 2)}` : ''}

請根據用戶當前所在的頁面和上下文，提供相關的幫助。你可以：
1. 分析當前頁面顯示的數據
2. 提供頁面相關的操作建議
3. 回答關於當前頁面內容的問題
4. 提供頁面功能的指導
5. 分析相關的訂單數據（使用完整的訂單數據庫進行查詢和篩選）
6. 提供專業的建議和見解
7. 根據訂單狀態（completionDate 為 null 表示未完工）篩選和分析訂單

重要提醒：
- 當用戶詢問"未完工訂單"時，請查看完整的訂單數據庫，篩選 completionDate 為 null 的訂單，並逐一列出所有未完工訂單的詳細信息
- 當用戶詢問"已完工訂單"時，請查看完整的訂單數據庫，篩選 completionDate 不為 null 的訂單
- 請使用完整的訂單數據進行統計和分析，而不僅僅是最近的訂單
- 確保回答完整，不要截斷，如果訂單數據較多請分段展示但要包含所有相關訂單

請用中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。

重要：請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。`
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

請用中文回答，並提供具體的數據支持。如果數據中有日期，請使用適當的日期格式。

重要：請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。`
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
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API 錯誤:', errorText)
      throw new Error('AI 服務暫時無法回應，請稍後再試')
    }

    const data = await response.json()
    console.log('API 回應:', JSON.stringify(data, null, 2))
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('API 回應結構無效:', data)
      throw new Error('AI 回應格式異常，請重試')
    }
    
    let aiResponse = data.choices[0].message.content
    
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('AI 回應為空')
      throw new Error('AI 回應為空，請重試')
    }
    
    // 清理 AI 回答中的異常文字
    aiResponse = aiResponse
      .replace(/<\|begin_of_sentence\s*\|>/g, '')
      .replace(/<\|end_of_sentence\s*\|>/g, '')
      .replace(/<\|begin_of_sentence\s*\|/g, '')
      .replace(/<\|end_of_sentence\s*\|/g, '')
      .replace(/<\|.*?\|>/g, '')
      .replace(/<\|.*?\|/g, '')
      .replace(/<\|.*?>/g, '')
      .replace(/<\|.*?/g, '')
      .replace(/<\|/g, '')
      .replace(/\|>/g, '')
      .trim()

    // 基於 AI 回答動態生成建議問題
    let suggestions = []
    console.log('開始為訊息生成建議:', message)
    console.log('AI 回應:', aiResponse)
    
    try {
      console.log('嘗試生成動態建議')
      const suggestionsResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
          'X-Title': 'EasyPack AI Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1',
          messages: [
            { 
              role: 'system', 
              content: `你是專業的膠囊灌裝生產管理系統 AI 助手。請根據用戶問題和 AI 回答，生成4個與膠囊灌裝相關的建議問題。

用戶問題：${message}
AI回答：${aiResponse}

請基於 AI 回答的具體內容，生成4個與膠囊灌裝相關的建議問題。要求：
1. 必須與膠囊灌裝、膠囊配方、膠囊生產直接相關
2. 基於 AI 回答的具體內容深入提問
3. 涉及膠囊規格、原料配比、生產工藝、質量控制、設備參數等
4. 問題要具體、實用，能幫助用戶深入了解膠囊灌裝
5. 問題必須是完整的問句，以問號結尾
6. 避免通用性問題，要針對回答內容
7. 每個問題都要基於AI回答中的具體內容

請嚴格返回4個問題，每行一個，格式如下：
問題1？
問題2？
問題3？
問題4？

不要包含任何編號、標點符號或其他文字，只要問題內容。`
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      })

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json()
        console.log('建議 API 回應:', suggestionsData)
        const suggestionsText = suggestionsData.choices[0].message.content
        console.log('原始建議文字:', suggestionsText)
        
        // 更寬鬆的過濾條件
        suggestions = suggestionsText.split('\n')
          .filter((s: string) => s.trim())
          .map((s: string) => s.trim())
          .filter((s: string) => {
            // 基本過濾條件：長度和有害內容
            return s.length > 5 && 
                   !s.includes('問題用中文') && 
                   !s.includes('用中文') &&
                   !s.includes('<|') &&
                   !s.includes('begin_of_sentence') &&
                   !s.includes('end_of_sentence') &&
                   !s.includes('可以查看更多詳細分析嗎') &&
                   !s.includes('如何深入分析這個問題') &&
                   !s.includes('有哪些相關的統計數據') &&
                   !s.includes('如何優化相關流程')
          })
          .slice(0, 4)
        
        console.log('過濾後的建議:', suggestions)
        
        // 如果過濾後少於4個問題，嘗試更寬鬆的條件
        if (suggestions.length < 4) {
          console.log('建議不足，使用更寬鬆的過濾條件')
          suggestions = suggestionsText.split('\n')
            .filter((s: string) => s.trim())
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 3 && !s.includes('<|'))
            .slice(0, 4)
        }
        
        console.log('最終建議:', suggestions)
      } else {
        console.error('建議 API 失敗:', suggestionsResponse.status)
        const errorText = await suggestionsResponse.text()
        console.error('建議 API 錯誤回應:', errorText)
      }
    } catch (error) {
      console.error('生成動態建議時發生錯誤:', error)
    }
    
    // 確保總是有建議問題
    if (suggestions.length === 0) {
      console.log('沒有生成建議，使用默認建議')
      suggestions = [
        '這個配方的膠囊灌裝精度如何控制？',
        '膠囊規格選擇有什麼建議？',
        '原料配比如何影響灌裝效果？',
        '生產工藝參數如何優化？'
      ]
    }

    return NextResponse.json({ 
      response: aiResponse,
      suggestions: suggestions
    })

  } catch (error) {
    console.error('AI 聊天錯誤:', error)
    return NextResponse.json(
      { error: 'AI 助手暫時無法回應，請稍後再試或重試' },
      { status: 500 }
    )
  }
}