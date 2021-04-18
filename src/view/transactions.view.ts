import { Transactions } from '../domain/types';
import {
  TransactionView,
  serialize as transactionSerialize,
} from './transaction.view';

export interface TransactionsView {
  Yhteenveto: {
    Tapahtumia: number;
  };
  Tapahtumat: TransactionView[];
}

export function serialize(transactions: Transactions): TransactionsView {
  return {
    Yhteenveto: {
      Tapahtumia: transactions.meta.count,
    },
    Tapahtumat: transactions.transactions.map(transactionSerialize),
  };
}
