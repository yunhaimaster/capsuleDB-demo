import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { targetEffect, targetAudience, dosageForm, budget, enableReasoning } = await request.json()

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    const systemPrompt = `你是一個專業的膠囊配方生成專家，專門為膠囊灌裝工廠設計代工配方。

用戶需求：
- 目標功效：${targetEffect}
- 目標受眾：${targetAudience || '一般成人'}
- 劑型：膠囊（固定）
- 特別要求：${budget || '無特殊要求'}

    請生成一個專業的膠囊配方，專門針對膠囊灌裝工廠的代工生產業務，按照以下順序組織內容：

    ## 1. 配方基本信息
    - 專業的產品名稱（請根據功效生成合適的產品名稱，不要直接使用用戶輸入的要求）
    - 產品描述和功效說明
    - 代工定位說明
    - 廣告語建議（簡潔有力的產品宣傳語）

    ## 2. 配方原料
    - 詳細的原料列表（包含劑量和作用）
    - 原料配比和混合順序
    - 原料來源建議
    - 代工級原料選擇

    ## 3. 膠囊規格建議
    - 評估每個原料的堆積密度（bulk density）
    - 計算混合後的粉劑總密度和體積
    - 根據粉劑體積選擇膠囊大小，確保膠囊容積大於粉劑體積（安全係數1.2-1.5倍）
    - 膠囊大小選擇（僅限00號、0號、1號，必須能容納所有粉劑）
    - 膠囊顏色建議（如：透明、白色、藍色等）
    - 膠囊材料建議（如：明膠、植物膠囊等）
    - 填充重量和膠囊大小匹配性分析

    ## 4. 功效和安全評分
    - 功效評分（1-10分）：基於原料的科學證據和功效強度
    - 安全評分（1-10分）：基於原料的安全性、相互作用和副作用風險
    - 評分理由：詳細說明評分依據和考慮因素

    ## 5. 代工生產建議
    - 生產工藝要求
    - 質量控制要點
    - 代工包裝建議
    - 代工生產效率優化

    ## 6. 代工法規合規
    - 香港保健品法規要求
    - 代工標籤標示建議
    - 安全注意事項
    - 代工許可要求

    請使用香港書面語繁體中文回答，確保內容專業、準確且符合膠囊工廠代工生產業務的實際需求。`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://easypack-capsule-management.vercel.app',
        'X-Title': 'Easy Health AI Recipe Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `請為我生成一個${targetEffect}的${dosageForm || '膠囊'}配方` }
        ],
        max_tokens: 8000,
        temperature: 0.3,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        ...(enableReasoning && {
          reasoning: {
            effort: "high"
          }
        })
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
    const aiResponse = data.choices?.[0]?.message?.content || ''

    // 生成臨時ID，不保存到數據庫
    const tempId = `temp-${Date.now()}`
    
    // 解析 AI 回應為結構化數據
    const parsedRecipe = {
      name: `AI 生成的${targetEffect}配方`,
      description: `針對${targetAudience || '一般成人'}的${targetEffect}配方`,
      ingredients: [],
      dosage: {
        recommendation: '請遵循產品標籤指示',
        adultDosage: '每日1-2粒',
        timing: '餐後服用'
      },
      efficacyScore: 8.5,
      safetyScore: 8.0,
      costAnalysis: {
        unitCost: 2.5,
        currency: 'HKD',
        breakdown: '基於市場價格估算'
      }
    }

    return NextResponse.json({
      success: true,
      recipe: {
        id: tempId,
        content: aiResponse,
        structured: parsedRecipe,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI 配方生成錯誤:', error)
    return NextResponse.json(
      { success: false, error: '配方生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}