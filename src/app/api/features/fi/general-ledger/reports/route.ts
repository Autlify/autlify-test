
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
      'fi.general_ledger.reports.export'
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
      // Dynamic import for server-side PDF generation
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      
      // Create PDF document
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Trial Balance', 14, 22)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Period: ${periodId ?? asOfDate ?? 'Current'}`, 14, 32)
      doc.text(`Currency: ${currency ?? 'Base Currency'}`, 14, 38)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44)
      
      // Table with autoTable
      autoTable(doc, {
        startY: 52,
        head: [['Account Code', 'Account Name', 'Type', 'Debit', 'Credit']],
        body: data.accounts.map((a: any) => [
          a.accountCode,
          a.accountName,
          a.accountType,
          a.debit.toFixed(2),
          a.credit.toFixed(2),
        ]),
        foot: [['', 'TOTAL', '', data.totals.debit.toFixed(2), data.totals.credit.toFixed(2)]],
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66], textColor: 255 },
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
        },
      })
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }
      
      // Output as buffer
      const pdfBuffer = doc.output('arraybuffer')
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="trial-balance-${periodId ?? asOfDate ?? 'report'}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}