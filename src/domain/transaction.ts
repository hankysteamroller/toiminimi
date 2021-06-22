import { DateTime } from 'luxon';
import { Options as CsvParseOptions } from 'csv-parse';

import * as A from 'fp-ts/Array';
import * as NEA from 'fp-ts/NonEmptyArray';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';

import { parseC } from '../utils/csv';
import { isMoney } from './typeguards';
import { liftToArrayOfErrs2 } from '../fp-utils';
import { Money, Transaction, TRANSACTION_PAYEE_PAYER_KEY } from './types';

type TransactionParseFieldErr = string;
type TransactionParseErr = NEA.NonEmptyArray<TransactionParseFieldErr>;
export type Err = Error | TransactionParseErr;

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

const dateTimeFromFormatC = (format: string) => (a: string) =>
  DateTime.fromFormat(a, format);

function parseMoney(
  a: OpCsvTransaction,
): E.Either<TransactionParseFieldErr, Money> {
  return pipe(
    a[AMOUNT_KEY],
    String,
    replaceCommasWithDots,
    Number,
    E.fromPredicate(
      isMoney,
      (money) => `Can not parse ${money} as Money; ${JSON.stringify(a)}`,
    ),
  );
}

function parsepPayerPayee(
  a: OpCsvTransaction,
): E.Either<TransactionParseFieldErr, string> {
  return pipe(
    a[PAYER_PAYEE_KEY],
    String,
    E.fromPredicate(
      (s) => s.length > 0,
      (s) => `Can not parse ${s} as Payer/Payee; Expecting string with content`,
    ),
  );
}

function parseValueDate(
  a: OpCsvTransaction,
): E.Either<TransactionParseFieldErr, DateTime> {
  return pipe(
    a[VALUE_DATE_KEY],
    dateTimeFromFormatC('d.m.yyyy'),
    E.fromPredicate(
      (dt) => dt.isValid,
      (dt) =>
        `Can not parse ${dt} as value date; Expecting string in format dd.mm.yyyy`,
    ),
  );
}

function parseMessage(
  a: OpCsvTransaction,
): E.Either<TransactionParseFieldErr, string> {
  return pipe(
    a[MESSAGE_KEY],
    String,
    removeViestiPrefix,
    removeTrailingWhitespace,
    E.fromPredicate(
      () => true,
      () => `Should never happen`,
    ),
  );
}

function parseReference(
  a: OpCsvTransaction,
): E.Either<TransactionParseFieldErr, string> {
  return pipe(
    a[REFERENCE_KEY],
    String,
    removeLeadingZeros,
    E.fromPredicate(
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

const applicativeValidation = E.getApplicativeValidation(
  NEA.getSemigroup<TransactionParseFieldErr>(),
);

function fromOpCsvTransaction(
  a: OpCsvTransaction,
): E.Either<TransactionParseErr, Transaction> {
  return pipe(
    sequenceT(applicativeValidation)(
      parseMoneyL(a),
      parsePayerPayeeL(a),
      parseValueDateL(a),
      parseMessageL(a),
      parseReferenceL(a),
    ),
    E.map(toTransaction),
  );
}

function fromOpCsvTransactions(
  as: OpCsvTransaction[],
): E.Either<TransactionParseErr, Transaction[]> {
  return A.traverse(E.Applicative)(fromOpCsvTransaction)(as);
}

function fromPreProcessedCsvString(a: string): E.Either<Err, Transaction[]> {
  return pipe(
    a,
    parseC<OpCsvTransaction>(opCsvTransactionOptions),
    E.chainW(fromOpCsvTransactions),
  );
}

export function fromCsvString(a: string): E.Either<Err, Transaction[]> {
  return pipe(
    removeDoubleQuotes(a),
    removeTrailingWhitespace,
    fromPreProcessedCsvString,
  );
}
