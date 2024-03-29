import { Account, ExpenseSubType, IncomeSubType } from './types';

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
    case 'BANK_SERVICE_FEE':
      return {
        name: 'Muut vähennyskelpoiset kulut - 0%',
        group: 344,
        taxPercentage: 0,
      };
    case 'BANK_E_BILLING':
      return {
        name: 'Muut vähennyskelpoiset kulut - 24%',
        group: 344,
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
    case 'RENT':
      return {
        name: 'Vuokrat',
        group: 343,
        taxPercentage: 24,
      };
    case 'VISUALS':
      return {
        name: 'Muut vähennyskelpoiset kulut - 0%',
        group: 344,
        taxPercentage: 0,
      };
    case 'YEL':
      return {
        name: 'Eläke -ja henkilösivukulut 0%',
        group: 336,
        taxPercentage: 0,
      };
  }
}

export function getDefault(): Account {
  return {
    name: 'Myynti - Suomi 0%',
    group: 300,
    taxPercentage: 0,
  };
}
