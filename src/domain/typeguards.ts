import { isFinite } from 'lodash';

import { Money } from './types';

export const isMoney = (i: unknown): i is Money => isFinite(i);
