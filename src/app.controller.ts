import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { fold } from 'fp-ts/Either';

import { AppService } from './app.service';

const onError = (e: Error) => new InternalServerErrorException(e);
const onSuccess = (s: any) => s;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/file1')
  getFile1() {
    const service = this.appService.getFileService('./data/test.txt');
    return service().then((a) => fold(onError, onSuccess)(a));
  }

  @Get('/file2')
  getFile2() {
    return this.appService.getFileTraditional('./data/test.txt');
  }
}
