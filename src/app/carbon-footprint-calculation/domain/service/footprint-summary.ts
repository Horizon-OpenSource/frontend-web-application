import { FOOTPRINT_SCOPES } from '../model/footprint-scope';
import { FootprintCalculation, roundCo2e } from '../model/footprint-calculation.entity';
import { CalculationHistoryEntry, ScopeResult } from '../model/footprint-summary.model';

function sumOf(calculations: readonly FootprintCalculation[]): number {
  return roundCo2e(calculations.reduce((sum, calculation) => sum + calculation.resultValue, 0));
}

/** Total footprint of the given calculations, or null when there are none. */
export function totalOf(calculations: readonly FootprintCalculation[]): number | null {
  return calculations.length ? sumOf(calculations) : null;
}

/** Splits the results by scope. A scope without results has a null total. */
export function summarizeByScope(calculations: readonly FootprintCalculation[]): ScopeResult[] {
  return FOOTPRINT_SCOPES.map((scope) => {
    const matching = calculations.filter((calculation) => calculation.scope === scope);
    return { scope, records: matching.length, total: totalOf(matching) };
  });
}

/** One entry per calculated period, most recent period first. */
export function buildHistory(
  calculations: readonly FootprintCalculation[],
): CalculationHistoryEntry[] {
  const byPeriod = new Map<string, FootprintCalculation[]>();
  for (const calculation of calculations) {
    byPeriod.set(calculation.period, [...(byPeriod.get(calculation.period) ?? []), calculation]);
  }

  return [...byPeriod.entries()]
    .map(([period, items]) => ({
      period,
      records: items.length,
      total: sumOf(items),
      calculatedAt: items.reduce(
        (latest, item) => (item.calculatedAt > latest ? item.calculatedAt : latest),
        '',
      ),
    }))
    .sort((a, b) => b.period.localeCompare(a.period));
}
