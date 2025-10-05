import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const hasApiKey = !!process.env.OPENROUTER_API_KEY
    const hasApiUrl = !!process.env.OPENROUTER_API_URL
    const apiKeyLength = process.env.OPENROUTER_API_KEY?.length || 0
    const apiKeyPrefix = process.env.OPENROUTER_API_KEY?.substring(0, 4) || 'N/A'

    return NextResponse.json({
      success: true,
      hasApiKey,
      hasApiUrl,
      apiKeyLength,
      apiKeyPrefix: `${apiKeyPrefix}***`,
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    logger.error('Environment check error', {
      error: error instanceof Error ? error.message : String(error)
    })
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
