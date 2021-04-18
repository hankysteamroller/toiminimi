import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';

import { fold } from 'fp-ts/Either';

import { AppService } from './app.service';
import { Err } from './domain/transaction';
import { fromString } from './domain/transaction-filters';
import { serialize } from './view/transactions.view';

const onError = (e: Err) => new InternalServerErrorException(e);
const onSuccess = (a: any) => serialize(a) as any;

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
    return service().then((a) => fold(onError, onSuccess)(a));
  }
}
