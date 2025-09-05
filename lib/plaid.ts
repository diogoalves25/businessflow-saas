// Plaid client configuration
// In production, this would use actual Plaid SDK

export const plaidClient = {
  // Mock Plaid client
  createLinkToken: async (config: any) => {
    return {
      link_token: 'link-sandbox-' + Date.now()
    };
  },
  
  accountsGet: async (request: { access_token: string }) => {
    return {
      data: {
        accounts: [
          {
            account_id: 'acc_1',
            name: 'Business Checking',
            mask: '1234',
            type: 'depository',
            subtype: 'checking',
            balances: {
              available: 50000,
              current: 52000
            }
          }
        ]
      }
    };
  },
  
  accountsBalanceGet: async (request: { access_token: string }) => {
    return {
      data: {
        accounts: [
          {
            account_id: 'acc_1',
            balances: {
              available: 50000,
              current: 52000
            }
          }
        ]
      }
    };
  },
  
  transactionsGet: async (request: { access_token: string, start_date: string, end_date: string }) => {
    return {
      data: {
        transactions: [
          {
            transaction_id: 'tx_1',
            account_id: 'acc_1',
            amount: 150.00,
            name: 'Office Supplies',
            date: new Date().toISOString(),
            category: ['Shops', 'Office Supplies']
          }
        ]
      }
    };
  },
  
  // Keep the old methods for backward compatibility
  getAccounts: async (accessToken: string) => {
    return {
      accounts: [
        {
          account_id: 'acc_1',
          name: 'Business Checking',
          type: 'depository',
          subtype: 'checking',
          balance: {
            available: 50000,
            current: 52000
          }
        }
      ]
    };
  },
  
  getTransactions: async (accessToken: string, startDate: string, endDate: string) => {
    return {
      transactions: [
        {
          transaction_id: 'tx_1',
          account_id: 'acc_1',
          amount: 150.00,
          name: 'Office Supplies',
          date: new Date().toISOString(),
          category: ['Shops', 'Office Supplies']
        }
      ]
    };
  }
};