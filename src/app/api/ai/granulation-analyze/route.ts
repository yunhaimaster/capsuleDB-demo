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
    const systemPrompt = `你是一個專業的膠囊配方製粒分析專家。請依以下五步嚴格輸出，並保持結構化、詳盡、專業。

請在輸出之前，內部先逐步推理每個原料的性質與影響，再彙總為結果。最終只顯示結論，推理過程隱藏。

**請使用 Markdown 格式輸出，包含表格、粗體標題和清晰的結構化內容。**

步驟 1. 原料性質分析
- 請逐一列出配方原料，評估流動性、黏性、結塊風險。
- 若資料欠缺，請填入常見文獻範圍並標註為「假設值」。
- 請用 Markdown 表格，欄位 = 原料 | 特性 | 假設值/文獻參考 | 風險說明。

步驟 2. 製粒必要性初評分
- 請綜合上述信息，給出 0–100 分製粒必要性分數。
- 解釋分數依據。
- 額外補充：《為何可能不需要製粒》的簡短判斷。

步驟 3. 流動性改善方案
- 只能從以下輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。
- 列出建議添加的品項、比例範圍（例如 0.2%–2%）、作用機制。
- 若不建議加任何輔料，解釋原因。
- 提供 Markdown 表格列出：輔料 | 建議比例% | 作用機制。

步驟 4. 改善後再評估
- 假設按照建議配方改善後，給出【改善後的製粒必要性評分】（0–100 分）。
- 說明分數差異。

步驟 5. 總結
- 總結該配方製粒必要性結論。
- 明確提醒：此評估僅供理論參考，需實驗驗證。

⚠️ 特殊要求：
- 嚴格依照以上結構輸出，不得省略。
- **必須使用 Markdown 格式，包括粗體標題、表格和列表。**
- 如資料不足，請標明「假設值」而不是憑空臆測。
- 請勿省略任何分析部分，即使部分數據是假設，也要完整交代。

語言要求：請使用香港書面語繁體中文，包括：
- 使用繁體中文字符
- 使用香港常用的專業術語
- 保持專業但親切的書面語語調
- 避免簡體中文、台灣用詞或粵語口語
- 使用正式的書面表達方式`

    const recipe = ingredients.map(ing => `${ing.materialName}: ${ing.unitContentMg}mg`).join('\n')
    const userPrompt = `請分析以下配方是否需要製粒：

${recipe}

請提供詳細的製粒必要性分析。`

    const allModels = [
      { id: 'x-ai/grok-4-fast', name: 'xAI Grok 4 Fast' },
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

        // 設置流式響應
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
                      controller.close()
                      return
                    }

                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content
                      if (content) {
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ model: model.name, content })}\n\n`))
                      }
                    } catch (e) {
                      // 忽略解析錯誤
                    }
                  }
                }
              }
            } catch (error) {
              controller.error(error)
            } finally {
              reader?.releaseLock()
            }
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
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