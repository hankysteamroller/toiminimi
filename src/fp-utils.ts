import { Either, mapLeft } from 'fp-ts/Either';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { pipe } from 'fp-ts/pipeable';

export const trace = <T>(i: T) => {
  console.log(`${JSON.stringify(i)}`);
  return i;
};

export function liftToArrayOfErrs<E, A>(
  check: (a: A) => Either<E, A>,
): (a: A) => Either<NonEmptyArray<E>, A> {
  return (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a]),
    );
}

export function liftToArrayOfErrs2<E, A, B>(
  check: (a: A) => Either<E, B>,
): (a: A) => Either<NonEmptyArray<E>, B> {
  return (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a]),
    );
}
