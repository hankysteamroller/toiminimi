import { Money, Percentage } from './types';

export function getTax(amount: Money, percentage: Percentage): Money {
  const percentageCoefficient = 1 + percentage / 100;
  return amount - amount / percentageCoefficient;
}
