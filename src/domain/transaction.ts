import { compose } from 'lodash/fp';
import { Either, tryCatch, toError } from 'fp-ts/Either';
import parse = require('csv-parse/lib/sync');
import { Options as CsvParseOptions } from 'csv-parse';

interface OpCsvTransaction {
  amount: number;
  archiveId: string;
  bankBic: string;
  description: string;
  message: string;
  owner: string;
  receiverAccount: string;
  reference: string;
  transactionDate: Date;
  typeCode: number;
  valueDate: Date;
}

const opCsvTransactionOptions: CsvParseOptions = {
  columns: true,
  delimiter: ';',
  relaxColumnCount: true,
};

function removeDoubleQuotes(i: string): string {
  return i.replace(/"/g, '');
}

function removeTrailingWhitespace(i: string): string {
  return i.trim();
}

const parseC = (options: CsvParseOptions) => (i: string) =>
  tryCatch(() => parse(i, options), toError) as Either<Error, string>;

export function fromCsvString(i: string): Either<Error, string> {
  return compose(
    parseC(opCsvTransactionOptions),
    removeTrailingWhitespace,
    removeDoubleQuotes,
  )(i);
}
