import {
  Money,
  PianoStudentType,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from './types';

const isIncome = (transaction: Transaction) => transaction.amount > 0;
const isExpense = (transaction: Transaction) => !isIncome(transaction);
const isInRange = (min: Money, max: Money) => (transaction: Transaction) =>
  Math.abs(transaction.amount) > min && Math.abs(transaction.amount) < max;
const isPaidTo = (provider: string) => (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === provider;

const DOMAIN_PROVIDER = 'Paybyway Oy';
const DOMAIN_PROVIDER_PAYMENT_MESSAGE = 'DOMAINHOTELLI.FI DOMAINHOTELLI OY';
const DOMAIN_PROVIDER_MONTHLY_FEE = 5;
const DOMAIN_PROVIDER_YEARLY_FEE = 9;
const amountEqualsDomainMonthlyFee = (transaction: Transaction) =>
  Math.abs(transaction.amount) === DOMAIN_PROVIDER_MONTHLY_FEE;
const amountEqualsDomainYearlyFee = (transaction: Transaction) =>
  Math.abs(transaction.amount) === DOMAIN_PROVIDER_YEARLY_FEE;
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

export const isDomainYearlyTransaction = (transaction: Transaction) =>
  [
    isExpense,
    amountEqualsDomainYearlyFee,
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

const PHONE_CARRIER = 'Telia Finland Oyj';
const isPaidToPhoneCarrier = (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === PHONE_CARRIER;
export const isPhoneExpense = (transaction: Transaction) =>
  [isExpense, isPaidToPhoneCarrier].every((a) => a(transaction));

const BANK_SERVICE_PROVIDER = 'OSUUSPANKKI';
const isPaidToBankServiceProvider = (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === BANK_SERVICE_PROVIDER;
export const isBankExpense = (transaction: Transaction) =>
  [isExpense, isPaidToBankServiceProvider].every((a) => a(transaction));

const PENSION_FUND = 'ILMARINEN KESKIN�INEN VAKYHT';
const PENSION_FEE_MIN = 280;
const PENSION_FEE_MAX = 320;
const isPaidToPensionFund = (transaction: Transaction) =>
  transaction[TRANSACTION_PAYEE_PAYER_KEY] === PENSION_FUND;
export const isPensionFundExpense = (transaction: Transaction) =>
  [
    isExpense,
    isInRange(PENSION_FEE_MIN, PENSION_FEE_MAX),
    isPaidToPensionFund,
  ].every((a) => a(transaction));

const VUORES_RENT_PROVIDER = 'Storyspace Oy';
export const isVuoresRent = (transaction: Transaction) =>
  [isExpense, isPaidTo(VUORES_RENT_PROVIDER)].every((a) => a(transaction));
