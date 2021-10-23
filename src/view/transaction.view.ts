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
  Meta?: {
    ALV24: string;
    Veroton: string;
  };
}

export function serialize(transaction: Transaction): TransactionView {
  const meta = transaction.meta
    ? {
        ALV24: transaction.meta.tax24.toFixed(2),
        Veroton: transaction.meta.nonTax.toFixed(2),
      }
    : undefined;
  return {
    Päivämäärä: transaction.transactionDate.toFormat('d.M.yyyy'),
    Määrä: transaction.amount,
    [PAYER_PAYEE_KEY]: transaction[TRANSACTION_PAYEE_PAYER_KEY],
    Viite: transaction.reference,
    Viesti: transaction.message.length > 0 ? transaction.message : undefined,
    Meta: meta,
  };
}
