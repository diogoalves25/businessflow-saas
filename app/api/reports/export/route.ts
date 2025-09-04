import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import { parse } from 'json2csv';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'pl';
    const format = searchParams.get('format') || 'pdf';
    const period = searchParams.get('period') || 'current_month';
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { businessName: true, businessType: true }
    });

    if (type === 'pl' && format === 'pdf') {
      // Generate P&L PDF
      const plResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/reports/pl-statement?period=${period}&year=${year}`,
        {
          headers: {
            Cookie: request.headers.get('cookie') || ''
          }
        }
      );
      const plData = await plResponse.json();

      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // PDF Content
      doc.fontSize(24).text('Profit & Loss Statement', { align: 'center' });
      doc.fontSize(16).text(organization?.businessName || '', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${plData.period}`, { align: 'center' });
      doc.moveDown(2);

      // Revenue Section
      doc.fontSize(14).font('Helvetica-Bold').text('Revenue');
      doc.fontSize(12).font('Helvetica');
      doc.text(`Service Revenue: $${plData.revenue.services.toLocaleString()}`, { indent: 20 });
      doc.text(`Add-on Services: $${plData.revenue.addOns.toLocaleString()}`, { indent: 20 });
      doc.text(`Tips: $${plData.revenue.tips.toLocaleString()}`, { indent: 20 });
      doc.text(`Other Income: $${plData.revenue.other.toLocaleString()}`, { indent: 20 });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Total Revenue: $${plData.revenue.total.toLocaleString()}`, { indent: 20 });
      doc.moveDown(2);

      // Expenses Section
      doc.fontSize(14).text('Operating Expenses');
      doc.fontSize(12).font('Helvetica');
      Object.entries(plData.expenses.categories).forEach(([category, amount]) => {
        doc.text(`${category}: $${(amount as number).toLocaleString()}`, { indent: 20 });
      });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Total Expenses: $${plData.expenses.total.toLocaleString()}`, { indent: 20 });
      doc.moveDown(2);

      // Net Profit
      doc.fontSize(16).text('Net Profit', { align: 'center' });
      doc.fontSize(20).text(`$${plData.netProfit.toLocaleString()}`, { align: 'center' });
      doc.fontSize(14).text(`Profit Margin: ${plData.profitMargin}%`, { align: 'center' });

      doc.end();

      const pdfBuffer = Buffer.concat(chunks);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pl-statement-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
    } else if (type === 'tax' && format === 'pdf') {
      // Generate Tax Summary PDF
      const taxResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/reports/tax-summary?year=${year}`,
        {
          headers: {
            Cookie: request.headers.get('cookie') || ''
          }
        }
      );
      const taxData = await taxResponse.json();

      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // PDF Content
      doc.fontSize(24).text('Tax Summary Report', { align: 'center' });
      doc.fontSize(16).text(organization?.businessName || '', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Tax Year: ${year}`, { align: 'center' });
      doc.moveDown(2);

      // Income Summary
      doc.fontSize(14).font('Helvetica-Bold').text('Income Summary');
      doc.fontSize(12).font('Helvetica');
      doc.text(`Total Revenue: $${taxData.totalRevenue.toLocaleString()}`, { indent: 20 });
      doc.text(`Deductible Expenses: -$${taxData.deductibleExpenses.toLocaleString()}`, { indent: 20 });
      doc.text(`Non-Deductible Expenses: -$${taxData.nonDeductibleExpenses.toLocaleString()}`, { indent: 20 });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Taxable Income: $${taxData.taxableIncome.toLocaleString()}`, { indent: 20 });
      doc.moveDown(2);

      // Tax Calculation
      doc.fontSize(14).text('Estimated Tax');
      doc.fontSize(16).text(`$${taxData.estimatedTax.toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      // Quarterly Payments
      doc.fontSize(14).text('Quarterly Tax Payments');
      doc.fontSize(12).font('Helvetica');
      Object.entries(taxData.quarterlyPayments).forEach(([quarter, amount]) => {
        doc.text(`${quarter}: $${(amount as number).toLocaleString()}`, { indent: 20 });
      });

      doc.moveDown(2);
      doc.fontSize(10).text(
        'Note: This is an estimated tax calculation. Please consult with a tax professional for accurate tax planning.',
        { align: 'center', width: 400 }
      );

      doc.end();

      const pdfBuffer = Buffer.concat(chunks);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tax-summary-${year}.pdf"`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid export type or format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json({ error: 'Failed to export report' }, { status: 500 });
  }
}