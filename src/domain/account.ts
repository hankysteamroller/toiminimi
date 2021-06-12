import { Account, ExpenseSubType, IncomeSubType, Transaction } from './types';

export function getAccount(subType: IncomeSubType | ExpenseSubType): Account {
  switch (subType) {
    case 'PERFORMANCE':
      return {
        name: 'Myynti - Suomi 0%',
        group: 300,
        taxPercentage: 0,
      };
    case 'TEACHING':
      return {
        name: 'Myynti - Suomi 24%',
        group: 300,
        taxPercentage: 24,
      };
    case 'DOMAIN_MONTHLY':
      return {
        name: 'Muut vähennyskelpoiset kulut - 24%',
        group: 344,
        taxPercentage: 24,
      };
    case 'DOMAIN_YEARLY':
      return {
        name: 'Muut vähennyskelpoiset kulut - 0%',
        group: 344,
        taxPercentage: 0,
      };
    case 'PHONE_EXPENSE':
      return {
        name: 'Muut vähennyskelpoiset kulut - 24%',
        group: 344,
        taxPercentage: 24,
      };
    case 'YEL':
      return {
        name: 'Eläke -ja henkilösivukulut 0%',
        group: 322,
        taxPercentage: 0,
      };
  }
}

export function fromDefault(): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}
