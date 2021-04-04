import { chain, Either, left, map, right } from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { has, isString } from 'lodash';

export type EnvValidationError = string;

type HelloConfig = 'hello' | 'hi';
type TargetConfig = 'earth' | 'space';

interface RawAppConfig {
  HELLO: HelloConfig;
  TARGET: TargetConfig;
}
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

const validateHelloConfig: (
  c: unknown,
) => Either<EnvValidationError, unknown> = (c: unknown) =>
  hasHello(c) && isHello(c.HELLO)
    ? right(c)
    : left('AppConfig: HELLO environment variable validation failed');

const validateTargetConfig: (
  c: unknown,
) => Either<EnvValidationError, unknown> = (c: unknown) =>
  hasTarget(c) && isTarget(c.TARGET)
    ? right(c)
    : left('AppConfig: TARGET environment variable validation failed');

const validateAppConfig: (c: unknown) => Either<EnvValidationError, unknown> = (
  c: unknown,
) => pipe(validateHelloConfig(c), chain(validateTargetConfig));

const toAppConfig: (c: unknown) => AppConfig = (c: unknown) => {
  const c2 = c as RawAppConfig;
  return {
    hello: c2.HELLO,
    target: c2.TARGET,
  };
};

export const createAppConfig: (
  config: unknown,
) => Either<EnvValidationError, AppConfig> = (config: unknown) =>
  pipe(validateAppConfig(config), map(toAppConfig));
