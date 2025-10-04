import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { worklogFiltersSchema } from '@/lib/validations'
import { formatISO } from 'date-fns'

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

