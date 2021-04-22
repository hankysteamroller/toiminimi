import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';

import { foldW } from 'fp-ts/Either';

import { AppService } from './app.service';
import { Err } from './domain/transaction';
import { fromString } from './domain/transaction-filters';
import { BookkeepingRecord, Transactions } from './domain/types';
import { serialize } from './view/transactions.view';

const onError = (e: Err) => new InternalServerErrorException(e);
const serializeTransactions = (a: Transactions) => serialize(a);
const serializeBookkeepingRecords = (a: BookkeepingRecord[]) => a;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/transactions/:name/:suffix')
  getTransactions(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
    @Query('filters') filters: string,
  ) {
    const transactionFilters = fromString(filters);
    const service = this.appService.getTransactions(
      `./data/${name}.${suffix}`,
      transactionFilters,
    );
    return service().then((a) => foldW(onError, serializeTransactions)(a));
  }

  @Get('/records/:name/:suffix')
  getBookkeepingRecords(
    @Param('name') name: string,
    @Param('suffix') suffix: string,
    @Query('filters') filters: string,
  ) {
    const transactionFilters = fromString(filters);
    const service = this.appService.getBookkeepingRecords(
      `./data/${name}.${suffix}`,
      transactionFilters,
    );
    return service().then((a) =>
      foldW(onError, serializeBookkeepingRecords)(a),
    );
  }
}
