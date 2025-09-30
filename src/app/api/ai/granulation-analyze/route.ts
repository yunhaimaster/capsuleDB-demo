import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { recipe, model } = await request.json()

    if (!recipe) {
      return NextResponse.json(
        { error: '請提供要分析的配方' },
        { status: 400 }
      )
    }

    // 從環境變數獲取 API 配置
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

步驟 1. 原料性質分析
- 請逐一列出配方原料，評估流動性、黏性、結塊風險。
- 若資料欠缺，請填入常見文獻範圍並標註為「假設值」。
- 請用表格，欄位 = 原料 | 特性 | 假設值/文獻參考 | 風險說明。

步驟 2. 製粒必要性初評分
- 請綜合上述信息，給出 0–100 分製粒必要性分數。
- 解釋分數依據。
- 額外補充：《為何可能不需要製粒》的簡短判斷。

步驟 3. 流動性改善方案
- 只能從以下輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。
- 列出建議添加的品項、比例範圍（例如 0.2%–2%）、作用機制。
- 若不建議加任何輔料，解釋原因。
- 提供表格列出：輔料 | 建議比例% | 作用機制。

步驟 4. 改善後再評估
- 假設按照建議配方改善後，給出【改善後的製粒必要性評分】（0–100 分）。
- 說明分數差異。

步驟 5. 總結
- 總結該配方製粒必要性結論。
- 明確提醒：此評估僅供理論參考，需實驗驗證。

⚠️ 特殊要求：
- 嚴格依照以上結構輸出，不得省略。
- 如資料不足，請標明「假設值」而不是憑空臆測。
- 請勿省略任何分析部分，即使部分數據是假設，也要完整交代。

語言要求：請使用香港書面語繁體中文，包括：
- 使用繁體中文字符
- 使用香港常用的專業術語
- 保持專業但親切的書面語語調
- 避免簡體中文、台灣用詞或粵語口語
- 使用正式的書面表達方式`

    const userPrompt = `請分析以下配方是否需要製粒：

${recipe}

請提供詳細的製粒必要性分析。`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health Granulation Analyzer'
      },
      body: JSON.stringify({
        model: model,
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
      console.error('OpenRouter API 錯誤:', errorText)
      throw new Error('OpenRouter API 請求失敗')
    }

    const data = await response.json()
    console.log('製粒分析 API 回應:', JSON.stringify(data, null, 2))
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('API 回應結構無效:', data)
      throw new Error('API 回應結構無效')
    }
    
    let aiResponse = data.choices[0].message.content
    
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('AI 回應為空')
      throw new Error('AI 回應為空')
    }

    // 清理 AI 回答中的異常文字
    aiResponse = aiResponse
      .replace(/<\|begin_of_sentence\s*\|>/g, '')
      .replace(/<\|end_of_sentence\s*\|>/g, '')
      .replace(/\|>/g, '')
      .trim()

    return NextResponse.json({
      success: true,
      content: aiResponse,
      model: model,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('製粒分析錯誤:', error)
    return NextResponse.json(
      { error: '製粒分析失敗，請檢查輸入格式或稍後再試' },
      { status: 500 }
    )
  }
}
