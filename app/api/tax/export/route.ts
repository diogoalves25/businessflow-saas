import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfYear, endOfYear, format } from 'date-fns';
import JSZip from 'jszip';
import PDFDocument from 'pdfkit';
import { parse } from 'json2csv';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    // Fetch organization details
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { 
        businessName: true, 
        businessType: true,
        businessAddress: true,
        taxId: true,
      }
    });

    // Fetch all expenses for the year
    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: session.user.organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Fetch revenue data
    const bookings = await prisma.booking.aggregate({
      where: {
        organizationId: session.user.organizationId,
        status: 'completed',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        finalPrice: true,
      },
    });

    const totalRevenue = bookings._sum.finalPrice || 0;

    // Create ZIP file
    const zip = new JSZip();

    // 1. Add expense CSV
    const expenseFields = ['date', 'category', 'vendor', 'description', 'amount', 'taxDeductible'];
    const expenseData = expenses.map(expense => ({
      date: format(expense.date, 'yyyy-MM-dd'),
      category: expense.category,
      vendor: expense.vendor || '',
      description: expense.description,
      amount: expense.amount,
      taxDeductible: expense.taxDeductible ? 'Yes' : 'No',
    }));
    const expenseCSV = parse(expenseData, { fields: expenseFields });
    zip.file(`expenses-${year}.csv`, expenseCSV);

    // 2. Create P&L PDF
    const plDoc = new PDFDocument();
    const plChunks: Buffer[] = [];
    plDoc.on('data', (chunk) => plChunks.push(chunk));

    // P&L Content
    plDoc.fontSize(20).text('Profit & Loss Statement', { align: 'center' });
    plDoc.fontSize(16).text(organization?.businessName || '', { align: 'center' });
    plDoc.fontSize(12).text(`Tax Year ${year}`, { align: 'center' });
    plDoc.moveDown(2);

    // Revenue
    plDoc.fontSize(14).font('Helvetica-Bold').text('REVENUE');
    plDoc.fontSize(12).font('Helvetica');
    plDoc.text(`Service Revenue: $${totalRevenue.toLocaleString()}`, { indent: 20 });
    plDoc.moveDown();
    plDoc.font('Helvetica-Bold').text(`Total Revenue: $${totalRevenue.toLocaleString()}`, { indent: 20 });
    plDoc.moveDown(2);

    // Expenses by category
    plDoc.fontSize(14).font('Helvetica-Bold').text('EXPENSES');
    plDoc.fontSize(12).font('Helvetica');
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    let totalExpenses = 0;
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      plDoc.text(`${category}: $${amount.toLocaleString()}`, { indent: 20 });
      totalExpenses += amount;
    });
    
    plDoc.moveDown();
    plDoc.font('Helvetica-Bold').text(`Total Expenses: $${totalExpenses.toLocaleString()}`, { indent: 20 });
    plDoc.moveDown(2);

    // Net Income
    const netIncome = totalRevenue - totalExpenses;
    plDoc.fontSize(14).font('Helvetica-Bold').text('NET INCOME');
    plDoc.fontSize(16).text(`$${netIncome.toLocaleString()}`, { align: 'center' });

    plDoc.end();
    
    await new Promise<void>((resolve) => {
      plDoc.on('end', () => resolve());
    });
    
    const plPDF = Buffer.concat(plChunks);
    zip.file(`profit-loss-${year}.pdf`, plPDF);

    // 3. Create Schedule C worksheet
    const scheduleC = {
      line1_grossReceipts: totalRevenue,
      line2_returns: 0,
      line3_subtotal: totalRevenue,
      line4_costOfGoods: 0,
      line5_grossProfit: totalRevenue,
      line6_otherIncome: 0,
      line7_grossIncome: totalRevenue,
      expenses: {
        line8_advertising: expensesByCategory['Advertising'] || 0,
        line9_carAndTruck: expensesByCategory['Car/Travel'] || 0,
        line10_commissions: expensesByCategory['Contractors'] || 0,
        line11_contractLabor: expensesByCategory['Contractors'] || 0,
        line12_depletion: 0,
        line13_depreciation: expensesByCategory['Equipment'] || 0,
        line14_employeeBenefit: 0,
        line15_insurance: expensesByCategory['Insurance'] || 0,
        line16_interest: 0,
        line17_legal: expensesByCategory['Legal/Professional'] || 0,
        line18_officeExpense: expensesByCategory['Office Supplies'] || 0,
        line19_pension: 0,
        line20_rent: expensesByCategory['Rent'] || 0,
        line21_repairs: 0,
        line22_supplies: expensesByCategory['Supplies'] || 0,
        line23_taxes: 0,
        line24_travel: expensesByCategory['Car/Travel'] || 0,
        line25_utilities: expensesByCategory['Utilities'] || 0,
        line26_wages: expensesByCategory['Payroll'] || 0,
        line27_other: Object.entries(expensesByCategory)
          .filter(([cat]) => !['Advertising', 'Car/Travel', 'Contractors', 'Equipment', 'Insurance', 'Legal/Professional', 'Office Supplies', 'Rent', 'Supplies', 'Utilities', 'Payroll'].includes(cat))
          .reduce((sum, [_, amount]) => sum + amount, 0),
      },
      line28_totalExpenses: totalExpenses,
      line29_tentativeProfit: totalRevenue - totalExpenses,
      line30_homeOffice: 0,
      line31_netProfit: totalRevenue - totalExpenses,
    };

    const scheduleCJSON = JSON.stringify(scheduleC, null, 2);
    zip.file(`schedule-c-worksheet-${year}.json`, scheduleCJSON);

    // 4. Add receipts folder info
    const receiptsInfo = `Receipt Storage Information
========================

All receipts for tax year ${year} are stored digitally in the BusinessFlow system.

To access receipts:
1. Log in to your BusinessFlow account
2. Navigate to Admin > Expenses
3. Use the date filter to select year ${year}
4. Click on any expense to view or download the receipt

Total number of receipts: ${expenses.filter(e => e.receiptUrl).length}
Total expenses with receipts: $${expenses.filter(e => e.receiptUrl).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}

For IRS purposes, these digital receipts are valid documentation of business expenses.
`;
    zip.file('receipts-info.txt', receiptsInfo);

    // 5. Add tax summary
    const taxSummary = `TAX SUMMARY FOR ${year}
${organization?.businessName}
Tax ID: ${organization?.taxId || 'Not provided'}
Business Type: ${organization?.businessType}
${organization?.businessAddress || ''}

INCOME SUMMARY
==============
Gross Revenue: $${totalRevenue.toLocaleString()}
Total Expenses: $${totalExpenses.toLocaleString()}
Net Income: $${netIncome.toLocaleString()}

DEDUCTIBLE EXPENSES
==================
${Object.entries(expensesByCategory)
  .filter(([cat]) => expenses.some(e => e.category === cat && e.taxDeductible))
  .map(([cat, amount]) => `${cat}: $${amount.toLocaleString()}`)
  .join('\n')}

Total Deductible: $${expenses.filter(e => e.taxDeductible).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}

QUARTERLY ESTIMATES
==================
Q1: $${Math.round(netIncome * 0.153 / 4).toLocaleString()}
Q2: $${Math.round(netIncome * 0.153 / 4).toLocaleString()}
Q3: $${Math.round(netIncome * 0.153 / 4).toLocaleString()}
Q4: $${Math.round(netIncome * 0.153 / 4).toLocaleString()}

Note: These are estimates only. Consult with a tax professional for accurate calculations.
`;
    zip.file(`tax-summary-${year}.txt`, taxSummary);

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="tax-package-${year}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting tax package:', error);
    return NextResponse.json(
      { error: 'Failed to export tax package' },
      { status: 500 }
    );
  }
}