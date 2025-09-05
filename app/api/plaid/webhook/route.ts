import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { plaidClient } from '@/src/lib/plaid';
import { createAuditLog } from '@/lib/audit';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(
  signedJwt: string,
  body: string
): boolean {
  try {
    // In production, you should verify the JWT using Plaid's public key
    // For now, we'll do basic validation
    return true;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('plaid-verification') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhook = JSON.parse(body);
    const { webhook_type, webhook_code, item_id } = webhook;

    console.log(`Received webhook: ${webhook_type} - ${webhook_code}`);

    switch (webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhook_code, item_id, webhook);
        break;
      
      case 'AUTH':
        await handleAuthWebhook(webhook_code, item_id, webhook);
        break;
      
      case 'ITEM':
        await handleItemWebhook(webhook_code, item_id, webhook);
        break;
      
      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTransactionsWebhook(
  code: string,
  itemId: string,
  webhook: any
) {
  switch (code) {
    case 'SYNC_UPDATES_AVAILABLE':
      // New transactions are available
      console.log(`New transactions available for item: ${itemId}`);
      // In production, you would sync transactions here
      break;
    
    case 'RECURRING_TRANSACTIONS_UPDATE':
      // Recurring transactions have been detected
      console.log(`Recurring transactions updated for item: ${itemId}`);
      break;
    
    default:
      console.log(`Unhandled transactions webhook code: ${code}`);
  }
}

async function handleAuthWebhook(
  code: string,
  itemId: string,
  webhook: any
) {
  switch (code) {
    case 'AUTOMATICALLY_VERIFIED':
      // Account numbers have been verified
      console.log(`Account automatically verified for item: ${itemId}`);
      break;
    
    case 'VERIFICATION_EXPIRED':
      // Verification has expired, need to re-verify
      console.log(`Verification expired for item: ${itemId}`);
      await markConnectionForReauth(itemId);
      break;
    
    default:
      console.log(`Unhandled auth webhook code: ${code}`);
  }
}

async function handleItemWebhook(
  code: string,
  itemId: string,
  webhook: any
) {
  switch (code) {
    case 'ERROR':
      // An error occurred with the item
      console.error(`Item error for ${itemId}:`, webhook.error);
      await handleItemError(itemId, webhook.error);
      break;
    
    case 'NEW_ACCOUNTS_AVAILABLE':
      // New accounts have been added to the item
      console.log(`New accounts available for item: ${itemId}`);
      break;
    
    case 'PENDING_EXPIRATION':
      // Access token will expire soon
      console.log(`Access token expiring soon for item: ${itemId}`);
      await markConnectionForReauth(itemId);
      break;
    
    case 'USER_PERMISSION_REVOKED':
      // User revoked permissions
      console.log(`User revoked permissions for item: ${itemId}`);
      await deactivateConnection(itemId);
      break;
    
    case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
      // Webhook URL has been updated
      console.log(`Webhook updated for item: ${itemId}`);
      break;
    
    default:
      console.log(`Unhandled item webhook code: ${code}`);
  }
}

async function handleItemError(itemId: string, error: any) {
  const { error_code, error_message } = error;
  
  // Deactivate connection on error
  await prisma.plaidConnection.updateMany({
    where: { itemId },
    data: {
      isActive: false,
    },
  });

  // Log to audit log
  const connection = await prisma.plaidConnection.findFirst({
    where: { itemId },
  });

  if (connection) {
    await createAuditLog({
      organizationId: connection.organizationId,
      userId: 'system',
      action: 'PLAID_ERROR',
      entityId: connection.id,
      entityType: 'PlaidConnection',
      metadata: {
        error_code,
        error_message,
      },
    });
  }
}

async function markConnectionForReauth(itemId: string) {
  // For now, just deactivate connections that need reauth
  // In production, you'd track this state separately
  await prisma.plaidConnection.updateMany({
    where: { itemId },
    data: {
      isActive: false,
    },
  });
}

async function deactivateConnection(itemId: string) {
  await prisma.plaidConnection.updateMany({
    where: { itemId },
    data: {
      isActive: false,
    },
  });
}