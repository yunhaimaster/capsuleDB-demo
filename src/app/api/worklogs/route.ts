import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { worklogFiltersSchema } from '@/lib/validations'
import { formatISO } from 'date-fns'
import { generateCSV } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const filters = {
      orderKeyword: searchParams.get('orderKeyword') || undefined,
      notesKeyword: searchParams.get('notesKeyword') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '25', 10),
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    }

    const validatedFilters = worklogFiltersSchema.parse(filters)

    const where: any = {}

    if (validatedFilters.orderKeyword) {
      where.OR = [
        {
          order: {
            customerName: {
              contains: validatedFilters.orderKeyword,
              mode: 'insensitive'
            }
          }
        },
        {
          order: {
            productName: {
              contains: validatedFilters.orderKeyword,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    if (validatedFilters.notesKeyword) {
      where.notes = {
        contains: validatedFilters.notesKeyword,
        mode: 'insensitive'
      }
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.workDate = {}

      if (validatedFilters.dateFrom) {
        where.workDate.gte = new Date(
          validatedFilters.dateFrom.getFullYear(),
          validatedFilters.dateFrom.getMonth(),
          validatedFilters.dateFrom.getDate()
        )
      }

      if (validatedFilters.dateTo) {
        where.workDate.lte = new Date(
          validatedFilters.dateTo.getFullYear(),
          validatedFilters.dateTo.getMonth(),
          validatedFilters.dateTo.getDate(),
          23,
          59,
          59,
          999
        )
      }
    }

    const page = validatedFilters.page
    const limit = validatedFilters.limit
    const skip = (page - 1) * limit

    const [worklogs, total] = await Promise.all([
      prisma.orderWorklog.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              customerName: true,
              productName: true,
              createdAt: true
            }
          }
        },
        orderBy: [
          { workDate: validatedFilters.sortOrder },
          { startTime: validatedFilters.sortOrder }
        ],
        skip,
        take: limit
      }),
      prisma.orderWorklog.count({ where })
    ])

    const serializedWorklogs = worklogs.map((worklog) => ({
      ...worklog,
      workDate: formatISO(worklog.workDate),
      createdAt: formatISO(worklog.createdAt),
      updatedAt: formatISO(worklog.updatedAt)
    }))

    return NextResponse.json({
      worklogs: serializedWorklogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('載入工時紀錄錯誤:', error)
    return NextResponse.json({ error: '載入工時紀錄失敗' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, filters } = body as {
      format: 'csv'
      filters?: {
        orderKeyword?: string
        notesKeyword?: string
        dateFrom?: string
        dateTo?: string
        sortOrder?: 'asc' | 'desc'
      }
    }

    if (format !== 'csv') {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

    const parsedFilters = worklogFiltersSchema.parse({
      orderKeyword: filters?.orderKeyword,
      notesKeyword: filters?.notesKeyword,
      dateFrom: filters?.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters?.dateTo ? new Date(filters.dateTo) : undefined,
      sortOrder: filters?.sortOrder ?? 'desc'
    })

    const where: any = {}

    if (parsedFilters.orderKeyword) {
      where.OR = [
        {
          order: {
            customerName: {
              contains: parsedFilters.orderKeyword,
              mode: 'insensitive'
            }
          }
        },
        {
          order: {
            productName: {
              contains: parsedFilters.orderKeyword,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    if (parsedFilters.notesKeyword) {
      where.notes = {
        contains: parsedFilters.notesKeyword,
        mode: 'insensitive'
      }
    }

    if (parsedFilters.dateFrom || parsedFilters.dateTo) {
      where.workDate = {}

      if (parsedFilters.dateFrom) {
        where.workDate.gte = new Date(
          parsedFilters.dateFrom.getFullYear(),
          parsedFilters.dateFrom.getMonth(),
          parsedFilters.dateFrom.getDate()
        )
      }

      if (parsedFilters.dateTo) {
        where.workDate.lte = new Date(
          parsedFilters.dateTo.getFullYear(),
          parsedFilters.dateTo.getMonth(),
          parsedFilters.dateTo.getDate(),
          23,
          59,
          59,
          999
        )
      }
    }

    const worklogs = await prisma.orderWorklog.findMany({
      where,
      include: {
        order: {
          select: {
            customerName: true,
            productName: true
          }
        }
      },
      orderBy: [
        { workDate: parsedFilters.sortOrder },
        { startTime: parsedFilters.sortOrder }
      ]
    })

    const headers = [
      '工時日期',
      '訂單客戶',
      '訂單品項',
      '開始時間',
      '結束時間',
      '人數',
      '有效工時',
      '計算工時',
      '備註'
    ]

    const csvData = worklogs.map((worklog) => [
      formatISO(worklog.workDate, { representation: 'date' }),
      worklog.order?.customerName ?? '',
      worklog.order?.productName ?? '',
      worklog.startTime,
      worklog.endTime,
      worklog.headcount.toString(),
      (worklog.effectiveMinutes / 60).toFixed(1),
      worklog.calculatedWorkUnits.toFixed(1),
      worklog.notes ? worklog.notes.replace(/\r?\n/g, ' ') : ''
    ])

    const csvContent = '\uFEFF' + generateCSV(csvData, headers)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="worklogs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('匯出工時錯誤:', error)
    return NextResponse.json({ error: '匯出工時失敗' }, { status: 500 })
  }
}

