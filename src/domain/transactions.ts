import { Transaction, Transactions } from './types';

export function fromTransactionList(transactions: Transaction[]): Transactions {
  return {
    meta: {
      count: transactions.length,
    },
    transactions,
  };
}
