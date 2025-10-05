import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { jsonSuccess, jsonError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

const worklogFilterSchema = z.object({
  orderKeyword: z.string().optional(),
  notesKeyword: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const filters = worklogFilterSchema.parse(params)

    const where: any = {}

    if (filters.orderKeyword) {
      where.order = {
        OR: [
          { productName: { contains: filters.orderKeyword, mode: 'insensitive' } },
          { customerName: { contains: filters.orderKeyword, mode: 'insensitive' } },
        ],
      }
    }

    if (filters.notesKeyword) {
      where.notes = {
        contains: filters.notesKeyword,
        mode: 'insensitive',
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.workDate = {}
      if (filters.dateFrom) {
        where.workDate.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.workDate.lte = new Date(filters.dateTo)
      }
    }

    const skip = (filters.page - 1) * filters.limit

    const [worklogs, total] = await Promise.all([
      prisma.orderWorklog.findMany({
        where,
        orderBy: { workDate: filters.sortOrder },
        include: {
          order: {
            select: {
              id: true,
              productName: true,
              customerName: true,
            },
          },
        },
        skip,
        take: filters.limit,
      }),
      prisma.orderWorklog.count({ where }),
    ])

    return jsonSuccess({
      worklogs: worklogs.map((log) => ({
        ...log,
        workDate: log.workDate.toISOString().split('T')[0],
        createdAt: log.createdAt.toISOString(),
        updatedAt: log.updatedAt.toISOString(),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    logger.error('載入工時紀錄錯誤', {
      error: error instanceof Error ? error.message : String(error),
    })

    return jsonError(500, {
      code: 'WORKLOG_FETCH_FAILED',
      message: '載入工時紀錄失敗',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

const exportSchema = z.object({
  format: z.enum(['csv', 'pdf']).default('csv'),
  filters: worklogFilterSchema.partial().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, filters } = exportSchema.parse(body)

    const where: any = {}

    if (filters?.orderKeyword) {
      where.order = {
        OR: [
          { productName: { contains: filters.orderKeyword, mode: 'insensitive' } },
          { customerName: { contains: filters.orderKeyword, mode: 'insensitive' } },
        ],
      }
    }

    if (filters?.notesKeyword) {
      where.notes = {
        contains: filters.notesKeyword,
        mode: 'insensitive',
      }
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.workDate = {}
      if (filters.dateFrom) {
        where.workDate.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.workDate.lte = new Date(filters.dateTo)
      }
    }

    const worklogs = await prisma.orderWorklog.findMany({
      where,
      orderBy: { workDate: filters?.sortOrder || 'desc' },
      include: {
        order: {
          select: {
            productName: true,
            customerName: true,
          },
        },
      },
    })

    if (format === 'csv') {
      const headers = new Headers({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="worklogs-${Date.now()}.csv"`,
      })

      const csvRows = [
        ['日期', '訂單', '客戶', '開始', '結束', '人數', '工時', '備註'],
        ...worklogs.map((log) => [
          log.workDate.toISOString().split('T')[0],
          log.order?.productName || '-',
          log.order?.customerName || '-',
          log.startTime,
          log.endTime,
          log.headcount,
          log.calculatedWorkUnits ?? '-',
          log.notes || '',
        ]),
      ]

      const csvContent = csvRows.map((row) => row.join(',')).join('\n')
      return new Response(csvContent, { headers })
    }

    return jsonError(400, {
      code: 'WORKLOG_EXPORT_UNSUPPORTED',
      message: '目前僅支援匯出 CSV 格式',
    })
  } catch (error) {
    logger.error('匯出工時錯誤', {
      error: error instanceof Error ? error.message : String(error),
    })

    return jsonError(500, {
      code: 'WORKLOG_EXPORT_FAILED',
      message: '匯出工時失敗',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

