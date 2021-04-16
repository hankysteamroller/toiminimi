import {
  Money,
  Transaction,
  TRANSACTION_PAYEE_PAYER_KEY,
} from '../domain/types';

const PAYER_PAYEE_KEY = 'Saaja/Maksaja';

export interface TransactionView {
  Määrä: Money;
  Viesti: string | undefined;
  [PAYER_PAYEE_KEY]: string;
  Viite: string;
  Päivämäärä: string;
}

export function serialize(transaction: Transaction): TransactionView {
  return {
    Päivämäärä: transaction.transactionDate.toFormat('d.m.yyyy'),
    Määrä: transaction.amount,
    [PAYER_PAYEE_KEY]: transaction[TRANSACTION_PAYEE_PAYER_KEY],
    Viite: transaction.reference,
    Viesti: transaction.message.length > 0 ? transaction.message : undefined,
  };
}
