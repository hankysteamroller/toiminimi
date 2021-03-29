import { Inject, Injectable } from '@nestjs/common';

import { AppConfig } from './app.config';
import { APP_CONFIG } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    console.log(`AppService configured with ${JSON.stringify(config)}`);
  }

  getHello(): string {
    return `${this.config.hello} ${this.config.target}`;
  }
}
