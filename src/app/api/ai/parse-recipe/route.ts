import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text, image } = await request.json()

    if (!text && !image) {
      return NextResponse.json(
        { error: '請提供要解析的文字或圖片' },
        { status: 400 }
      )
    }

    // 從環境變數獲取 API 配置
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API 密鑰未配置')
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請聯繫 Victor' },
        { status: 500 }
      )
    }

    // 構建解析提示詞
    const systemPrompt = `你是一個專業的膠囊配方解析助手。請解析用戶提供的配方文字或圖片，提取出所有原料及其含量。

要求：
1. 識別所有原料名稱（中文或英文）
2. 提取每個原料的含量（支援 mg、g、kg 等單位）
3. 將所有含量統一轉換為 mg
4. 如果沒有指定單位，默認為 mg（例如：25 = 25mg，不是 25000mg）
5. 忽略非原料內容（如膠囊殼、包裝材料等）
6. 如果含量不明確，請標記為需要確認

請以 JSON 格式返回結果：
{
  "ingredients": [
    {
      "materialName": "原料名稱",
      "unitContentMg": 含量數字,
      "originalText": "原始文字",
      "needsConfirmation": true/false
    }
  ],
  "summary": "解析摘要",
  "confidence": "高/中/低"
}

重要單位轉換規則：
- 沒有單位時默認為 mg（例如：25 = 25mg）
- 1g = 1000mg
- 1kg = 1000000mg
- 1mcg = 0.001mg
- 1IU 維生素D3 ≈ 0.025mcg ≈ 0.000025mg
- 1IU 維生素E ≈ 0.67mg

注意：
- unitContentMg 必須是數字（以 mg 為單位）
- 如果含量不明確，設置 needsConfirmation 為 true
- 只返回原料，不包括膠囊殼等輔料
- 確保所有數值都是合理的 mg 單位`

    const userPrompt = image 
      ? `請解析這張圖片中的配方信息：${image}`
      : `請解析以下配方文字：\n\n${text}`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'EasyPack Recipe Parser'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API 錯誤:', errorText)
      throw new Error('OpenRouter API 請求失敗')
    }

    const data = await response.json()
    console.log('配方解析 API 回應:', JSON.stringify(data, null, 2))
    
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

    // 嘗試解析 JSON 回應
    let parsedData
    try {
      // 提取 JSON 部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('無法找到有效的 JSON 格式')
      }
    } catch (parseError) {
      console.error('JSON 解析錯誤:', parseError)
      throw new Error('AI 回應格式不正確，請重試')
    }

    // 驗證解析結果
    if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
      throw new Error('解析結果格式不正確')
    }

    // 驗證每個原料
    const validatedIngredients = parsedData.ingredients.map((ingredient: any, index: number) => {
      if (!ingredient.materialName || typeof ingredient.unitContentMg !== 'number') {
        throw new Error(`第 ${index + 1} 個原料格式不正確`)
      }
      return {
        materialName: ingredient.materialName.trim(),
        unitContentMg: Math.max(0, ingredient.unitContentMg),
        originalText: ingredient.originalText || '',
        needsConfirmation: ingredient.needsConfirmation || false
      }
    })

    return NextResponse.json({
      success: true,
      ingredients: validatedIngredients,
      summary: parsedData.summary || '解析完成',
      confidence: parsedData.confidence || '中'
    })

  } catch (error) {
    console.error('配方解析錯誤:', error)
    return NextResponse.json(
      { error: '配方解析失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
