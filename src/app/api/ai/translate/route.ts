import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '請提供要翻譯的文字' },
        { status: 400 }
      )
    }

    // 從環境變數獲取 API 配置
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API 密鑰未配置')
      return NextResponse.json(
        { error: '翻譯服務暫時無法使用，請聯繫 Victor' },
        { status: 500 }
      )
    }

    // 構建翻譯提示詞
    const systemPrompt = `你是一個專業的中文翻譯助手。請將簡體中文翻譯成繁體中文。

要求：
1. 保持原文的意思和語境
2. 使用正確的繁體中文字符
3. 保持專業術語的準確性
4. 如果輸入已經是繁體中文，請直接返回原文
5. 只返回翻譯結果，不要添加任何解釋或標記

請翻譯以下文字：`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'EasyPack Translation Service'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API 錯誤:', errorText)
      throw new Error('翻譯服務暫時無法使用')
    }

    const data = await response.json()
    const translatedText = data.choices?.[0]?.message?.content?.trim()

    if (!translatedText) {
      throw new Error('翻譯結果為空')
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      translatedText: translatedText
    })

  } catch (error) {
    console.error('翻譯錯誤:', error)
    return NextResponse.json(
      { error: '翻譯失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
