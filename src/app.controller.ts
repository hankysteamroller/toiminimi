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
import { Transactions } from './domain/types';
import { serialize } from './view/transactions.view';

const onError = (e: Err) => new InternalServerErrorException(e);
const onSuccess = (a: Transactions) => serialize(a);

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
    return service().then((a) => foldW(onError, onSuccess)(a));
  }
}
