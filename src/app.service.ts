import { Inject, Injectable } from '@nestjs/common';

import { AppConfig } from './app.config';
import { APP_CONFIG } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    console.log(`AppService configured with ${JSON.stringify(config)}`);
  }

  getHello(): string {
    switch (this.config.helloTarget) {
      case 'earth':
        return 'Hello Earth!';
      case 'space':
        return 'Hello Space!';
      default:
        return 'Hello Ether!';
    }
  }
}
