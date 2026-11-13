import type { ActivityDataOrigin } from './activity-data.entity';
import { EmissionScope } from './emission-scope';

export const SOURCE_NAME_MAX_LENGTH = 120;
export const SOURCE_TYPE_MAX_LENGTH = 100;
export const UNIT_MAX_LENGTH = 20;

export function isNonBlank(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function isValidPeriod(value: unknown): value is string {
  return typeof value === 'string' && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function isValidQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isValidScope(value: unknown): value is EmissionScope {
  return Object.values(EmissionScope).some(scope => scope === value);
}

export function isValidOrigin(value: unknown): value is ActivityDataOrigin {
  return value === 'MANUAL' || value === 'CSV' || value === 'API';
}
