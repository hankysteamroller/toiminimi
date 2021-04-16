import { Transaction } from './types';

export function filterOwnTransactions(
  transactions: Transaction[],
): Transaction[] {
  return transactions.filter((t) => t.message !== 'Oma tilisiirto');
}
