import { DateTime } from 'luxon';

export type Money = number;
export type Percentage = number;
export type TransactionDescription =
  | 'TILISIIRTO'
  | 'VIITESIIRTO'
  | 'PANO'
  | 'MAKSUPALVELU'
  | 'PALVELUMAKSU';

export const TRANSACTION_PAYEE_PAYER_KEY = 'payee/payer';

export interface TransactionMeta {
  tax24: Money;
  nonTax: Money;
}

export interface Transaction {
  amount: Money;
  //   description: TransactionDescription;
  message: string;
  [TRANSACTION_PAYEE_PAYER_KEY]: string;
  reference: string;
  transactionDate: DateTime;
  meta?: TransactionMeta;
}

export interface TransactionsMeta {
  count: number;
}

export interface Transactions {
  meta: TransactionsMeta;
  transactions: Transaction[];
}

export type TransactionFilterType = 'own';
export type TransactionFilter = (a: Transaction[]) => Transaction[];

export type BookkeepingRecordType = 'INCOME' | 'EXPENSE';

type AccountGroup = number;

export interface Account {
  name: string;
  group: AccountGroup;
  taxPercentage: Percentage;
}

export interface AccountMap {
  incomeAccounts: Account[];
  expenseAccounts: Account[];
}

export interface BookkeepingRecord {
  account: Account;
  description: string;
  type: BookkeepingRecordType;
  nonTaxAmount: Money;
  taxPercentage: Percentage;
  taxAmount: Money;
  totalAmount: Money;
}

export interface Bookkeeping {
  records: BookkeepingRecord[];
}
