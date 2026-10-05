import { FootprintCalculation } from './footprint-calculation.entity';

export type PendingReason =
  'NO_ACTIVITY_DATA' | 'MISSING_INFORMATION' | 'MISSING_FACTOR' | 'INCOMPATIBLE_FACTOR';

/** Something that prevents a calculation from being completed. */
export interface PendingIssue {
  readonly reason: PendingReason;
  readonly activityDataId?: string;
  readonly sourceName?: string;
}

export interface CompletedCalculation {
  readonly status: 'COMPLETED';
  readonly period: string;
  readonly calculations: readonly FootprintCalculation[];
  readonly total: number;
}

export interface IncompleteCalculation {
  readonly status: 'INCOMPLETE';
  readonly period: string;
  readonly pending: readonly PendingIssue[];
}

export type CalculationOutcome = CompletedCalculation | IncompleteCalculation;
