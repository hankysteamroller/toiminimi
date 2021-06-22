import {
  Controller,
  BadRequestException,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import * as E from 'fp-ts/Either';

import { AppService } from './app.service';
import { fromString } from './domain/transaction-filters';
import { serialize as serializeTransactions } from './view/transactions.view';

const onError = <E>(e: E) => new BadRequestException(e);
const serialize = <T>(a: T[]) => a;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/transactions/:name/:suffix')
  getTransactions(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
    @Query('filters') filters: string,
  ) {
    return this.appService
      .getTransactionsWithMeta(
        `./data/${name}.${suffix}`,
        fromString(filters),
      )()
      .then(E.foldW(onError, serializeTransactions));
  }

  @Get('/records/:name/:suffix')
  getBookkeepingRecords(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
    @Query('filters') filters: string,
  ) {
    return this.appService
      .getBookkeepingRecords(`./data/${name}.${suffix}`, fromString(filters))()
      .then(E.foldW(onError, serialize));
  }

  @Get('/records/save/:name/:suffix')
  saveBookkeepingRecords(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
    @Query('filters') filters: string,
  ) {
    return this.appService
      .saveBookkeepingRecords(`./data/${name}.${suffix}`, fromString(filters))()
      .then(E.foldW(onError, serialize));
  }

  @Get('pianostudents/:name/:suffix')
  getPianoStudents(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
  ) {
    return this.appService
      .getPianoStudents(`data/${name}.${suffix}`)()
      .then(E.foldW(onError, serialize));
  }
}
