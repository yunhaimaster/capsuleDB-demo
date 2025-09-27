import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 檢查環境變量是否存在（不顯示實際值）
    const hasApiKey = !!process.env.OPENROUTER_API_KEY
    const hasApiUrl = !!process.env.OPENROUTER_API_URL
    const apiKeyLength = process.env.OPENROUTER_API_KEY?.length || 0
    const apiKeyPrefix = process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'N/A'
    
    return NextResponse.json({ 
      success: true,
      hasApiKey,
      hasApiUrl,
      apiKeyLength,
      apiKeyPrefix: apiKeyPrefix + '...',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Environment check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
