# Plaid Payroll Testing Guide

## Prerequisites

1. Ensure you have the Plaid environment variables set in `.env.local`:
```env
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox
PLAID_PRODUCTS=auth,transactions,identity
PLAID_COUNTRY_CODES=US
PLAID_WEBHOOK_URL=https://your-domain.com/api/plaid/webhook
```

2. Make sure you're on the Premium plan ($99.99/mo) to access payroll features.

## Testing Flow

### 1. Connect a Bank Account

1. Navigate to `/admin/payroll`
2. Go to the "Bank Accounts" tab
3. Click "Connect Bank Account"
4. In the Plaid Link modal, use these sandbox credentials:
   - **Institution**: Any bank (e.g., "Chase")
   - **Username**: `user_good`
   - **Password**: `pass_good`
   - **PIN** (if asked): `1234`

### 2. Test Different Account Scenarios

Plaid provides several test credentials for different scenarios:

| Username | Password | Scenario |
|----------|----------|----------|
| `user_good` | `pass_good` | Success - returns accounts |
| `user_custom` | Any JSON | Custom account configuration |
| `user_error` | `pass_error` | Triggers an error |
| `user_oauth` | `pass_oauth` | OAuth flow simulation |

### 3. View Connected Accounts

After successful connection:
- You should see the bank name and account details
- The account balance will be displayed
- Multiple accounts from the same institution will all be shown

### 4. Test Payroll Calculation

1. Go to the "Process Payroll" tab
2. The system will automatically calculate payroll based on:
   - Completed bookings in the current pay period
   - Technician hours worked
   - Hourly rates set for each technician
   - Tax withholdings (simplified for demo)

### 5. Process a Test Payroll

1. Review the calculated amounts
2. Select the bank account to pay from
3. Click "Process Payroll"
4. In sandbox mode, this will:
   - Create a payroll run record
   - Mark it as completed
   - Show in the history tab

### 6. View Payroll History

- Go to the "History" tab
- See all processed payroll runs
- View details of each payment

## Testing Webhooks

To test webhooks locally:

1. Use a tool like ngrok to expose your local server:
```bash
ngrok http 3000
```

2. Update your Plaid webhook URL to the ngrok URL:
```
https://your-ngrok-url.ngrok.io/api/plaid/webhook
```

3. Webhooks will be triggered for events like:
   - New transactions available
   - Account verification status changes
   - Error conditions
   - Permission revocations

## Common Test Scenarios

### Scenario 1: First-Time Setup
1. Connect a bank account using `user_good`
2. Wait for accounts to load
3. Process your first payroll

### Scenario 2: Multiple Accounts
1. Connect multiple bank accounts
2. Switch between accounts when processing payroll
3. Verify the correct account is charged

### Scenario 3: Error Handling
1. Try to process payroll without a connected account
2. Use `user_error` credentials to test connection failures
3. Disconnect an account and verify it's removed

### Scenario 4: Security Features
1. Check audit logs after processing payroll
2. Verify all actions are logged with timestamps
3. Test re-authentication flows (if implemented)

## Troubleshooting

### "No payroll to process"
- Ensure you have technicians with hourly rates set
- Create some completed bookings in the current week
- Check that bookings have technicians assigned

### Connection Issues
- Verify your Plaid credentials are correct
- Check that you're using sandbox credentials
- Ensure PLAID_ENV is set to "sandbox"

### Webhook Not Receiving
- Verify webhook URL is accessible
- Check webhook signature validation
- Look for errors in server logs

## Production Considerations

Before going to production:

1. **Switch to Production Credentials**
   - Update PLAID_ENV to "production"
   - Use production client ID and secret
   - Update webhook URL to production domain

2. **Implement Full ACH Processing**
   - Partner with a payment processor
   - Implement proper fund verification
   - Add settlement time handling

3. **Enhanced Security**
   - Enable two-factor authentication for payroll
   - Implement IP whitelisting
   - Add fraud detection

4. **Compliance**
   - Ensure proper tax calculations
   - Implement W-2/1099 generation
   - Add state-specific tax rules

5. **Error Handling**
   - Handle insufficient funds
   - Implement retry logic
   - Add notification system

## Support

For Plaid-specific issues:
- Check Plaid dashboard for API logs
- Review Plaid documentation at https://plaid.com/docs
- Contact Plaid support for production issues

For BusinessFlow issues:
- Check application logs
- Review audit trail for actions taken
- Contact support with error details