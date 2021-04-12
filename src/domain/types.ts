// import { DateTime } from 'luxon';

export type Money = number;
export type TransactionDescription =
  | 'TILISIIRTO'
  | 'VIITESIIRTO'
  | 'PANO'
  | 'MAKSUPALVELU'
  | 'PALVELUMAKSU';

export interface Transaction {
  amount: Money;
  //   description: TransactionDescription;
  //   message: string;
  //   owner: string;
  //   reference: string;
  //   transactionDate: DateTime;
}
