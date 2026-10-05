import { EMISSION_SCOPES, EmissionScope } from './emission-scope';

/**
 * Calculated emissions of one scope for a period, in tonnes of CO2e.
 * `null` means there is no calculation for that scope in the period (US-17, scenario 2).
 */
export interface ScopeEmission {
  scope: EmissionScope;
  tonnesCo2e: number | null;
}

/**
 * Aggregated carbon footprint of the organization for one reporting period.
 * Supports US-16 (total), US-17 (by scope) and US-26 (summary).
 */
export class EmissionSummary {
  constructor(
    public readonly periodId: string,
    public readonly scopes: readonly ScopeEmission[]
  ) {}

  /** True when at least one scope has a calculated value. */
  get hasData(): boolean {
    return this.scopes.some(scope => scope.tonnesCo2e !== null);
  }

  /** Total tonnes of CO2e, or null when the period has no calculations (US-16, scenario 2). */
  get totalTonnesCo2e(): number | null {
    if (!this.hasData) {
      return null;
    }
    return this.scopes.reduce((sum, scope) => sum + (scope.tonnesCo2e ?? 0), 0);
  }

  /** Scopes without calculated emissions, used to flag missing information (US-26, scenario 2). */
  get missingScopes(): EmissionScope[] {
    return this.scopes.filter(scope => scope.tonnesCo2e === null).map(scope => scope.scope);
  }

  tonnesFor(scope: EmissionScope): number | null {
    return this.scopes.find(item => item.scope === scope)?.tonnesCo2e ?? null;
  }

  /** Share of the total (0-100) for a scope, or null when it cannot be computed. */
  sharePercentFor(scope: EmissionScope): number | null {
    const total = this.totalTonnesCo2e;
    const value = this.tonnesFor(scope);
    if (total === null || total === 0 || value === null) {
      return null;
    }
    return (value / total) * 100;
  }

  /** Builds an empty summary (all scopes without data) for a period. */
  static empty(periodId: string): EmissionSummary {
    return new EmissionSummary(
      periodId,
      EMISSION_SCOPES.map(scope => ({ scope, tonnesCo2e: null }))
    );
  }
}
