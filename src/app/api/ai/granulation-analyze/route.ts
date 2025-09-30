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
    const systemPrompt = `你是一個專業的膠囊配方製粒分析專家。請根據提供的配方分析是否需要製粒，並提供詳細的專業建議。

分析要求：
請依下列步驟，評估配方是否需要製粒：

**原料性質分析**
分析配方中每個原料的粉體性質，包括流動性、黏性、結塊風險。
若為假設或典型值，請清楚標註。

**製粒必要性評分**
綜合上述結果後，給出【製粒必要性評分】，範圍 0–100 分。
分數含義：
0 = 完全不需要
100 = 極度需要
請解釋給分理由。

**流動性改善方案**
只能從以下可用的輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。
推薦是否需要添加輔料，若需要，請提出具體建議（哪些品項、建議添加比例佔配方百分比、改善機制）。

**改善後再評估**
假設已添加建議輔料後，重新給出【改善後的製粒必要性評分】（0–100 分）。
比較改善前後的差異，並解釋原因。

**注意事項：**
請以結構化回覆。
建議使用表格或分點敘述，突出「分析 → 分數 → 建議 → 改善後評分」。
此分析僅作配方前期理論參考，最終仍需實驗驗證。

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
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.95,
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
