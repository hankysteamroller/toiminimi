import * as fs from 'fs';
import { promisify } from 'util';

import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';

const readFileTE = TE.tryCatchK(promisify(fs.readFile), E.toError);
export const readFile = (path: string) =>
  readFileTE(path, 'utf-8') as TE.TaskEither<Error, string>;

const writeFileTE = TE.tryCatchK(promisify(fs.writeFile), E.toError);
export const writeFile = (path: string) => (content: string) =>
  writeFileTE(path, content, 'utf-8');
