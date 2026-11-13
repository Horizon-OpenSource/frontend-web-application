import { FootprintScope } from './footprint-scope';

/** Footprint of one scope in a period. `total` is null when the scope has no results. */
export interface ScopeResult {
  readonly scope: FootprintScope;
  readonly total: number | null;
  readonly records: number;
}

/** One previously calculated period. */
export interface CalculationHistoryEntry {
  readonly period: string;
  readonly calculatedAt: string;
  readonly records: number;
  readonly total: number;
}
