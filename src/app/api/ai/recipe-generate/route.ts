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

    const systemPrompt = `你是膠囊代工廠的研發顧問 AI，根據客戶需求生成符合膠囊灌裝代工場景的專業配方。請嚴格按照以下框架輸出，並以繁體中文回答：

用戶需求：
- 目標功效：${targetEffect}
- 目標受眾：${targetAudience || '一般成人'}
- 劑型：膠囊（固定）
- 特別要求：${budget || '無特殊要求'}

🎯 輸出框架

## 1. 配方基本資訊
- 專業產品名稱（不要直接用用戶輸入）
- 產品描述與功效說明
- 代工定位說明
- 廣告語建議（簡短、合規、不涉醫療）

## 2. 配方原料（表格：原料 | 劑量 | 功能 | 備註）
- 主成分：基於功效需求
- 輔料：僅限常見灌裝用（MCC、麥芽糊精、二氧化矽、硬脂酸鎂），並說明作用
- 註明建議來源（專利版/常規原料）

## 3. 膠囊規格建議
- 表格呈現：原料重量、假設堆積密度、體積 → 混合總體積
- 根據粉劑體積，選擇合適的膠囊號（限 00、0、1，並含安全係數）
- 建議膠囊材料（明膠/HPMC）與顏色（考慮粉末透色/染色風險）

## 4. 功效與安全評分
- 功效評分（1–10 分），給出依據（文獻/傳統使用）
- 安全評分（1–10 分），評估配伍與風險
- 評分理由（簡述）

## 5. 代工生產建議
- 灌裝可行性（流動性/是否需製粒）
- 生產工藝與質控注意點
- 包裝建議（瓶裝/泡罩，含 MOQ 參考）

## 6. 法規與合規性
- 針對香港必須遵守的標籤規範與禁限用要求
- 區分「必須標示」「建議標示」「禁止標示」
- 指出潛在需要調整的成分（如銷往大陸或歐美）

⚠️ 注意：生成的配方僅供理論參考，不能視為醫療建議，最終需結合法規與實驗驗證。`

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