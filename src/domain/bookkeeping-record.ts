import { pipe } from 'fp-ts/function';

import {
  Account,
  BookkeepingRecord,
  PianoStudentType,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';
import { getAccount, fromDefault } from './account';
import { getTax } from './tax';
import {
  isDomainMonthlyTransaction,
  isPerformance,
  isPhoneExpense,
  isPianoStudentPayment,
} from './transaction-classifiers';

const buildRecord = (description: string) => (
  account: Account,
): Partial<BookkeepingRecord> => ({
  account,
  description,
  taxPercentage: account.taxPercentage,
});

const amountUnknown = (
  record: Partial<BookkeepingRecord>,
): Partial<BookkeepingRecord> => ({
  ...record,
  taxAmount: 0,
  nonTaxAmount: 0,
  totalAmount: 0,
});

function buildDomainMonthlyRecord(): Partial<BookkeepingRecord> {
  return pipe(
    getAccount('DOMAIN_MONTHLY'),
    buildRecord('Domainhotelli kk-maksu'),
  );
}

function buildDomainYearlyRecord(): Partial<BookkeepingRecord> {
  return pipe(getAccount('DOMAIN_YEARLY'), buildRecord('Domainin vuosimaksu'));
}

function buildYelRecord(): Partial<BookkeepingRecord> {
  return pipe(getAccount('YEL'), buildRecord('YEL-perusvakuutus'));
}

function buildPianoStudentPaymentRecord(a: string): Partial<BookkeepingRecord> {
  return pipe(getAccount('TEACHING'), buildRecord(`Soitonopetus ${a}`));
}

function buildPhoneExpenseRecord(): Partial<BookkeepingRecord> {
  return pipe(
    getAccount('PHONE_EXPENSE'),
    buildRecord('Puhelinkulut 50%'),
    amountUnknown,
  );
}

function buildPerformanceRecord(a: string): Partial<BookkeepingRecord> {
  return pipe(getAccount('PERFORMANCE'), buildRecord(`Esiintyminen ${a}`));
}

const guessPartsFromTransaction = (ps: PianoStudentType[]) => (
  transaction: Transaction,
): Partial<BookkeepingRecord> => {
  if (isDomainMonthlyTransaction(transaction)) {
    return buildDomainMonthlyRecord();
  } else if (
    transaction.amount === -9 &&
    transaction[TRANSACTION_PAYEE_PAYER_KEY] === 'Paybyway Oy' &&
    transaction.message === 'DOMAINHOTELLI.FI DOMAINHOTELLI OY'
  ) {
    return buildDomainYearlyRecord();
  } else if (
    transaction.amount > 280 &&
    transaction.amount < 320 &&
    transaction[TRANSACTION_PAYEE_PAYER_KEY] === 'ILMARINEN KESKIN�INEN VAKYHT'
  ) {
    return buildYelRecord();
  } else if (isPianoStudentPayment(ps)(transaction)) {
    const payeeNameParts = transaction[TRANSACTION_PAYEE_PAYER_KEY].split(' ');
    return buildPianoStudentPaymentRecord(payeeNameParts[0]);
  } else if (isPhoneExpense(transaction)) {
    return buildPhoneExpenseRecord();
  } else if (isPerformance(transaction)) {
    return buildPerformanceRecord(transaction[TRANSACTION_PAYEE_PAYER_KEY]);
  } else {
    return {};
  }
};

export const fromTransaction = (ps: PianoStudentType[]) => (
  transaction: Transaction,
): BookkeepingRecord => {
  const partial = guessPartsFromTransaction(ps)(transaction);
  const account = partial.account || fromDefault();
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
};
