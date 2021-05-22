import { Transaction, TRANSACTION_PAYEE_PAYER_KEY } from './types';

const DOMAIN_PROVIDER = 'Paybyway Oy';
const DOMAIN_PROVIDER_PAYMENT_MESSAGE = 'DOMAINHOTELLI.FI DOMAINHOTELLI OY';
const DOMAIN_PROVIDER_MONTHLY_FEE = 5;
const amountEqualsDomainMonthlyFee = (transaction: Transaction) =>
  transaction.amount === -DOMAIN_PROVIDER_MONTHLY_FEE;
const isPaidToDomainProvider = (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === DOMAIN_PROVIDER;
const hasDomainProviderMessage = (transaction: Transaction) =>
  transaction.message === DOMAIN_PROVIDER_PAYMENT_MESSAGE;
export const isDomainMonthlyTransaction = (transaction: Transaction) =>
  [
    amountEqualsDomainMonthlyFee,
    isPaidToDomainProvider,
    hasDomainProviderMessage,
  ].every((a) => a(transaction));
