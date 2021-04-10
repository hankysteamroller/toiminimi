import { compose } from 'lodash/fp';
import { Either, right } from 'fp-ts/Either';
import parse = require('csv-parse/lib/sync');
import { Options } from 'csv-parse';

interface Transaction {
  amount: number; // TODO: Money
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

const opTransactionsCsvOptions = {
  columns: true,
  delimiter: ';',
  relaxColumnCount: true,
};

// string -> string
function removeDoubleQuotes(i: string): string {
  return i.replace(/"/g, '');
}

function removeTrailingWhitespace(i: string): string {
  return i.trim();
}

const csvParseWithOptions = (options: Options) => (i: string) =>
  parse(i, options);

export function fromCsvString(i: string): Either<Error, string> {
  const parsed = compose(
    csvParseWithOptions(opTransactionsCsvOptions),
    removeTrailingWhitespace,
    removeDoubleQuotes,
  )(i);

  return right(JSON.stringify(parsed));
}
