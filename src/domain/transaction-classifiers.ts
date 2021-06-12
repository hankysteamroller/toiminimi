import {
  PianoStudentType,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';

const isIncome = (transaction: Transaction) => transaction.amount > 0;
const isExpense = (transaction: Transaction) => !isIncome(transaction);

const DOMAIN_PROVIDER = 'Paybyway Oy';
const DOMAIN_PROVIDER_PAYMENT_MESSAGE = 'DOMAINHOTELLI.FI DOMAINHOTELLI OY';
const DOMAIN_PROVIDER_MONTHLY_FEE = 5;
const amountEqualsDomainMonthlyFee = (transaction: Transaction) =>
  transaction.amount === -DOMAIN_PROVIDER_MONTHLY_FEE;
const isPaidToDomainProvider = (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === DOMAIN_PROVIDER;
const hasDomainProviderMessage = (transaction: Transaction) =>
  transaction.message === DOMAIN_PROVIDER_PAYMENT_MESSAGE;
export const isDomainMonthlyTransaction = (transaction: Transaction) =>
  [
    isExpense,
    amountEqualsDomainMonthlyFee,
    isPaidToDomainProvider,
    hasDomainProviderMessage,
  ].every((a) => a(transaction));

const payeePaysStudentsFees = (students: PianoStudentType[]) => (
  transaction: Transaction,
) =>
  students
    .map((s) => s.payerName)
    .includes(transaction[TRANSACTION_PAYEE_PAYER_KEY]);

export const isPianoStudentPayment = (students: PianoStudentType[]) => (
  transaction: Transaction,
) => [isIncome, payeePaysStudentsFees(students)].every((a) => a(transaction));

export const isPerformance = (transaction: Transaction) =>
  isIncome(transaction);
