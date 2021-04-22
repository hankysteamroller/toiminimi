import { Account, IncomeSubType, Transaction } from './types';

export function getAccount(subType: IncomeSubType): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}

export function fromTransaction(transaction: Transaction): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}
