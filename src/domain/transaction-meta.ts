import { getTax } from './tax';
import { Transaction } from './types';

export function getMeta(transaction: Transaction): Transaction {
  const tax24Amount = getTax(transaction.amount, 24);
  return {
    ...transaction,
    meta: {
      tax24: tax24Amount,
      nonTax: transaction.amount - tax24Amount,
    },
  };
}

// Maybe this is not really needed as this could be done in pipelines
export function getMetas(transactions: Transaction[]): Transaction[] {
  return transactions.map(getMeta);
}
