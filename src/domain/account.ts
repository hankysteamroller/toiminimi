import { Account, Transaction } from './types';

export function fromTransaction(transaction: Transaction): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}
