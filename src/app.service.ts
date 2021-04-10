import * as fs from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { promisify } from 'util';

import { pipe } from 'fp-ts/pipeable';
import { fromEither, chain, TaskEither, tryCatchK } from 'fp-ts/TaskEither';
import { toError } from 'fp-ts/Either';

import { AppConfig } from './app.config';
import { APP_CONFIG } from './constants';
import { fromCsvString } from './domain/transaction';

async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

const fpReadFile = tryCatchK(promisify(fs.readFile), toError);
const fpReadFileUTF = (path: string) =>
  fpReadFile(path, 'utf-8') as TaskEither<Error, string>;

@Injectable()
export class AppService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    console.log(`AppService configured with ${JSON.stringify(config)}`);
  }

  getFileService(path: string): TaskEither<Error, string> {
    return pipe(
      fpReadFileUTF(path),
      chain((i) => fromEither(fromCsvString(i))),
    );
  }

  getFileTraditional(path: string): Promise<string> {
    return readFile(path);
  }
}
