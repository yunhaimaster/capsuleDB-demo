import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { ingredients, singleModel } = await request.json()

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: '請提供要分析的配方原料' },
        { status: 400 }
      )
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API 密鑰未配置')
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    // 構建製粒分析提示詞
    const systemPrompt = `你是一個專業的膠囊配方製粒分析專家。

請根據提供的配方，先完成完整的分析與第一次評分；其後在「改善後再評估」時，必須基於第一次評估的邏輯進行相對比較，而不是重新獨立打分。

請在輸出之前，內部先逐步推理每個原料的性質與影響，再彙總為結果。最終只顯示結論，推理過程隱藏。

**請使用 Markdown 格式輸出，包含粗體標題、表格和清晰的結構化內容。**

評分準則一致性：
- 所有評分必須基於同一套標準準則。
- 改善後的評估必須直接參考原始分數，只允許在原本評估邏輯下進行相對調整。
- 改善後的分數必須 ≤ 原始分數，且差異必須有明確的數據或專業理由支撐。
- 一般降幅應介乎 10–30 分；僅在極高風險情況才可接近 40 分。若配方本身已接近低風險，分數只能小幅下降。
- 不得出現不合理的大幅下降或上升。

輸出結構：
步驟 1. 原料性質分析
- 請逐一列出配方原料，評估流動性、黏性、結塊風險。
- 如資料欠缺，填入常見文獻範圍並標註為「假設值」。
- 以 Markdown 表格呈現，欄位 = 原料 | 特性 | 假設值/文獻參考 | 風險說明。

步驟 2. 製粒必要性初評分
- 綜合上述信息，給出 0–100 分的製粒必要性分數。
- 解釋分數依據。
- 額外提供《為何可能不需要製粒》的簡短判斷。

步驟 3. 流動性改善方案
- 只能從以下輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。
- 列出建議添加的品項、比例範圍（例如 0.2%–2%）、作用機制。
- 若不建議加任何輔料，解釋原因。
- 以 Markdown 表格呈現：輔料 | 建議比例% | 作用機制。

步驟 4. 改善後再評估
- 直接與第一次評分比較，不可從零開始重算。
- 以 Markdown 表格呈現：指標 | 原始配方 | 改善後配方 | 分數差異與原因。
- 指標至少包括：流動性、黏性、結塊風險、整體分數。
- 對整體分數欄位補充「原始分數」「改善後分數」及「分數差異說明」。

**請注意：**
- 僅在「實際有應用改善方案」時才調整分數。
- 如果沒有改善方案，或認為不需要改善，則改善後評分必須與原始評分**保持完全相同**。
- 不得無理由降低或提高分數。
- 分數變化必須對應具體的改善措施與理由。

**分數調整規則：**
- 若改善後配方 = 原配方，則分數差異應為 0。
- 若有小幅改善，分數下降幅度 <= 10 分。
- 若屬於重大改善，分數下降幅度 <= 30 分。
- 不可出現無改善卻減分的情況。

步驟 5. 總結
- 總結該配方的製粒必要性結論與改善後印象。
- 明確提醒：此評估僅供理論參考，需配合實驗驗證。

⚠️ 其他要求：
- 嚴格依照上述結構輸出，不得省略任何部分。
- **必須使用 Markdown 格式**，包括粗體標題、表格和條列式內容。
- 如資料不足，請標明「假設值」，不得憑空臆測。
- 請保持香港書面語繁體中文的專業但親切語調，避免簡體中文、台灣用詞或粵語口語，並使用正式書面表達。`

    const recipe = ingredients.map(ing => `${ing.materialName}: ${ing.unitContentMg}mg`).join('\n')
    const userPrompt = `請分析以下配方是否需要製粒：

${recipe}

請提供詳細的製粒必要性分析。`

    const allModels = [
      { id: 'google/gemini-2.5-flash', name: 'Google Gemini 2.5 Flash' },
      { id: 'openai/gpt-4.1-mini', name: 'OpenAI GPT-4.1 Mini' },
      { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek v3.1' },
    ]

    // 如果指定了單個模型，只使用該模型；否則使用所有模型
    const models = singleModel 
      ? allModels.filter(model => model.id === singleModel)
      : allModels

    // 如果請求單個模型，使用流式輸出
    if (singleModel) {
      const model = allModels.find(m => m.id === singleModel)
      if (!model) {
        return NextResponse.json(
          { error: '指定的模型不存在' },
          { status: 400 }
        )
      }

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
            'X-Title': `Granulation Analyzer - ${model.name}`
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 9999,
            temperature: 0.2,
            top_p: 0.9,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stream: true
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`OpenRouter API 錯誤 (${model.name}):`, errorText)
          return NextResponse.json(
            { error: `API 請求失敗: ${errorText}` },
            { status: response.status }
          )
        }

        // 設置流式響應 - 使用 SSE 格式
        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            try {
              while (true) {
                const { done, value } = await reader!.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                      // 發送完成事件
                      controller.enqueue(new TextEncoder().encode('event: done\ndata: {}\n\n'))
                      controller.close()
                      return
                    }

                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content
                      if (content) {
                        // 使用 SSE 格式發送 delta 事件
                        controller.enqueue(new TextEncoder().encode(`event: delta\ndata: ${JSON.stringify(content)}\n\n`))
                      }
                    } catch (e) {
                      // 忽略解析錯誤
                    }
                  }
                }
              }
            } catch (error) {
              // 發送錯誤事件
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
              controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`))
              controller.error(error)
            } finally {
              reader?.releaseLock()
            }
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      } catch (err) {
        console.error(`製粒分析錯誤 (${model.name}):`, err)
        return NextResponse.json(
          { error: err instanceof Error ? err.message : '分析過程中發生未知錯誤' },
          { status: 500 }
        )
      }
    }

    // 原有的並行調用邏輯（非流式）
    const fetchPromises = models.map(async (model) => {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
            'X-Title': `Granulation Analyzer - ${model.name}`
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 9999,
            temperature: 0.2,
            top_p: 0.9,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`OpenRouter API 錯誤 (${model.name}):`, errorText)
          return { model: model.name, error: `API 請求失敗: ${errorText}` }
        }

        const data = await response.json()
        let aiResponse = data.choices?.[0]?.message?.content || '未能獲取分析結果。'

        // 清理 AI 回答中的異常文字
        aiResponse = aiResponse
          .replace(/<\|begin_of_sentence\s*\|>/g, '')
          .replace(/<\|end_of_sentence\s*\|>/g, '')
          .replace(/\|>/g, '')
          .trim()

        return { model: model.name, response: aiResponse }
      } catch (err) {
        console.error(`製粒分析錯誤 (${model.name}):`, err)
        return { model: model.name, error: err instanceof Error ? err.message : '分析過程中發生未知錯誤' }
      }
    })

    const results = await Promise.all(fetchPromises)

    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('製粒分析總體錯誤:', error)
    return NextResponse.json(
      { error: '製粒分析失敗，請稍後再試' },
      { status: 500 }
    )
  }
}