import { Options as CsvParseOptions } from 'csv-parse';

import { array } from 'fp-ts/Array';
import { getSemigroup, NonEmptyArray } from 'fp-ts/NonEmptyArray';
import {
  chainW,
  either,
  Either,
  fromPredicate,
  getApplicativeValidation,
  right,
  left,
  map,
  tryCatch,
  toError,
} from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { sequenceT } from 'fp-ts/Apply';

import { isMoney } from './typeguards';
import { liftToArrayOfErrs2, trace } from '../fp-utils';
import { Money, Transaction } from './types';

import parse = require('csv-parse/lib/sync');

type CsvParseErr = Error;
type TransactionParseSingleErr = string;
type TransactionParseErr = NonEmptyArray<TransactionParseSingleErr>;
export type Err = CsvParseErr | TransactionParseErr;

const AMOUNT_KEY = 'M\uFFFD\uFFFDr\uFFFD EUROA';

export interface OpCsvTransaction {
  [AMOUNT_KEY]: string;
  archiveId: string;
  bankBic: string;
  description: string;
  message: string;
  owner: string;
  receiverAccount: string;
  reference: string;
  transactionDate: string;
  typeCode: string;
  valueDate: string;
}

const opCsvTransactionOptions: CsvParseOptions = {
  columns: true,
  delimiter: ';',
  relaxColumnCount: true,
};

function removeDoubleQuotes(a: string): string {
  return a.replace(/"/g, '');
}

function removeTrailingWhitespace(a: string): string {
  return a.trim();
}

function replaceCommasWithDots(a: string): string {
  return a.replace(/,/g, '.');
}

const parseC = (options: CsvParseOptions) => (a: string) =>
  tryCatch(() => parse(a, options), toError) as Either<
    CsvParseErr,
    OpCsvTransaction[]
  >;

function parseMoney(
  a: OpCsvTransaction,
): Either<TransactionParseSingleErr, Money> {
  return pipe(
    a[AMOUNT_KEY],
    String,
    replaceCommasWithDots,
    Number,
    fromPredicate(
      isMoney,
      (money) => `Can not parse ${money} as Money; ${JSON.stringify(a)}`,
    ),
  );
}

function toTransaction([money]: [Money]): Transaction {
  return {
    amount: money,
  };
}

const parseMoneyL = liftToArrayOfErrs2(parseMoney);

const applicativeValidation = getApplicativeValidation(
  getSemigroup<TransactionParseSingleErr>(),
);

function fromOpCsvTransaction(
  a: OpCsvTransaction,
): Either<TransactionParseErr, Transaction> {
  return pipe(
    sequenceT(applicativeValidation)(parseMoneyL(a)),
    map(toTransaction),
  );
}

function fromOpCsvTransactions(
  as: OpCsvTransaction[],
): Either<TransactionParseErr, Transaction[]> {
  return array.traverse(either)(as, fromOpCsvTransaction);
}

function fromPreProcessedCsvString(a: string): Either<Err, Transaction[]> {
  return pipe(
    a,
    parseC(opCsvTransactionOptions),
    chainW(fromOpCsvTransactions),
  );
}

export function fromCsvString(a: string): Either<Err, Transaction[]> {
  return pipe(
    removeDoubleQuotes(a),
    removeTrailingWhitespace,
    fromPreProcessedCsvString,
  );
}
