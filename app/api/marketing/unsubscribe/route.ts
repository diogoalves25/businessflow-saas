import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { handleUnsubscribe } from '@/src/lib/marketing/analytics';
import { verifyUnsubscribeToken } from '@/src/lib/marketing/messaging';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contactId = searchParams.get('contact');
    const token = searchParams.get('token');
    const channel = searchParams.get('channel') as 'email' | 'sms' | 'all' || 'all';

    if (!contactId || !token) {
      return NextResponse.redirect(new URL('/unsubscribe-error', request.url));
    }

    // Verify token
    if (!verifyUnsubscribeToken(contactId, token)) {
      return NextResponse.redirect(new URL('/unsubscribe-error', request.url));
    }

    // Get contact
    const contact = await prisma.marketingContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.redirect(new URL('/unsubscribe-error', request.url));
    }

    // Handle unsubscribe
    await handleUnsubscribe(contactId, channel);

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(
      new URL(`/unsubscribe-success?email=${encodeURIComponent(contact.email)}`, request.url)
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(new URL('/unsubscribe-error', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, token, channel = 'all', preferences } = body;

    if (!contactId || !token) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify token
    if (!verifyUnsubscribeToken(contactId, token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get contact
    const contact = await prisma.marketingContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (preferences) {
      // Update preferences
      await prisma.marketingContact.update({
        where: { id: contactId },
        data: {
          emailOptIn: preferences.emailOptIn ?? contact.emailOptIn,
          smsOptIn: preferences.smsOptIn ?? contact.smsOptIn,
          subscribed: preferences.emailOptIn || preferences.smsOptIn,
        },
      });

      // Update contact preferences
      if (preferences.frequency || preferences.categories) {
        const existingPrefs = await prisma.contactPreference.findMany({
          where: { contactId },
        });

        // Update email preferences
        if (preferences.frequency?.email) {
          const emailPref = existingPrefs.find(p => p.channel === 'email');
          if (emailPref) {
            await prisma.contactPreference.update({
              where: { id: emailPref.id },
              data: {
                frequency: preferences.frequency.email,
                categories: preferences.categories?.email || emailPref.categories,
              },
            });
          } else {
            await prisma.contactPreference.create({
              data: {
                contactId,
                channel: 'email',
                frequency: preferences.frequency.email,
                categories: preferences.categories?.email || [],
              },
            });
          }
        }

        // Update SMS preferences
        if (preferences.frequency?.sms) {
          const smsPref = existingPrefs.find(p => p.channel === 'sms');
          if (smsPref) {
            await prisma.contactPreference.update({
              where: { id: smsPref.id },
              data: {
                frequency: preferences.frequency.sms,
                categories: preferences.categories?.sms || smsPref.categories,
              },
            });
          } else {
            await prisma.contactPreference.create({
              data: {
                contactId,
                channel: 'sms',
                frequency: preferences.frequency.sms,
                categories: preferences.categories?.sms || [],
              },
            });
          }
        }
      }

      return NextResponse.json({ success: true, message: 'Preferences updated' });
    } else {
      // Handle unsubscribe
      await handleUnsubscribe(contactId, channel);
      return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
    }
  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}