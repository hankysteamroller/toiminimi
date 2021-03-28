import { Either, left, right } from 'fp-ts/Either';
import { isString } from 'lodash';

export type HelloTargetEnvValidationError = string;

export type AppConfigValidationError = HelloTargetEnvValidationError;

type HelloTargetConfig = 'earth' | 'space';
export interface AppConfig {
  helloTarget: HelloTargetConfig;
}

const isHelloTarget = (i: unknown): i is HelloTargetConfig =>
  isString(i) && ['earth', 'space'].includes(i);

export const createAppConfig: () => Either<
  AppConfigValidationError,
  AppConfig
> = () => {
  const val = process.env.HELLO_TARGET;
  if (isHelloTarget(val)) {
    return right({ helloTarget: val });
  } else {
    return left(
      'AppConfig: HELLO_TARGET environment variable validation failed',
    );
  }
};
