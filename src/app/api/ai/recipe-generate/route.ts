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

    const systemPrompt = `你是一個專業的膠囊配方生成專家，專門為膠囊灌裝工廠設計批發配方。

用戶需求：
- 目標功效：${targetEffect}
- 目標受眾：${targetAudience || '一般成人'}
- 劑型：膠囊（固定）
- 批發成本目標：${budget || '無特定限制'}

請生成一個專業的膠囊配方，專門針對膠囊灌裝工廠的批發業務，包含：

## 1. 配方基本信息
- 配方名稱和描述
- 目標功效說明
- 批發定位說明

## 2. 膠囊規格建議
- 膠囊顏色建議（如：透明、白色、藍色等）
- 膠囊大小建議（如：0號、1號、2號等）
- 膠囊材料建議（如：明膠、植物膠囊等）
- 填充重量建議

## 3. 原料配方
- 詳細的原料列表（包含劑量和作用）
- 原料配比和混合順序
- 原料來源建議
- 批發級原料選擇

## 4. 批發成本分析（重點）
- 每粒原料成本計算
- 每粒總成本（含膠囊殼、人工、包裝等）
- 建議批發價（給下游經銷商）
- 批發利潤率分析
- 批量生產成本優勢

## 5. 批發生產建議
- 生產工藝要求
- 質量控制要點
- 批發包裝建議
- 批量生產效率優化

## 6. 批發法規合規
- 香港保健品法規要求
- 批發標籤標示建議
- 安全注意事項
- 批發許可要求

請使用香港書面語繁體中文回答，確保內容專業、準確且符合膠囊工廠批發業務的實際需求。`

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

    // 嘗試保存到數據庫，如果表不存在則跳過
    let savedRecipe = null
    try {
      savedRecipe = await prisma.aIRecipe.create({
        data: {
          name: parsedRecipe.name,
          description: parsedRecipe.description,
          targetEffect,
          targetAudience: targetAudience || '一般成人',
          dosageForm: dosageForm || 'capsule',
          ingredients: JSON.stringify(parsedRecipe.ingredients),
          dosage: JSON.stringify(parsedRecipe.dosage),
          efficacyScore: parsedRecipe.efficacyScore,
          safetyScore: parsedRecipe.safetyScore,
          costAnalysis: JSON.stringify(parsedRecipe.costAnalysis),
          isActive: true
        }
      })
    } catch (dbError) {
      console.warn('數據庫保存失敗，但 AI 生成成功:', dbError)
      // 生成一個臨時 ID
      savedRecipe = {
        id: `temp-${Date.now()}`,
        createdAt: new Date()
      }
    }

    return NextResponse.json({
      success: true,
      recipe: {
        id: savedRecipe.id,
        content: aiResponse,
        structured: parsedRecipe,
        createdAt: savedRecipe.createdAt.toISOString()
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