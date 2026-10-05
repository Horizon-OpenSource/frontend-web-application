import { EmissionSummary } from './emission-summary.entity';

/**
 * Result of comparing two reporting periods.
 */
export interface PeriodComparison {
  base: EmissionSummary;
  target: EmissionSummary;
  deltaTonnesCo2e: number;
  deltaPercent: number;
}

/**
 * Compares the calculated emissions available for two periods.
 *
 * The comparison is possible when both periods contain at least
 * one calculated result.
 */
export function comparePeriods(
  base: EmissionSummary,
  target: EmissionSummary
): PeriodComparison | null {

  const baseTotal =
    base.totalTonnesCo2e;

  const targetTotal =
    target.totalTonnesCo2e;


  if (
    baseTotal === null ||
    targetTotal === null
  ) {
    return null;
  }


  const deltaTonnesCo2e =
    targetTotal - baseTotal;


  const deltaPercent =
    baseTotal === 0
      ? 0
      : (
      deltaTonnesCo2e /
      baseTotal
    ) * 100;


  return {
    base,
    target,
    deltaTonnesCo2e,
    deltaPercent
  };
}
