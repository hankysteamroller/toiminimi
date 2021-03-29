import { chain, Either, left, right } from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { isString } from 'lodash';

export type EnvValidationError = string;

type HelloConfig = 'hello' | 'hi';
type TargetConfig = 'earth' | 'space';

export interface AppConfig {
  hello: HelloConfig;
  target: TargetConfig;
}

const isHello = (i: unknown): i is HelloConfig =>
  isString(i) && ['hello', 'hi'].includes(i);

const isTarget = (i: unknown): i is TargetConfig =>
  isString(i) && ['earth', 'space'].includes(i);

const createHelloConfig: () => Either<
  EnvValidationError,
  Omit<AppConfig, 'target'>
> = () => {
  const val = process.env.HELLO;
  if (isHello(val)) {
    return right({ hello: val });
  } else {
    return left('AppConfig: HELLO environment variable validation failed');
  }
};

const createTargetConfig: (
  hc: Omit<AppConfig, 'target'>,
) => Either<EnvValidationError, AppConfig> = (
  hc: Omit<AppConfig, 'target'>,
) => {
  const val = process.env.TARGET;
  if (isTarget(val)) {
    return right({ ...hc, target: val });
  } else {
    return left('AppConfig: TARGET environment variable validation failed');
  }
};

export const createAppConfig: () => Either<
  EnvValidationError,
  AppConfig
> = () => pipe(createHelloConfig(), chain(createTargetConfig));
