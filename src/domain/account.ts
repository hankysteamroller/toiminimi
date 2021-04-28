import { Account, ExpenseSubType, IncomeSubType, Transaction } from './types';

export function getAccount(subType: IncomeSubType | ExpenseSubType): Account {
  switch (subType) {
    case 'PERFORMANCE':
      return {
        name: 'Myynti - Suomi 0%',
        group: 300,
        taxPercentage: 0,
      };
    case 'DOMAIN_MONTHLY':
      return {
        name: 'Muut vähennyskelpoiset kulut - 24%',
        group: 344,
        taxPercentage: 24,
      };
  }
}

export function fromTransaction(transaction: Transaction): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}
