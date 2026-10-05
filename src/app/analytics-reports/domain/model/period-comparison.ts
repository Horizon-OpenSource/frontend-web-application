import { EmissionSummary } from './emission-summary.entity';

/**
 * Result of comparing two periods (US-20).
 */
export interface PeriodComparison {
  base: EmissionSummary;
  target: EmissionSummary;
  deltaTonnesCo2e: number;
  deltaPercent: number;
}

/**
 * Compares two summaries. Returns null when either period has no calculated
 * results, so the UI can report insufficient data (US-20, scenario 2).
 */
export function comparePeriods(
  base: EmissionSummary,
  target: EmissionSummary
): PeriodComparison | null {
  if (base.missingScopes.length || target.missingScopes.length) {
    return null;
  }
  const baseTotal = base.totalTonnesCo2e;
  const targetTotal = target.totalTonnesCo2e;
  if (baseTotal === null || targetTotal === null || baseTotal === 0) {
    return null;
  }
  const deltaTonnesCo2e = targetTotal - baseTotal;
  return {
    base,
    target,
    deltaTonnesCo2e,
    deltaPercent: (deltaTonnesCo2e / baseTotal) * 100
  };
}
