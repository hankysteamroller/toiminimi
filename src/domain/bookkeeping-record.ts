import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

import {
  Account,
  BookkeepingRecord,
  PianoStudentType,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';
import { getAccount, getDefault as getDefaultAccount } from './account';
import { getTax } from './tax';
import {
  isBankExpense,
  isDomainMonthlyTransaction,
  isDomainYearlyTransaction,
  isPensionFundExpense,
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

const getDefaultRecord = (transaction: Transaction): BookkeepingRecord => ({
  description: 'UNKNOWN',
  type: transaction.amount > 0 ? 'INCOME' : 'EXPENSE',
  nonTaxAmount: 0,
  taxPercentage: 0,
  taxAmount: 0,
  totalAmount: transaction.amount,
  account: getDefaultAccount(),
});

const buildDomainMonthlyRecord = (): Partial<BookkeepingRecord> =>
  pipe(getAccount('DOMAIN_MONTHLY'), buildRecord('Domainhotelli kk-maksu'));

const buildDomainYearlyRecord = (): Partial<BookkeepingRecord> =>
  pipe(getAccount('DOMAIN_YEARLY'), buildRecord('Domainin vuosimaksu'));

const buildYelRecord = (): Partial<BookkeepingRecord> =>
  pipe(getAccount('YEL'), buildRecord('YEL-perusvakuutus'));

const buildPianoStudentPaymentRecord = (a: string) => (): Partial<
  BookkeepingRecord
> => pipe(getAccount('TEACHING'), buildRecord(`Soitonopetus ${a}`));

const buildPhoneExpenseRecord = (): Partial<BookkeepingRecord> =>
  pipe(
    getAccount('PHONE_EXPENSE'),
    buildRecord('Puhelinkulut 50%'),
    amountUnknown,
  );

const buildBankServiceFeeRecord = (): Partial<BookkeepingRecord> =>
  pipe(
    getAccount('BANK_SERVICE_FEE'),
    buildRecord('Pankin palvelumaksu'),
    amountUnknown,
  );

const buildBankEBillingRecord = (): Partial<BookkeepingRecord> =>
  pipe(getAccount('BANK_E_BILLING'), buildRecord('E-laskutus'), amountUnknown);

const buildPerformanceRecord = (a: string) => (): Partial<BookkeepingRecord> =>
  pipe(getAccount('PERFORMANCE'), buildRecord(`Esiintyminen ${a}`));

const getRecordBuilders = (ps: PianoStudentType[]) => (
  transaction: Transaction,
): (() => Partial<BookkeepingRecord>)[] => {
  if (isDomainMonthlyTransaction(transaction)) {
    return [buildDomainMonthlyRecord];
  } else if (isDomainYearlyTransaction(transaction)) {
    return [buildDomainYearlyRecord];
  } else if (isPensionFundExpense(transaction)) {
    return [buildYelRecord];
  } else if (isPianoStudentPayment(ps)(transaction)) {
    return [
      pipe(
        transaction[TRANSACTION_PAYEE_PAYER_KEY].split(' '),
        A.head,
        O.fold(
          () => buildPianoStudentPaymentRecord('Tuntematon'),
          buildPianoStudentPaymentRecord,
        ),
      ),
    ];
  } else if (isPhoneExpense(transaction)) {
    return [buildPhoneExpenseRecord];
  } else if (isBankExpense(transaction)) {
    return [buildBankServiceFeeRecord, buildBankEBillingRecord];
  } else if (isPerformance(transaction)) {
    return [buildPerformanceRecord(transaction[TRANSACTION_PAYEE_PAYER_KEY])];
  } else {
    return [() => getDefaultRecord(transaction)];
  }
};

const fillTaxInfo = (record: BookkeepingRecord): BookkeepingRecord =>
  pipe(getTax(record.totalAmount, record.account.taxPercentage), (tax) => ({
    ...record,
    nonTaxAmount: record.totalAmount - tax,
    taxPercentage: record.account.taxPercentage,
    taxAmount: tax,
  }));

const fromBuilder = (transaction: Transaction) => (
  builder: () => Partial<BookkeepingRecord>,
): BookkeepingRecord =>
  pipe({ ...getDefaultRecord(transaction), ...builder() }, fillTaxInfo);

export const manyFromTransaction = (ps: PianoStudentType[]) => (
  transaction: Transaction,
): BookkeepingRecord[] =>
  getRecordBuilders(ps)(transaction).map(fromBuilder(transaction));
