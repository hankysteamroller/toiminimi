import { Options } from 'csv-parse';

import { Either, toError, tryCatch } from 'fp-ts/Either';

import parse = require('csv-parse/lib/sync');

export type CsvParseErr = Error;

export const parseC = <T>(options: Options) => (a: string) =>
  tryCatch(() => parse(a, options), toError) as Either<CsvParseErr, T[]>;
