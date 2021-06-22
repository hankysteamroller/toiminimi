import { Inject, Injectable } from '@nestjs/common';

import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { AppConfig } from './app.config';
import { APP_CONFIG } from './constants';
import { Err, fromCsvString } from './domain/transaction';
import { applyFilters } from './domain/transaction-filters';
import {
  BookkeepingRecord,
  PianoStudentType,
  TransactionFilter,
  Transaction,
  Transactions,
} from './domain/types';
import { fromFile } from './domain/piano-student';
import { fromTransactionList } from './domain/transactions';
import { getMetas } from './domain/transaction-meta';
import { manyFromTransaction } from './domain/bookkeeping-record';
import { readFile, writeFile } from './utils/file';
import { serialize } from './view/bookkeeping-record.disk-view';
import { toCsv } from './utils/csv';

@Injectable()
export class AppService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    console.log(`AppService configured with ${JSON.stringify(config)}`);
  }

  getTransactions(
    path: string,
    filters: TransactionFilter[],
  ): TE.TaskEither<Err, Transaction[]> {
    return pipe(
      readFile(path),
      TE.chainEitherK(fromCsvString),
      TE.map(applyFilters(filters)),
    );
  }

  getTransactionsWithMeta(
    path: string,
    filters: TransactionFilter[],
  ): TE.TaskEither<Err, Transactions> {
    return pipe(
      readFile(path),
      TE.chainEitherK(fromCsvString),
      TE.map(applyFilters(filters)),
      TE.map(getMetas),
      TE.map(fromTransactionList),
    );
  }

  getBookkeepingRecords(
    path: string,
    filters: TransactionFilter[],
  ): TE.TaskEither<Err, BookkeepingRecord[]> {
    return pipe(
      TE.Do,
      TE.apS('students', this.getPianoStudents('data/students.csv')),
      TE.apS('transactions', this.getTransactions(path, filters)),
      TE.map(({ students, transactions }) =>
        pipe(transactions.map(manyFromTransaction(students)), A.flatten),
      ),
    );
  }

  saveBookkeepingRecords(
    path: string,
    filters: TransactionFilter[],
  ): TE.TaskEither<Err | Error, BookkeepingRecord[]> {
    return pipe(
      TE.Do,
      TE.apS('records', this.getBookkeepingRecords(path, filters)),
      TE.chain(({ records }) =>
        pipe(
          records.map(serialize),
          toCsv,
          TE.fromEither,
          TE.chain(writeFile('data/out.csv')),
          TE.chain(() => TE.of(records)),
        ),
      ),
    );
  }

  getPianoStudents(path: string): TE.TaskEither<Error, PianoStudentType[]> {
    return pipe(readFile(path), TE.chainEitherK(fromFile));
  }
}
