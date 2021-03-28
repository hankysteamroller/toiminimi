import { Either, isRight } from 'fp-ts/Either';

export const getConfig = <L, A>(fa: Either<L, A>): A | never => {
  if (isRight(fa)) {
    return fa.right;
  } else {
    throw fa.left;
  }
};
