import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';

import { fold } from 'fp-ts/Either';

import { AppService } from './app.service';
import { Err } from './domain/transaction';
import { serialize } from './view/transaction.view';
import { Transaction } from './domain/types';

const onError = (e: Err) => new InternalServerErrorException(e);
const onSuccess = (as: any) => as.map(serialize);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/file/:name/:suffix')
  getFile1(@Param('name') name: string, @Param('suffix') suffix: string) {
    const service = this.appService.getFileService(`./data/${name}.${suffix}`);

    return service().then((a) => fold(onError, onSuccess)(a));
  }
}
