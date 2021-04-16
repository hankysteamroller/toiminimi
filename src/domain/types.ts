import { DateTime } from 'luxon';

export type Money = number;
export type TransactionDescription =
  | 'TILISIIRTO'
  | 'VIITESIIRTO'
  | 'PANO'
  | 'MAKSUPALVELU'
  | 'PALVELUMAKSU';

export const TRANSACTION_PAYEE_PAYER_KEY = 'payee/payer';

export interface Transaction {
  amount: Money;
  //   description: TransactionDescription;
  message: string;
  [TRANSACTION_PAYEE_PAYER_KEY]: string;
  reference: string;
  transactionDate: DateTime;
}
