import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';

import { fold } from 'fp-ts/Either';

import { AppService } from './app.service';

const onError = (e: Error) => new InternalServerErrorException(e);
const onSuccess = (s: any) => s;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/file/:name/:suffix')
  getFile1(@Param('name') name: string, @Param('suffix') suffix: string) {
    const service = this.appService.getFileService(`./data/${name}.${suffix}`);
    return service().then((a) => fold(onError, onSuccess)(a));
  }
}
