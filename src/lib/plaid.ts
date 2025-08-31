import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'auth,transactions,identity')
  .split(',')
  .map(p => p.trim()) as Products[];

export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US')
  .split(',')
  .map(c => c.trim()) as CountryCode[];

export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || undefined;