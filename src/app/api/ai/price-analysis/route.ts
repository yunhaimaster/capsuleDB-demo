import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { materialName, analysisType, enableReasoning } = body

    // 驗證輸入
    if (!materialName) {
      return NextResponse.json(
        { error: '原料名稱不能為空' },
        { status: 400 }
      )
    }

    // 查詢現有價格數據
    const priceData = await prisma.ingredientPrice.findMany({
      where: {
        materialName: {
          contains: materialName
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // 構建 AI 提示詞
    const systemPrompt = `你是一位專業的原料價格分析師，具有豐富的保健品原料市場經驗。請根據以下信息進行專業的價格分析：

**分析對象：**
- 原料名稱：${materialName}
- 分析類型：${analysisType || '綜合分析'}

**現有價格數據：**
${priceData.length > 0 ? priceData.map(p => 
  `- 供應商：${p.supplier}，價格：HK$${p.price}/${p.unit}，質量等級：${p.quality}，有效期：${p.validFrom.toISOString().split('T')[0]}`
).join('\n') : '暫無歷史價格數據'}

**請以香港書面語繁體中文回答，並按照以下格式提供分析：**

## 價格分析報告

### 市場概況
[分析當前市場狀況和價格趨勢]

### 價格範圍分析
| 價格等級 | 價格範圍 | 供應商類型 | 質量水平 |
|---------|----------|------------|----------|
| 高端 | HK$ X.XX - X.XX | [供應商類型] | [質量描述] |
| 中端 | HK$ X.XX - X.XX | [供應商類型] | [質量描述] |
| 低端 | HK$ X.XX - X.XX | [供應商類型] | [質量描述] |

### 供應商建議
[推薦供應商和選擇建議]

### 採購建議
- **最佳採購時機**：[建議]
- **採購策略**：[策略建議]
- **風險評估**：[風險分析]

### 價格預測
[基於市場趨勢的價格預測]

請提供實用且專業的建議。`

    // 調用 OpenRouter API
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'EasyPack v2.0 Price Analysis'
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
            content: `請為我分析${materialName}的價格情況。`
          }
        ],
        max_tokens: 3000,
        temperature: 0.6,
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
    const analysisContent = aiResponse.choices[0]?.message?.content

    if (!analysisContent) {
      return NextResponse.json(
        { error: 'AI 回應格式錯誤' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: {
        materialName,
        content: analysisContent,
        priceData: priceData,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('價格分析錯誤:', error)
    return NextResponse.json(
      { error: '價格分析失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialName = searchParams.get('materialName')

    if (!materialName) {
      return NextResponse.json(
        { error: '原料名稱參數不能為空' },
        { status: 400 }
      )
    }

    // 查詢價格數據
    const priceData = await prisma.ingredientPrice.findMany({
      where: {
        materialName: {
          contains: materialName
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 計算統計數據
    const prices = priceData.map(p => p.price)
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    return NextResponse.json({
      success: true,
      data: {
        materialName,
        priceData,
        statistics: {
          count: priceData.length,
          averagePrice: avgPrice,
          minPrice,
          maxPrice,
          priceRange: maxPrice - minPrice
        }
      }
    })

  } catch (error) {
    console.error('獲取價格數據錯誤:', error)
    return NextResponse.json(
      { error: '獲取價格數據失敗' },
      { status: 500 }
    )
  }
}
