import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface AutoExpenseConfig {
  organizationId: string;
  month?: Date;
}

export class AutomaticExpenseTracker {
  private organizationId: string;
  private month: Date;

  constructor(config: AutoExpenseConfig) {
    this.organizationId = config.organizationId;
    this.month = config.month || new Date();
  }

  async trackAllExpenses() {
    const results = await Promise.allSettled([
      this.trackAdExpenses(),
      this.trackPayrollExpenses(),
      this.trackMarketingExpenses(),
      this.trackSMSEmailExpenses()
    ]);

    const summary = {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results
    };

    return summary;
  }

  async trackAdExpenses() {
    const startDate = startOfMonth(this.month);
    const endDate = endOfMonth(this.month);

    // Track Facebook Ad expenses
    const facebookCampaigns = await prisma.adCampaign.findMany({
      where: {
        adAccount: {
          organizationId: this.organizationId,
          platform: 'facebook'
        },
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      },
      include: {
        adAccount: true
      }
    });

    // Track Google Ad expenses
    const googleCampaigns = await prisma.adCampaign.findMany({
      where: {
        adAccount: {
          organizationId: this.organizationId,
          platform: 'google'
        },
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      },
      include: {
        adAccount: true
      }
    });

    const adExpenses = [];

    // Create expenses for Facebook campaigns
    for (const campaign of facebookCampaigns) {
      const existingExpense = await prisma.expense.findFirst({
        where: {
          organizationId: this.organizationId,
          category: 'Advertising',
          description: `Facebook Ads - ${campaign.name}`,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      if (!existingExpense && campaign.spent > 0) {
        adExpenses.push(
          prisma.expense.create({
            data: {
              organizationId: this.organizationId,
              category: 'Advertising',
              amount: campaign.spent,
              description: `Facebook Ads - ${campaign.name}`,
              vendor: 'Facebook',
              date: endDate,
              taxDeductible: true,
              notes: `Auto-tracked from Facebook Ads integration. Campaign ID: ${campaign.platformId}`
            }
          })
        );
      }
    }

    // Create expenses for Google campaigns
    for (const campaign of googleCampaigns) {
      const existingExpense = await prisma.expense.findFirst({
        where: {
          organizationId: this.organizationId,
          category: 'Advertising',
          description: `Google Ads - ${campaign.name}`,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      if (!existingExpense && campaign.spent > 0) {
        adExpenses.push(
          prisma.expense.create({
            data: {
              organizationId: this.organizationId,
              category: 'Advertising',
              amount: campaign.spent,
              description: `Google Ads - ${campaign.name}`,
              vendor: 'Google',
              date: endDate,
              taxDeductible: true,
              notes: `Auto-tracked from Google Ads integration. Campaign ID: ${campaign.platformId}`
            }
          })
        );
      }
    }

    await Promise.all(adExpenses);
    return { platform: 'Ads', count: adExpenses.length };
  }

  async trackPayrollExpenses() {
    const startDate = startOfMonth(this.month);
    const endDate = endOfMonth(this.month);

    // Get completed payroll runs for the month
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        organizationId: this.organizationId,
        status: 'completed',
        processedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const payrollExpenses = [];

    for (const run of payrollRuns) {
      const existingExpense = await prisma.expense.findFirst({
        where: {
          organizationId: this.organizationId,
          category: 'Payroll',
          description: `Payroll - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      if (!existingExpense && run.totalAmount > 0) {
        payrollExpenses.push(
          prisma.expense.create({
            data: {
              organizationId: this.organizationId,
              category: 'Payroll',
              amount: run.totalAmount,
              description: `Payroll - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
              vendor: 'Internal Payroll',
              date: run.processedAt || endDate,
              taxDeductible: true,
              notes: `Auto-tracked from payroll system. Run ID: ${run.id}`
            }
          })
        );
      }
    }

    await Promise.all(payrollExpenses);
    return { platform: 'Payroll', count: payrollExpenses.length };
  }

  async trackMarketingExpenses() {
    const startDate = startOfMonth(this.month);
    const endDate = endOfMonth(this.month);

    // Track email marketing costs (estimate based on contacts)
    const marketingContacts = await prisma.marketingContact.count({
      where: {
        organizationId: this.organizationId,
        emailOptIn: true,
        createdAt: {
          lte: endDate
        }
      }
    });

    // Estimate cost: $0.01 per contact per month (typical email service pricing)
    const emailCost = marketingContacts * 0.01;

    const existingEmailExpense = await prisma.expense.findFirst({
      where: {
        organizationId: this.organizationId,
        category: 'Marketing',
        description: 'Email Marketing Service',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (!existingEmailExpense && emailCost > 0) {
      await prisma.expense.create({
        data: {
          organizationId: this.organizationId,
          category: 'Marketing',
          amount: emailCost,
          description: 'Email Marketing Service',
          vendor: 'Email Service Provider',
          date: endDate,
          recurring: true,
          recurringPeriod: 'monthly',
          taxDeductible: true,
          notes: `Auto-tracked based on ${marketingContacts} active contacts`
        }
      });
    }

    return { platform: 'Email Marketing', count: emailCost > 0 ? 1 : 0 };
  }

  async trackSMSEmailExpenses() {
    const startDate = startOfMonth(this.month);
    const endDate = endOfMonth(this.month);

    // Count SMS sent during the month (from campaign activities)
    const smsActivities = await prisma.campaignActivity.count({
      where: {
        campaign: {
          organizationId: this.organizationId,
          type: { in: ['sms', 'both'] },
          sentAt: {
            gte: startDate,
            lte: endDate
          }
        },
        type: 'sent'
      }
    });

    // Estimate SMS cost: $0.0075 per SMS (typical Twilio pricing)
    const smsCost = smsActivities * 0.0075;

    const existingSMSExpense = await prisma.expense.findFirst({
      where: {
        organizationId: this.organizationId,
        category: 'Marketing',
        description: 'SMS Messaging Service',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (!existingSMSExpense && smsCost > 0) {
      await prisma.expense.create({
        data: {
          organizationId: this.organizationId,
          category: 'Marketing',
          amount: smsCost,
          description: 'SMS Messaging Service',
          vendor: 'Twilio',
          date: endDate,
          taxDeductible: true,
          notes: `Auto-tracked based on ${smsActivities} SMS messages sent`
        }
      });
    }

    return { platform: 'SMS', count: smsCost > 0 ? 1 : 0 };
  }

  // Track Stripe fees
  async trackStripeFees() {
    const startDate = startOfMonth(this.month);
    const endDate = endOfMonth(this.month);

    // Calculate total revenue for the month
    const bookings = await prisma.booking.aggregate({
      where: {
        organizationId: this.organizationId,
        status: 'completed',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        finalPrice: true
      }
    });

    const totalRevenue = bookings._sum.finalPrice || 0;
    // Stripe fee: 2.9% + $0.30 per transaction
    const estimatedStripeFees = totalRevenue * 0.029;

    const existingStripeExpense = await prisma.expense.findFirst({
      where: {
        organizationId: this.organizationId,
        category: 'Bank Fees',
        description: 'Stripe Processing Fees',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (!existingStripeExpense && estimatedStripeFees > 0) {
      await prisma.expense.create({
        data: {
          organizationId: this.organizationId,
          category: 'Bank Fees',
          amount: estimatedStripeFees,
          description: 'Stripe Processing Fees',
          vendor: 'Stripe',
          date: endDate,
          taxDeductible: true,
          notes: `Auto-tracked based on ${totalRevenue.toFixed(2)} in revenue`
        }
      });
    }

    return { platform: 'Stripe', count: estimatedStripeFees > 0 ? 1 : 0 };
  }
}

// Cron job function to run monthly
export async function runMonthlyExpenseTracking() {
  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: { id: true }
    });

    const results = [];

    for (const org of organizations) {
      const tracker = new AutomaticExpenseTracker({
        organizationId: org.id,
        month: subMonths(new Date(), 1) // Track for previous month
      });

      const result = await tracker.trackAllExpenses();
      results.push({ organizationId: org.id, ...result });
    }

    console.log('Monthly expense tracking completed:', results);
    return results;
  } catch (error) {
    console.error('Error in monthly expense tracking:', error);
    throw error;
  }
}