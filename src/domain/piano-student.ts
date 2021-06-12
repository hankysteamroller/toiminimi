import { Options } from 'csv-parse';

import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';

import { parseC } from '../utils/csv';
import { PianoStudent, PianoStudentType } from './types';

const pianoStudentCsvOptions: Options = {
  columns: true,
  delimiter: ';',
  relaxColumnCount: true,
};

function fromCsvRow(input: {
  oppilas?: unknown;
  maksaja?: unknown;
}): E.Either<Error, PianoStudentType> {
  const onErrors = (e: t.Errors) =>
    Error(
      `Parsing student ${JSON.stringify(input)} failed: ${JSON.stringify(e)}`,
    );
  return pipe(
    {
      studentName: input.oppilas,
      payerName: input.maksaja,
    },
    PianoStudent.decode,
    E.mapLeft(onErrors),
  );
}

function fromCsv(inputs: unknown[]): E.Either<Error, PianoStudentType[]> {
  return A.traverse(E.Applicative)(fromCsvRow)(inputs);
}

export function fromFile(path: string): E.Either<Error, PianoStudentType[]> {
  return pipe(path, parseC<unknown>(pianoStudentCsvOptions), E.chain(fromCsv));
}
