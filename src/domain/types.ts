import { DateTime } from 'luxon';

type Money = number;
type TransactionDescription =
  | 'TILISIIRTO'
  | 'VIITESIIRTO'
  | 'PANO'
  | 'MAKSUPALVELU'
  | 'PALVELUMAKSU';

interface Transaction {
  amount: Money;
  description: TransactionDescription;
  message: string;
  owner: string;
  reference: string;
  transactionDate: DateTime;
}
