import { DateTime } from 'luxon';
import { Options as CsvParseOptions } from 'csv-parse';

import { array } from 'fp-ts/Array';
import { getSemigroup, NonEmptyArray } from 'fp-ts/NonEmptyArray';
import {
  chainW,
  either,
  Either,
  fromPredicate,
  getApplicativeValidation,
  map,
  tryCatch,
  toError,
} from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { sequenceT } from 'fp-ts/Apply';

import { isMoney } from './typeguards';
import { liftToArrayOfErrs2, trace } from '../fp-utils';
import { Money, Transaction, TRANSACTION_PAYEE_PAYER_KEY } from './types';

import parse = require('csv-parse/lib/sync');

type CsvParseErr = Error;
type TransactionParseFieldErr = string;
type TransactionParseErr = NonEmptyArray<TransactionParseFieldErr>;
export type Err = CsvParseErr | TransactionParseErr;

const AMOUNT_KEY = 'M\uFFFD\uFFFDr\uFFFD EUROA';
const MESSAGE_KEY = 'Viesti';
const PAYER_PAYEE_KEY = 'Saaja/Maksaja';
const REFERENCE_KEY = 'Viite';
const VALUE_DATE_KEY = 'Arvop\uFFFDiv\uFFFD';

export interface OpCsvTransaction {
  [AMOUNT_KEY]: string;
  archiveId: string;
  bankBic: string;
  description: string;
  [MESSAGE_KEY]: string;
  [PAYER_PAYEE_KEY]: string;
  receiverAccount: string;
  [REFERENCE_KEY]: string;
  transactionDate: string;
  typeCode: string;
  [VALUE_DATE_KEY]: string;
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

function removeViestiPrefix(a: string): string {
  return a.replace(/^Viesti:/, '');
}

function removeLeadingZeros(a: string): string {
  return a.replace(/^0+/, '');
}

const parseC = (options: CsvParseOptions) => (a: string) =>
  tryCatch(() => parse(a, options), toError) as Either<
    CsvParseErr,
    OpCsvTransaction[]
  >;

const dateTimeFromFormatC = (format: string) => (a: string) =>
  DateTime.fromFormat(a, format);

function parseMoney(
  a: OpCsvTransaction,
): Either<TransactionParseFieldErr, Money> {
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

function parsepPayerPayee(
  a: OpCsvTransaction,
): Either<TransactionParseFieldErr, string> {
  return pipe(
    a[PAYER_PAYEE_KEY],
    String,
    fromPredicate(
      (s) => s.length > 0,
      (s) => `Can not parse ${s} as Payer/Payee; Expecting string with content`,
    ),
  );
}

function parseValueDate(
  a: OpCsvTransaction,
): Either<TransactionParseFieldErr, DateTime> {
  return pipe(
    a[VALUE_DATE_KEY],
    dateTimeFromFormatC('d.m.yyyy'),
    fromPredicate(
      (dt) => dt.isValid,
      (dt) =>
        `Can not parse ${dt} as value date; Expecting string in format dd.mm.yyyy`,
    ),
  );
}

function parseMessage(
  a: OpCsvTransaction,
): Either<TransactionParseFieldErr, string> {
  return pipe(
    a[MESSAGE_KEY],
    String,
    removeViestiPrefix,
    removeTrailingWhitespace,
    fromPredicate(
      () => true,
      () => `Should never happen`,
    ),
  );
}

function parseReference(
  a: OpCsvTransaction,
): Either<TransactionParseFieldErr, string> {
  return pipe(
    a[REFERENCE_KEY],
    String,
    removeLeadingZeros,
    fromPredicate(
      () => true,
      () => `Should never happen`,
    ),
  );
}

function toTransaction([money, payerPayee, valueDate, message, reference]: [
  Money,
  string,
  DateTime,
  string,
  string,
]): Transaction {
  return {
    amount: money,
    [TRANSACTION_PAYEE_PAYER_KEY]: payerPayee,
    transactionDate: valueDate,
    message,
    reference,
  };
}

const parseMoneyL = liftToArrayOfErrs2(parseMoney);
const parsePayerPayeeL = liftToArrayOfErrs2(parsepPayerPayee);
const parseValueDateL = liftToArrayOfErrs2(parseValueDate);
const parseMessageL = liftToArrayOfErrs2(parseMessage);
const parseReferenceL = liftToArrayOfErrs2(parseReference);

const applicativeValidation = getApplicativeValidation(
  getSemigroup<TransactionParseFieldErr>(),
);

function fromOpCsvTransaction(
  a: OpCsvTransaction,
): Either<TransactionParseErr, Transaction> {
  return pipe(
    sequenceT(applicativeValidation)(
      parseMoneyL(a),
      parsePayerPayeeL(a),
      parseValueDateL(a),
      parseMessageL(a),
      parseReferenceL(a),
    ),
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
