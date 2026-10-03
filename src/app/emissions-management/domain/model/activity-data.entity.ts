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
    if (!activity.emissionSourceId || !activity.period || !activity.unit.trim()) {
      throw new Error('Source, period and unit are required.');
    }
    if (!Number.isFinite(activity.quantity) || activity.quantity <= 0) {
      throw new Error('Activity quantity must be greater than zero.');
    }

    this.id = activity.id;
    this.emissionSourceId = activity.emissionSourceId;
    this.period = activity.period;
    this.quantity = activity.quantity;
    this.unit = activity.unit.trim();
    this.origin = activity.origin;
    this.recordedAt = activity.recordedAt;
  }
}
