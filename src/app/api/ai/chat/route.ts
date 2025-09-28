import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 清理訂單數據，移除系統內部ID，只保留用戶相關信息
function cleanOrderData(orders: any[]): any[] {
  return orders.map(order => ({
    customerName: order.customerName,
    productName: order.productName,
    productionQuantity: order.productionQuantity,
    unitWeightMg: order.unitWeightMg,
    batchTotalWeightMg: order.batchTotalWeightMg,
    capsuleColor: order.capsuleColor,
    capsuleSize: order.capsuleSize,
    capsuleType: order.capsuleType,
    completionDate: order.completionDate,
    processIssues: order.processIssues,
    qualityNotes: order.qualityNotes,
    ingredients: order.ingredients,
    createdBy: order.createdBy,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  }))
}

const DEFAULT_SUGGESTIONS = [
  '分析配方成分堆積密度，計算粉劑容積，對比膠囊殼容積，評估填充可行性並提供建議。',
  '分析原料流動性、黏性、結塊風險，評估製粒必要性（0-100分），推薦流動性改善輔料及用量。',
  '分析成分顏色混合效果，預測粉劑顏色，評估膠囊染色風險（0-100分）及預防措施。',
  '分析配方在港陸歐美的法規合規性，提供申報要求、標籤規範、成分限量清單。'
]

function sanitizeChunk(text: string): string {
  if (!text) return ''
  return text
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
}

function sanitizeFinal(text: string): string {
  return sanitizeChunk(text).trim()
}

async function generateSuggestions(
  aiResponse: string,
  userMessage: string,
  OPENROUTER_API_URL: string,
  OPENROUTER_API_KEY: string
): Promise<string[]> {
  if (!aiResponse) {
    return [...DEFAULT_SUGGESTIONS]
  }

  let suggestions: string[] = []

  console.log('=== 開始生成動態建議 ===')
  console.log('用戶問題:', userMessage)
  console.log('AI 回應長度:', aiResponse.length)
  console.log('AI 回應前100字符:', aiResponse.substring(0, 100))

  try {
    console.log('正在調用建議生成 API...')
    const suggestionsResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health AI Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          {
            role: 'user',
            content: `基於以下AI回答，生成4個相關的膠囊灌裝問題：

AI回答：${aiResponse}

請生成4個與膠囊灌裝相關的問題，每行一個，以問號結尾。
重要：不要包含編號（如1. 2. 3. 4.），只生成純問題內容。
語言要求：請使用香港繁體中文，使用繁體中文字符和香港常用的專業術語。
格式要求：問題應該簡潔明瞭，適合忙碌的用戶快速理解。`
          }
        ],
        max_tokens: 1000,        // 建議生成也增加，確保完整
        temperature: 0.3,        // 降低溫度，提高一致性
        top_p: 0.95,            // 提高 top_p
        frequency_penalty: 0.0,  // 移除懲罰
        presence_penalty: 0.0    // 移除懲罰
      })
    })

    console.log('建議 API 狀態:', suggestionsResponse.status)

    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json()
      console.log('建議 API 回應:', JSON.stringify(suggestionsData, null, 2))
      const suggestionsText = suggestionsData.choices?.[0]?.message?.content || ''
      console.log('原始建議文字:', suggestionsText)

      suggestions = suggestionsText.split('\n')
        .filter((s: string) => s.trim())
        .map((s: string) => s.trim().replace(/^[1-4]\.\s*/, ''))
        .filter((s: string) => {
          return s.length > 5 &&
            !s.includes('<|') &&
            !s.includes('begin_of_sentence') &&
            !s.includes('end_of_sentence') &&
            !s.includes('用正體中文') &&
            !s.includes('用中文') &&
            !s.includes('問題用中文') &&
            !s.includes('請用中文') &&
            !s.includes('請用正體中文') &&
            !s.includes('用繁體中文') &&
            !s.includes('請用繁體中文')
        })
        .slice(0, 4)

      console.log('過濾後的建議:', suggestions)
      console.log('建議數量:', suggestions.length)

      if (suggestions.length < 4) {
        console.log('建議不足，使用更寬鬆的過濾條件')
        suggestions = suggestionsText.split('\n')
          .filter((s: string) => s.trim())
          .map((s: string) => s.trim().replace(/^[1-4]\.\s*/, ''))
          .filter((s: string) => {
            return s.length > 3 &&
              !s.includes('<|') &&
              !s.includes('用正體中文') &&
              !s.includes('用中文') &&
              !s.includes('問題用中文') &&
              !s.includes('請用中文') &&
              !s.includes('請用正體中文') &&
              !s.includes('用繁體中文') &&
              !s.includes('請用繁體中文')
          })
          .slice(0, 4)
        console.log('寬鬆過濾後的建議:', suggestions)
      }
    } else {
      const errorText = await suggestionsResponse.text()
      console.error('建議 API 失敗:', suggestionsResponse.status)
      console.error('建議 API 錯誤回應:', errorText)
    }
  } catch (error) {
    console.error('生成動態建議時發生錯誤:', error)
  }

  if (suggestions.length === 0) {
    console.log('沒有生成建議，使用默認建議')
    suggestions = [...DEFAULT_SUGGESTIONS]
  }

  console.log('最終建議:', suggestions)
  console.log('建議數量:', suggestions.length)

  return suggestions
}

async function streamOpenRouterResponse(
  openRouterResponse: Response,
  controller: ReadableStreamDefaultController
): Promise<string> {
  const reader = openRouterResponse.body?.getReader()
  if (!reader) {
    throw new Error('OpenRouter 回應缺少 body')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let finalText = ''

  const processEvent = (rawEvent: string): 'continue' | 'done' => {
    const lines = rawEvent.split('\n')
    let dataPayload = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (trimmed.startsWith('data:')) {
        const dataContent = trimmed.replace(/^data:\s*/, '')
        dataPayload += dataPayload ? `\n${dataContent}` : dataContent
      }
    }

    if (!dataPayload) {
      return 'continue'
    }

    if (dataPayload === '[DONE]') {
      return 'done'
    }

    try {
      const json = JSON.parse(dataPayload)
      const choice = json.choices?.[0]
      
      // 處理 reasoning 思考過程
      if (choice?.delta?.reasoning) {
        const reasoningDelta = choice.delta.reasoning
        if (reasoningDelta) {
          const sanitized = sanitizeChunk(reasoningDelta)
          if (sanitized) {
            controller.enqueue(`event: reasoning\ndata: ${JSON.stringify(sanitized)}\n\n`)
          }
        }
      }
      
      // 處理 content 回答內容
      const delta = choice?.delta?.content || ''
      if (delta) {
        const sanitized = sanitizeChunk(delta)
        if (sanitized) {
          finalText += sanitized
          controller.enqueue(`event: delta\ndata: ${JSON.stringify(sanitized)}\n\n`)
        }
      }
    } catch (error) {
      console.error('解析流資料時出錯:', error)
    }

    return 'continue'
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      buffer += decoder.decode()
      break
    }

    buffer += decoder.decode(value, { stream: true })

    let eventBoundary = buffer.indexOf('\n\n')
    while (eventBoundary !== -1) {
      const rawEvent = buffer.slice(0, eventBoundary)
      buffer = buffer.slice(eventBoundary + 2)
      const result = processEvent(rawEvent)
      if (result === 'done') {
        return finalText
      }
      eventBoundary = buffer.indexOf('\n\n')
    }
  }

  if (buffer.trim()) {
    const result = processEvent(buffer)
    if (result === 'done') {
      return finalText
    }
  }

  return finalText
}

export async function POST(request: NextRequest) {
  try {
    const { message, orders, context, enableReasoning = false } = await request.json()

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API 密鑰未配置')
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請稍後再試或聯繫技術支援' },
        { status: 500 }
      )
    }

    const cleanedOrders = orders ? cleanOrderData(orders) : []
    const isSingleOrder = cleanedOrders && cleanedOrders.length === 1
    const hasContext = context && context.currentPage

    let systemPrompt = ''

    if (isSingleOrder) {
      systemPrompt = `你是一個專業的膠囊配方管理系統 AI 助手。用戶正在查看一個特定的生產訂單，你需要針對這個訂單進行詳細分析。

當前訂單數據：
${JSON.stringify(cleanedOrders[0], null, 2)}

請根據用戶的問題，針對這個特定訂單進行分析。你可以：
1. 分析原料配比和重量分配
2. 評估單粒重量是否合理
3. 檢查膠囊規格是否合適
4. 提供生產建議和注意事項
5. 分析品質風險點
6. 計算相關的統計數據
7. 評估製程問題和品管備註

請使用香港繁體中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。

重要：你的回答應該專注於膠囊灌裝相關的內容，包括膠囊規格、原料配比、生產工藝、質量控制等。請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。

語言要求：請嚴格使用香港繁體中文，包括：
- 使用繁體中文字符
- 使用香港常用的專業術語
- 保持專業但親切的語調
- 避免簡體中文或台灣用詞

版面格式要求：為了方便忙碌的用戶和手機用戶閱讀，請使用以下格式：
- 優先使用分點列表（• 或 -）來組織信息
- 使用表格來展示數據對比和統計
- 使用標題（## 或 ###）來分段組織內容
- 重要信息使用**粗體**標記
- 數字和關鍵數據使用\`代碼格式\`突出顯示
- 避免長段落，多用短句和分點
- 確保內容在手機屏幕上易於閱讀

特別注意：不要提及任何系統內部ID或編號，只使用客戶名稱、產品名稱等用戶友好的信息來描述訂單。`
    } else if (hasContext) {
      const cleanedCurrentOrder = context.currentOrder ? cleanOrderData([context.currentOrder])[0] : null
      const cleanedRecentOrders = context.recentOrders ? cleanOrderData(context.recentOrders) : []

      systemPrompt = `你是一個專業的膠囊配方管理系統智能 AI 助手。用戶當前正在 "${context.pageDescription}"，你需要根據用戶的當前頁面和上下文提供相關的幫助。

當前頁面信息：
- 頁面：${context.currentPage}
- 描述：${context.pageDescription}
- 時間：${context.timestamp}
- 訂單總數：${context.ordersCount}
- 是否有當前訂單：${context.hasCurrentOrder ? '是' : '否'}

${cleanedCurrentOrder ? `當前查看的訂單：
${JSON.stringify(cleanedCurrentOrder, null, 2)}` : ''}

${cleanedRecentOrders && cleanedRecentOrders.length > 0 ? `最近的訂單數據：
${JSON.stringify(cleanedRecentOrders, null, 2)}` : ''}

${cleanedOrders && cleanedOrders.length > 0 ? `完整的訂單數據庫統計：
- 總訂單數：${cleanedOrders.length}
- 未完工訂單數：${cleanedOrders.filter((order: any) => !order.completionDate).length}
- 已完工訂單數：${cleanedOrders.filter((order: any) => order.completionDate).length}

當用戶詢問具體訂單信息時，請從以下完整數據中篩選：
${JSON.stringify(cleanedOrders, null, 2)}` : ''}

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

請使用香港繁體中文回答，並提供具體的數據支持和專業建議。如果數據中有日期，請使用適當的日期格式。

重要：請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。

語言要求：請嚴格使用香港繁體中文，包括：
- 使用繁體中文字符
- 使用香港常用的專業術語
- 保持專業但親切的語調
- 避免簡體中文或台灣用詞

版面格式要求：為了方便忙碌的用戶和手機用戶閱讀，請使用以下格式：
- 優先使用分點列表（• 或 -）來組織信息
- 使用表格來展示數據對比和統計
- 使用標題（## 或 ###）來分段組織內容
- 重要信息使用**粗體**標記
- 數字和關鍵數據使用\`代碼格式\`突出顯示
- 避免長段落，多用短句和分點
- 確保內容在手機屏幕上易於閱讀

特別注意：不要提及任何系統內部ID或編號，只使用客戶名稱、產品名稱等用戶友好的信息來描述訂單。`
    } else {
      systemPrompt = `你是一個專業的膠囊配方管理系統 AI 助手。你可以幫助用戶查詢和分析生產訂單數據。

系統數據：
${JSON.stringify(cleanedOrders, null, 2)}

請根據用戶的問題，分析訂單數據並提供有用的回答。你可以：
1. 查詢特定客戶的訂單
2. 分析生產狀態
3. 統計原料使用情況
4. 查找特定產品的訂單
5. 分析生產趨勢
6. 計算統計數據

請使用香港繁體中文回答，並提供具體的數據支持。如果數據中有日期，請使用適當的日期格式。

重要：請確保回答內容乾淨整潔，不要包含任何特殊標記或格式符號。回答必須以完整的句子結束，不要包含任何未完成的文字或特殊標記。

語言要求：請嚴格使用香港繁體中文，包括：
- 使用繁體中文字符
- 使用香港常用的專業術語
- 保持專業但親切的語調
- 避免簡體中文或台灣用詞

版面格式要求：為了方便忙碌的用戶和手機用戶閱讀，請使用以下格式：
- 優先使用分點列表（• 或 -）來組織信息
- 使用表格來展示數據對比和統計
- 使用標題（## 或 ###）來分段組織內容
- 重要信息使用**粗體**標記
- 數字和關鍵數據使用\`代碼格式\`突出顯示
- 避免長段落，多用短句和分點
- 確保內容在手機屏幕上易於閱讀

特別注意：不要提及任何系統內部ID或編號，只使用客戶名稱、產品名稱等用戶友好的信息來描述訂單。`
    }

    const upstreamResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health AI Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 32000,       // 設置到極限，確保完整分析不被截斷
        temperature: 0.2,        // 降低溫度，提高一致性
        top_p: 0.95,            // 稍微提高 top_p
        frequency_penalty: 0.0,  // 移除頻率懲罰，讓 AI 更自然
        presence_penalty: 0.0,   // 移除存在懲罰
        stream: true,
        ...(enableReasoning && {
          reasoning: {
            effort: "high"  // 用戶可選的深度推理模式
          }
        })
      })
    })

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text()
      console.error('OpenRouter API 錯誤:', errorText)
      
      // 檢查是否是認證錯誤
      if (upstreamResponse.status === 401) {
        throw new Error('AI 服務認證失敗，請聯繫系統管理員檢查 API 密鑰')
      }
      
      throw new Error('AI 服務暫時無法回應，請稍後再試或重試')
    }

    let finalText = ''

    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          finalText = sanitizeFinal(await streamOpenRouterResponse(upstreamResponse, controller))

          const suggestions = await generateSuggestions(finalText, message, OPENROUTER_API_URL, OPENROUTER_API_KEY)
          controller.enqueue(`event: suggestions\ndata: ${JSON.stringify(suggestions)}\n\n`)
          controller.enqueue(`event: done\ndata: {"success":true}\n\n`)
          controller.close()
        } catch (error) {
          console.error('流式處理時發生錯誤:', error)
          controller.enqueue(`event: error\ndata: {"error":"AI 服務暫時無法回應，請稍後再試"}\n\n`)
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    console.error('AI 聊天錯誤:', error)
    return NextResponse.json(
      { error: 'AI 助手暫時無法回應，請稍後再試或重試' },
      { status: 500 }
    )
  }
}