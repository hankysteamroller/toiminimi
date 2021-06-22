import { Options } from 'csv-parse';

import { Either, toError, tryCatch } from 'fp-ts/Either';

import parse = require('csv-parse/lib/sync');
import stringify = require('csv-stringify/lib/sync');

export type CsvParseErr = Error;

export const parseC = <T>(options: Options) => (a: string) =>
  tryCatch(() => parse(a, options), toError) as Either<CsvParseErr, T[]>;

export const toCsv = (input: string[][]) =>
  tryCatch(() => stringify(input, { delimiter: ';' }), toError) as Either<
    Error,
    string
  >;
