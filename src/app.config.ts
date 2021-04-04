import {
  getApplicativeValidation,
  Either,
  left,
  map,
  mapLeft,
  right,
} from 'fp-ts/Either';
import { getSemigroup, NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { pipe } from 'fp-ts/pipeable';
import { has, isString } from 'lodash';
import { sequenceT } from 'fp-ts/Apply';

export type EnvValidationError = string;

type HelloConfig = 'hello' | 'hi';
type TargetConfig = 'earth' | 'space';

export interface AppConfig {
  hello: HelloConfig;
  target: TargetConfig;
}

const hasHello = (c: unknown): c is { HELLO: unknown } => has(c, 'HELLO');

const isHello = (c: unknown): c is HelloConfig =>
  isString(c) && ['hello', 'hi'].includes(c);

const hasTarget = (c: unknown): c is { TARGET: unknown } => has(c, 'TARGET');

const isTarget = (c: unknown): c is TargetConfig =>
  isString(c) && ['earth', 'space'].includes(c);

const parseHelloConfig: (
  c: unknown,
) => Either<EnvValidationError, HelloConfig> = (c: unknown) =>
  hasHello(c) && isHello(c.HELLO)
    ? right(c.HELLO)
    : left('AppConfig: HELLO environment variable validation failed');

const parseTargetConfig: (
  c: unknown,
) => Either<EnvValidationError, TargetConfig> = (c: unknown) =>
  hasTarget(c) && isTarget(c.TARGET)
    ? right(c.TARGET)
    : left('AppConfig: TARGET environment variable validation failed');

const toAppConfig: ([hello, target]: [
  HelloConfig,
  TargetConfig,
]) => AppConfig = ([hello, target]: [HelloConfig, TargetConfig]) => ({
  hello,
  target,
});

function liftToArrayOfErrs<E, A>(
  check: (a: A) => Either<E, A>,
): (a: A) => Either<NonEmptyArray<E>, A> {
  return (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a]),
    );
}

const validateHelloConfigL = liftToArrayOfErrs(parseHelloConfig);
const validateTargetConfigL = liftToArrayOfErrs(parseTargetConfig);

const applicativeValidation = getApplicativeValidation(
  getSemigroup<EnvValidationError>(),
);

export const createAppConfig: (
  config: unknown,
) => Either<NonEmptyArray<EnvValidationError>, AppConfig> = (config: unknown) =>
  pipe(
    sequenceT(applicativeValidation)(
      validateHelloConfigL(config),
      validateTargetConfigL(config),
    ),
    map(toAppConfig),
  );
