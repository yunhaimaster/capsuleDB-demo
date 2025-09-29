import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetEffect, targetAudience, dosageForm, budget, enableReasoning } = body

    // 驗證輸入
    if (!targetEffect) {
      return NextResponse.json(
        { error: '目標功效不能為空' },
        { status: 400 }
      )
    }

    // 構建 AI 提示詞
    const systemPrompt = `你是一位專業的膠囊配方專家，具有豐富的保健品研發經驗。請根據以下要求生成專業的膠囊配方：

**要求：**
- 目標功效：${targetEffect}
- 目標受眾：${targetAudience || '一般成人'}
- 劑型：${dosageForm || '膠囊'}
- 預算限制：${budget || '無特殊限制'}

**請以香港書面語繁體中文回答，並按照以下格式提供配方：**

## 配方名稱
[簡潔的配方名稱]

## 目標功效
[詳細說明此配方的主要功效]

## 原料配方（每粒規格）
| 原料名稱 | 單粒含量(mg) | 功效說明 |
|---------|-------------|----------|
| [原料1] | [劑量] | [功效說明] |
| [原料2] | [劑量] | [功效說明] |

## 劑量建議
- 成人：每日 [X] 粒，餐後服用
- 建議服用時間：[具體時間]

## 安全性評估
- 安全性評分：X/10
- 注意事項：[重要安全提醒]
- 禁忌症：[如有]

## 成本分析
- 預估單粒成本：HK$ X.XX
- 主要成本構成：[分析]

## 科學依據
[簡要說明配方的科學基礎]

請確保所有建議都符合香港相關法規要求，並提供實用的專業建議。`

    // 調用 OpenRouter API
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'EasyPack v2.0 AI Recipe Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `請為我生成一個${targetEffect}的膠囊配方。`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        ...(enableReasoning && { reasoning: { effort: 'high' } })
      })
    })

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text()
      console.error('OpenRouter API 錯誤:', errorData)
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    const aiResponse = await openrouterResponse.json()
    const recipeContent = aiResponse.choices[0]?.message?.content

    if (!recipeContent) {
      return NextResponse.json(
        { error: 'AI 回應格式錯誤' },
        { status: 500 }
      )
    }

    // 解析 AI 回應並提取結構化數據
    const parsedRecipe = parseAIRecipeResponse(recipeContent)

    // 保存到數據庫
    const savedRecipe = await prisma.aIRecipe.create({
      data: {
        name: parsedRecipe.name || `AI生成配方-${Date.now()}`,
        description: parsedRecipe.description,
        targetEffect,
        targetAudience: targetAudience || '一般成人',
        dosageForm: dosageForm || 'capsule',
        ingredients: JSON.stringify(parsedRecipe.ingredients || []),
        dosage: JSON.stringify(parsedRecipe.dosage || {}),
        efficacyScore: parsedRecipe.efficacyScore,
        safetyScore: parsedRecipe.safetyScore,
        costAnalysis: parsedRecipe.costAnalysis ? JSON.stringify(parsedRecipe.costAnalysis) : null,
        regulatoryStatus: 'pending_review'
      }
    })

    return NextResponse.json({
      success: true,
      recipe: {
        id: savedRecipe.id,
        content: recipeContent,
        structured: parsedRecipe,
        createdAt: savedRecipe.createdAt
      }
    })

  } catch (error) {
    console.error('配方生成錯誤:', error)
    return NextResponse.json(
      { error: '配方生成失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

// 解析 AI 回應的輔助函數
function parseAIRecipeResponse(content: string) {
  const recipe = {
    name: '',
    description: '',
    ingredients: [] as any[],
    dosage: {} as any,
    efficacyScore: null as number | null,
    safetyScore: null as number | null,
    costAnalysis: null as any
  }

  try {
    // 提取配方名稱
    const nameMatch = content.match(/## 配方名稱\s*\n([^\n]+)/)
    if (nameMatch) {
      recipe.name = nameMatch[1].trim()
    }

    // 提取目標功效
    const effectMatch = content.match(/## 目標功效\s*\n([^#]+)/)
    if (effectMatch) {
      recipe.description = effectMatch[1].trim()
    }

    // 提取原料配方
    const ingredientSection = content.match(/## 原料配方[\s\S]+?(?=##|$)/)
    if (ingredientSection) {
      const lines = ingredientSection[0].split('\n')
      for (const line of lines) {
        if (line.includes('|') && !line.includes('原料名稱')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p)
          if (parts.length >= 3) {
            recipe.ingredients.push({
              name: parts[0],
              dosage: parts[1],
              description: parts[2]
            })
          }
        }
      }
    }

    // 提取劑量建議
    const dosageMatch = content.match(/## 劑量建議\s*\n([^#]+)/)
    if (dosageMatch) {
      recipe.dosage = { recommendation: dosageMatch[1].trim() }
    }

    // 提取安全性評分
    const safetyMatch = content.match(/安全性評分：(\d+(?:\.\d+)?)/)
    if (safetyMatch) {
      recipe.safetyScore = parseFloat(safetyMatch[1])
    }

    // 提取成本分析
    const costMatch = content.match(/預估單粒成本：HK\$ ([\d.]+)/)
    if (costMatch) {
      recipe.costAnalysis = {
        unitCost: parseFloat(costMatch[1]),
        currency: 'HKD'
      }
    }

  } catch (error) {
    console.error('解析 AI 回應時出錯:', error)
  }

  return recipe
}
