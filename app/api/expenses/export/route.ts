import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'json2csv';
import PDFDocument from 'pdfkit';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format') || 'csv';

    const where: any = {
      organizationId: session.user.organizationId
    };

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { businessName: true }
    });

    if (format === 'csv') {
      const fields = ['date', 'category', 'description', 'vendor', 'amount', 'taxDeductible', 'recurring', 'notes'];
      const csv = parse(expenses.map(expense => ({
        date: expense.date.toISOString().split('T')[0],
        category: expense.category,
        description: expense.description,
        vendor: expense.vendor || '',
        amount: expense.amount,
        taxDeductible: expense.taxDeductible ? 'Yes' : 'No',
        recurring: expense.recurring ? 'Yes' : 'No',
        notes: expense.notes || ''
      })), { fields });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'pdf') {
      // Create PDF
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        });
      });

      // PDF Header
      doc.fontSize(20).text('Expense Report', { align: 'center' });
      doc.fontSize(14).text(organization?.businessName || '', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${from ? new Date(from).toLocaleDateString() : 'All time'} - ${to ? new Date(to).toLocaleDateString() : 'Present'}`, { align: 'center' });
      doc.moveDown(2);

      // Table Headers
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 120;
      const col3 = 250;
      const col4 = 380;
      const col5 = 480;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Date', col1, tableTop);
      doc.text('Category', col2, tableTop);
      doc.text('Description', col3, tableTop);
      doc.text('Vendor', col4, tableTop);
      doc.text('Amount', col5, tableTop);

      doc.font('Helvetica');
      let y = tableTop + 20;

      // Table Data
      let totalAmount = 0;
      expenses.forEach((expense, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(expense.date.toLocaleDateString(), col1, y);
        doc.text(expense.category, col2, y);
        doc.text(expense.description.substring(0, 20) + '...', col3, y);
        doc.text(expense.vendor?.substring(0, 15) || '-', col4, y);
        doc.text(`$${expense.amount.toFixed(2)}`, col5, y);

        totalAmount += expense.amount;
        y += 20;
      });

      // Total
      doc.moveDown(2);
      doc.font('Helvetica-Bold');
      doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, { align: 'right' });

      doc.end();
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting expenses:', error);
    return NextResponse.json({ error: 'Failed to export expenses' }, { status: 500 });
  }
}