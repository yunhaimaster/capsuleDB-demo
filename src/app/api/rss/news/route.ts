import { NextRequest, NextResponse } from 'next/server'
import { RSS_SOURCES } from '@/data/rss-sources'
import { XMLParser } from 'fast-xml-parser'

interface NormalizedItem {
  id: string
  title: string
  link: string
  publishedAt: string | null
  sourceId: string
  sourceTitle: string
  description?: string
}

const CACHE_SECONDS = 600 // 10 minutes

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const feedParam = searchParams.get('feeds')
    const limitParam = searchParams.get('limit')

    const selectedIds = feedParam
      ? feedParam.split(',').map((id) => id.trim()).filter(Boolean)
      : RSS_SOURCES.map((source) => source.id)

    const limit = limitParam ? Math.min(Number(limitParam), 60) : 40

    const sources = RSS_SOURCES.filter((source) => selectedIds.includes(source.id))

    if (sources.length === 0) {
      return NextResponse.json({ items: [], feeds: [] }, { status: 200 })
    }

    const feedResponses = await Promise.allSettled(
      sources.map(async (source) => {
        const response = await fetch(source.url, {
          next: { revalidate: CACHE_SECONDS }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch RSS: ${source.url}`)
        }

        const text = await response.text()
        return { source, text }
      })
    )

    const items: NormalizedItem[] = []
    const activeSources: string[] = []

    for (const result of feedResponses) {
      if (result.status === 'fulfilled') {
        const { source, text } = result.value
        activeSources.push(source.id)

        const parsed = parseRss(text)
        parsed.forEach((entry) => {
          items.push({
            id: `${source.id}-${entry.link}`,
            title: entry.title,
            link: entry.link,
            description: entry.description,
            publishedAt: entry.publishedAt,
            sourceId: source.id,
            sourceTitle: source.title
          })
        })
      }
    }

    const sorted = items
      .sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, limit)

    return NextResponse.json(
      {
        items: sorted,
        feeds: sources.filter((source) => activeSources.includes(source.id))
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_SECONDS}`
        }
      }
    )
  } catch (error) {
    console.error('RSS fetch error:', error)
    return NextResponse.json(
      { error: '載入 RSS 資料失敗，請稍後再試。' },
      { status: 500 }
    )
  }
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  parseNodeValue: true,
  trimValues: true
})

function parseRss(xml: string): Array<{ title: string; link: string; publishedAt: string | null; description?: string }> {
  const parsed = xmlParser.parse(xml)
  const channel = parsed?.rss?.channel || parsed?.feed

  if (!channel) return []

  const entries = channel.item || channel.entry || []
  const entriesArray = Array.isArray(entries) ? entries : [entries]

  return entriesArray
    .map((entry) => {
      const title = entry?.title?.text || entry?.title || '未命名文章'
      const link =
        (typeof entry?.link === 'string' ? entry.link : entry?.link?.href) ||
        entry?.link?.text ||
        ''
      const pubDateText = entry?.pubDate || entry?.published || entry?.updated || null
      const description =
        typeof entry?.description === 'string' ? entry.description : entry?.summary || undefined

      let publishedAt: string | null = null
      if (pubDateText) {
        const parsedDate = new Date(pubDateText)
        if (!Number.isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString()
        }
      }

      if (title && link) {
        return { title, link, publishedAt, description }
      }

      return null
    })
    .filter((item): item is { title: string; link: string; publishedAt: string | null; description?: string } => Boolean(item))
}

