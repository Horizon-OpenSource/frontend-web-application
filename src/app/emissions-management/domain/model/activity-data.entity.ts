import { isNonBlank, isValidOrigin, isValidPeriod, isValidQuantity, UNIT_MAX_LENGTH } from './emission-validation';

export type ActivityDataOrigin = 'MANUAL' | 'CSV' | 'API';

export class ActivityData {
  readonly id: string;
  readonly emissionSourceId: string;
  readonly period: string;
  readonly quantity: number;
  readonly unit: string;
  readonly origin: ActivityDataOrigin;
  readonly recordedAt: string;

  constructor(activity: {
    id: string;
    emissionSourceId: string;
    period: string;
    quantity: number;
    unit: string;
    origin: ActivityDataOrigin;
    recordedAt: string;
  }) {
    if (!isNonBlank(activity.id, 128) || !isNonBlank(activity.emissionSourceId, 128)) {
      throw new Error('Activity and source identifiers are required.');
    }
    if (!isValidPeriod(activity.period)) {
      throw new Error('A valid reporting period in YYYY-MM format is required.');
    }
    if (!isValidQuantity(activity.quantity)) {
      throw new Error('Activity quantity must be finite and greater than zero.');
    }
    if (!isNonBlank(activity.unit, UNIT_MAX_LENGTH)) {
      throw new Error('A valid activity unit is required.');
    }
    if (!isValidOrigin(activity.origin)) {
      throw new Error('A valid activity origin is required.');
    }
    if (typeof activity.recordedAt !== 'string' || !Number.isFinite(Date.parse(activity.recordedAt))) {
      throw new Error('A valid recording date is required.');
    }

    this.id = activity.id.trim();
    this.emissionSourceId = activity.emissionSourceId.trim();
    this.period = activity.period;
    this.quantity = activity.quantity;
    this.unit = activity.unit.trim();
    this.origin = activity.origin;
    this.recordedAt = activity.recordedAt;
  }
}
