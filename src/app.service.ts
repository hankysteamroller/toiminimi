import * as fs from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { promisify } from 'util';

import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { toError } from 'fp-ts/Either';

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
import { getMetas } from './domain/transaction-meta';
import { fromTransactionList } from './domain/transactions';
import { fromTransaction } from './domain/bookkeeping-record';
import { fromFile } from './domain/piano-student';

const fpReadFile = TE.tryCatchK(promisify(fs.readFile), toError);
const fpReadFileUTF = (path: string) =>
  fpReadFile(path, 'utf-8') as TE.TaskEither<Error, string>;

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
      fpReadFileUTF(path),
      TE.chainEitherK(fromCsvString),
      TE.map(applyFilters(filters)),
    );
  }

  getTransactionsWithMeta(
    path: string,
    filters: TransactionFilter[],
  ): TE.TaskEither<Err, Transactions> {
    return pipe(
      fpReadFileUTF(path),
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
        transactions.map(fromTransaction(students)),
      ),
    );
  }

  getPianoStudents(path: string): TE.TaskEither<Error, PianoStudentType[]> {
    return pipe(fpReadFileUTF(path), TE.chainEitherK(fromFile));
  }
}
