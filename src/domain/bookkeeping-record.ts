import { pipe } from 'fp-ts/function';

import {
  Account,
  BookkeepingRecord,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';
import {
  getAccount,
  fromTransaction as accountFromTransaction,
} from './account';
import { getTax } from './tax';

const buildRecord: (
  description: string,
) => (account: Account) => Partial<BookkeepingRecord> = (
  description: string,
) => (account: Account) => ({
  account,
  description,
  taxPercentage: account.taxPercentage,
});

function buildGreetingRecord(a: string): Partial<BookkeepingRecord> {
  return pipe(getAccount('PERFORMANCE'), buildRecord(`Esiintyminen ${a}`));
}

function buildDomainMonthlyRecord(): Partial<BookkeepingRecord> {
  return pipe(
    getAccount('DOMAIN_MONTHLY'),
    buildRecord('Domainhotelli kk-maksu'),
  );
}

function buildDomainYearlyRecord(): Partial<BookkeepingRecord> {
  return pipe(getAccount('DOMAIN_YEARLY'), buildRecord('Domainin vuosimaksu'));
}

function deduceFromTransaction(
  transaction: Transaction,
): Partial<BookkeepingRecord> {
  if (transaction.amount === 25) {
    return buildGreetingRecord(transaction[TRANSACTION_PAYEE_PAYER_KEY]);
  } else if (
    transaction.amount === -5 &&
    transaction[TRANSACTION_PAYEE_PAYER_KEY] === 'Paybyway Oy' &&
    transaction.message === 'DOMAINHOTELLI.FI DOMAINHOTELLI OY'
  ) {
    return buildDomainMonthlyRecord();
  } else if (
    transaction.amount === -9 &&
    transaction[TRANSACTION_PAYEE_PAYER_KEY] === 'Paybyway Oy' &&
    transaction.message === 'DOMAINHOTELLI.FI DOMAINHOTELLI OY'
  ) {
    return buildDomainYearlyRecord();
  } else {
    return {};
  }
}

export function fromTransaction(transaction: Transaction): BookkeepingRecord {
  const partial = deduceFromTransaction(transaction);
  const account = partial.account || accountFromTransaction(transaction);
  const tax = getTax(transaction.amount, account.taxPercentage);
  const defaultRecord: BookkeepingRecord = {
    description: 'UNKNOWN',
    type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
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
