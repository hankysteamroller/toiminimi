import * as fs from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { promisify } from 'util';

import { pipe } from 'fp-ts/pipeable';
import { chainEitherK, map, TaskEither, tryCatchK } from 'fp-ts/TaskEither';
import { toError } from 'fp-ts/Either';

import { AppConfig } from './app.config';
import { APP_CONFIG } from './constants';
import { Err, fromCsvString } from './domain/transaction';
import { applyFilters } from './domain/transaction-filters';
import { TransactionFilter, Transactions } from './domain/types';
import { getMetas } from './domain/transaction-meta';
import { fromTransactionList } from './domain/transactions';

const fpReadFile = tryCatchK(promisify(fs.readFile), toError);
const fpReadFileUTF = (path: string) =>
  fpReadFile(path, 'utf-8') as TaskEither<Error, string>;

@Injectable()
export class AppService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    console.log(`AppService configured with ${JSON.stringify(config)}`);
  }

  getTransactions(
    path: string,
    filters: TransactionFilter[],
  ): TaskEither<Err, Transactions> {
    return pipe(
      fpReadFileUTF(path),
      chainEitherK(fromCsvString),
      map(applyFilters(filters)),
      map(getMetas),
      map(fromTransactionList),
    );
  }
}
