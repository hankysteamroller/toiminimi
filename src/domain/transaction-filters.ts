import { Transaction, TransactionFilter } from './types';

export function filterOwnTransactions(
  transactions: Transaction[],
): Transaction[] {
  return transactions.filter((t) => t.message !== 'Oma tilisiirto');
}

export const applyFilters = (filters: TransactionFilter[]) => (
  transactions: Transaction[],
) => {
  return filters.reduce(
    (accTransactions, filter) => filter(accTransactions),
    transactions,
  );
};

export function fromString(a: string): TransactionFilter[] {
  // Always true for time being
  return a && a.length > 0 ? [filterOwnTransactions] : [];
}
