
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { db } from '@/lib/db'
import { generateTrialBalance } from '@/lib/features/fi/general-ledger/actions/reports'
 

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get session context
    const dbSession = await db.session.findFirst({
      where: { userId: session.user.id },
      select: { activeAgencyId: true },
    })

    if (!dbSession?.activeAgencyId) {
      return NextResponse.json({ error: 'No active agency' }, { status: 400 })
    }

    const hasPermission = await hasAgencyPermission(
      dbSession.activeAgencyId,
      'fi.general-ledger.reports.export'
    )
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') ?? 'csv'
    const periodId = searchParams.get('periodId')
    const asOfDate = searchParams.get('asOfDate')
    const currency = searchParams.get('currency')
    const includeZeroBalances = searchParams.get('includeZeroBalances') === 'true'

    // Get report data
    const reportResult = periodId
      ? await generateTrialBalance(periodId)
      : asOfDate
        ? await generateTrialBalance(asOfDate)
        : currency
            ? await generateTrialBalance(periodId ? periodId : asOfDate!, { includeZeroBalances: includeZeroBalances ? true : false, currency })
            : null

    if (!reportResult?.success || !reportResult.data) {
      return NextResponse.json(
        { error: reportResult?.error ?? 'Failed to generate report' },
        { status: 400 }
      )
    }

    const data = reportResult.data

    // Generate export based on format
    if (format === 'csv') {
      const headers = ['Account Code', 'Account Name', 'Type', 'Debit', 'Credit']
      const rows = data.accounts.map((a: any) =>
        [
          a.accountCode,
          `"${a.accountName}"`,
          a.accountType,
          a.debit.toFixed(2),
          a.credit.toFixed(2),
        ].join(',')
      )
      rows.push(['', 'TOTAL', '', data.totals.debit.toFixed(2), data.totals.credit.toFixed(2)].join(','))

      const csv = [headers.join(','), ...rows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="trial-balance-${periodId ?? asOfDate}.csv"`,
        },
      })
    }

    if (format === 'xlsx') {
      // For Excel, we'd typically use a library like exceljs
      // Simplified JSON response for now
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="trial-balance-${periodId ?? asOfDate}.json"`,
        },
      })
    }

    if (format === 'pdf') {
      // For PDF, we'd typically use a library like pdfkit or puppeteer
      // Return error for now
      return NextResponse.json(
        { error: 'PDF export not yet implemented' },
        { status: 501 }
      )
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}