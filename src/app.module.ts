import { Module } from '@nestjs/common';

import { APP_CONFIG } from './constants';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createAppConfig } from './app.config';
import { getConfig } from './config';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    {
      provide: APP_CONFIG,
      useValue: getConfig(createAppConfig(process.env)),
    },
    AppService,
  ],
})
export class AppModule {}
