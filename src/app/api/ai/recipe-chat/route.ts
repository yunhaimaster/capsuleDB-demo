import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    // 構建系統提示，包含當前配方上下文
    let systemPrompt = `你是一個專業的膠囊配方優化 AI 助手。用戶已經生成了一個配方，現在希望進一步優化和修改。

請記住以下重要原則：
1. 你是一個專業的保健品配方專家
2. 熟悉香港和國際的保健品法規要求
3. 了解各種原料的功效、安全性和相互作用
4. 能夠提供科學依據的建議
5. 重視配方的安全性和有效性平衡

當前配方上下文：
${context?.currentRecipe ? `配方名稱：${context.currentRecipe.name || '未命名'}
目標功效：${context?.originalRequest?.targetEffect || '未指定'}
目標受眾：${context?.originalRequest?.targetAudience || '一般成人'}
劑型：${context?.originalRequest?.dosageForm || '膠囊'}` : '無當前配方'}

請根據用戶的需求，提供專業的配方優化建議。你可以：
- 調整原料劑量
- 添加或移除成分
- 針對特定人群優化
- 降低成本建議
- 提高安全性
- 解釋配方的科學原理
- 提供服用建議和注意事項

請使用香港書面語繁體中文回答，確保內容專業、準確且實用。`

    // 轉換消息格式
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health AI Recipe Chat'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: apiMessages,
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API 錯誤:', errorText)
      return NextResponse.json(
        { success: false, error: 'AI 服務暫時無法回應，請稍後再試' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || '抱歉，我暫時無法回應。'

    return NextResponse.json({
      success: true,
      message: aiResponse
    })

  } catch (error) {
    console.error('AI 聊天錯誤:', error)
    return NextResponse.json(
      { success: false, error: '聊天服務暫時無法使用，請稍後再試' },
      { status: 500 }
    )
  }
}
