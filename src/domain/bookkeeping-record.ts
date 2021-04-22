import {
  BookkeepingRecord,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';
import {
  getAccount,
  fromTransaction as accountFromTransaction,
} from './account';
import { getTax } from './tax';

function buildGreetingRecord(a: string): Partial<BookkeepingRecord> {
  return {
    account: getAccount('PERFORMANCE'),
    description: `Esiintyminen ${a}`,
    type: 'INCOME',
    taxPercentage: 0,
  };
}

function deduceFromTransaction(
  transaction: Transaction,
): Partial<BookkeepingRecord> {
  if (transaction.amount === 25) {
    return buildGreetingRecord(transaction[TRANSACTION_PAYEE_PAYER_KEY]);
  } else {
    return {};
  }
}

export function fromTransaction(transaction: Transaction): BookkeepingRecord {
  const partial = deduceFromTransaction(transaction);
  const account = accountFromTransaction(transaction);
  const tax = getTax(transaction.amount, account.taxPercentage);
  const defaultRecord: BookkeepingRecord = {
    description: 'TODO',
    type: 'INCOME',
    nonTaxAmount: transaction.amount - tax,
    taxPercentage: account.taxPercentage,
    taxAmount: tax,
    totalAmount: transaction.amount,
  };

  return {
    ...defaultRecord,
    ...partial,
  };
}
