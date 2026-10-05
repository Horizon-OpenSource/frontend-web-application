import { FootprintScope } from './footprint-scope';

export const CO2E_UNIT = 'kgCO₂e';

export function roundCo2e(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Result of applying one emission factor to one activity data record. */
export class FootprintCalculation {
  readonly id: string;
  readonly activityDataId: string;
  readonly emissionFactorId: string;
  readonly sourceName: string;
  readonly factorName: string;
  readonly scope: FootprintScope;
  readonly period: string;
  readonly quantity: number;
  readonly unit: string;
  readonly factorValue: number;
  /** Emissions expressed in kgCO₂e. */
  readonly resultValue: number;
  readonly calculatedAt: string;

  constructor(calculation: {
    id: string;
    activityDataId: string;
    emissionFactorId: string;
    sourceName: string;
    factorName: string;
    scope: FootprintScope;
    period: string;
    quantity: number;
    unit: string;
    factorValue: number;
    resultValue: number;
    calculatedAt: string;
  }) {
    if (!calculation.activityDataId || !calculation.emissionFactorId || !calculation.period) {
      throw new Error('Activity data, emission factor and period are required.');
    }
    if (!Number.isFinite(calculation.quantity) || calculation.quantity <= 0) {
      throw new Error('Calculation quantity must be greater than zero.');
    }
    if (!Number.isFinite(calculation.factorValue) || calculation.factorValue <= 0) {
      throw new Error('Calculation factor value must be greater than zero.');
    }
    if (!Number.isFinite(calculation.resultValue) || calculation.resultValue < 0) {
      throw new Error('Calculation result must be a non-negative number.');
    }

    this.id = calculation.id;
    this.activityDataId = calculation.activityDataId;
    this.emissionFactorId = calculation.emissionFactorId;
    this.sourceName = calculation.sourceName;
    this.factorName = calculation.factorName;
    this.scope = calculation.scope;
    this.period = calculation.period;
    this.quantity = calculation.quantity;
    this.unit = calculation.unit;
    this.factorValue = calculation.factorValue;
    this.resultValue = calculation.resultValue;
    this.calculatedAt = calculation.calculatedAt;
  }
}
