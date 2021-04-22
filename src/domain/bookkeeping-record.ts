import { BookkeepingRecord, Transaction } from './types';
import { fromTransaction as accountFromTransaction } from './account';
import { getTax } from './tax';

export function fromTransaction(transaction: Transaction): BookkeepingRecord {
  const account = accountFromTransaction(transaction);
  const tax = getTax(transaction.amount, account.taxPercentage);
  return {
    account,
    description: 'TODO',
    type: 'INCOME',
    nonTaxAmount: transaction.amount - tax,
    taxPercentage: account.taxPercentage,
    taxAmount: tax,
    totalAmount: transaction.amount,
  };
}
