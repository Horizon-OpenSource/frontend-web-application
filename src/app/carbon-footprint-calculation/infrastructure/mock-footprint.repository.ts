import { Service } from '@angular/core';
import { ActivityDataItem } from '../domain/model/activity-data-item.model';
import { EmissionFactor } from '../domain/model/emission-factor.entity';
import { FootprintCalculation } from '../domain/model/footprint-calculation.entity';
import { FootprintScope } from '../domain/model/footprint-scope';
import { FootprintRepository } from '../domain/repository/footprint.repository';
import { calculateFootprint } from '../domain/service/footprint-calculator';

const STORAGE_KEY = 'ecotrack-footprint-state';
const DEMO_FACTOR_SOURCE = 'Illustrative demo value';

/**
 * Activity data used by the demonstration. It has the same shape as the records that
 * Emissions Management registers, so it can be replaced by the real source later.
 *
 * - 2026-06: already calculated, without Scope 3 data (a scope without results).
 * - 2026-08: ready to calculate, covers the three scopes.
 * - 2026-09: one record has no emission factor (the calculation cannot be completed).
 */
const ACTIVITY_DATA: readonly ActivityDataItem[] = [
  activity(
    'act-101',
    'src-101',
    'Delivery fleet',
    'Callao Logistics Center',
    FootprintScope.Scope1,
    '2026-06',
    3200,
    'L',
  ),
  activity(
    'act-102',
    'src-102',
    'Purchased electricity',
    'Lima Production Plant',
    FootprintScope.Scope2,
    '2026-06',
    41800,
    'kWh',
  ),
  activity(
    'act-201',
    'src-201',
    'Diesel generator',
    'Arequipa Plant',
    FootprintScope.Scope1,
    '2026-08',
    850,
    'L',
  ),
  activity(
    'act-202',
    'src-202',
    'Purchased electricity',
    'Lima Production Plant',
    FootprintScope.Scope2,
    '2026-08',
    12500,
    'kWh',
  ),
  activity(
    'act-203',
    'src-203',
    'Business air travel',
    'Corporate Office',
    FootprintScope.Scope3,
    '2026-08',
    18750,
    'km',
  ),
  activity(
    'act-301',
    'src-301',
    'Natural gas boiler',
    'Lima Production Plant',
    FootprintScope.Scope1,
    '2026-09',
    1250,
    'm³',
  ),
  activity(
    'act-302',
    'src-302',
    'Purchased electricity',
    'Lima Production Plant',
    FootprintScope.Scope2,
    '2026-09',
    13400,
    'kWh',
  ),
];

/** Illustrative values only; they are not official emission factors. */
const EMISSION_FACTORS: readonly EmissionFactor[] = [
  factor('factor-diesel', 'Diesel combustion', FootprintScope.Scope1, 'L', 2.68),
  factor('factor-gasoline', 'Gasoline combustion', FootprintScope.Scope1, 'L', 2.31),
  factor('factor-natural-gas', 'Natural gas combustion', FootprintScope.Scope1, 'm³', 2),
  factor('factor-grid', 'Grid electricity', FootprintScope.Scope2, 'kWh', 0.25),
  factor('factor-renewable', 'Renewable electricity contract', FootprintScope.Scope2, 'kWh', 0.02),
  factor('factor-air-travel', 'Air travel', FootprintScope.Scope3, 'km', 0.15),
];

const SEED_ASSIGNMENTS: Readonly<Record<string, string>> = {
  'act-101': 'factor-diesel',
  'act-102': 'factor-grid',
  'act-201': 'factor-diesel',
  'act-202': 'factor-grid',
  'act-203': 'factor-air-travel',
  'act-302': 'factor-grid',
};

interface StoredState {
  assignments: Record<string, string>;
  calculations: FootprintCalculation[];
}

@Service({ autoProvided: false })
export class MockFootprintRepository extends FootprintRepository {
  async getActivityData(): Promise<ActivityDataItem[]> {
    return [...ACTIVITY_DATA];
  }

  async getEmissionFactors(): Promise<EmissionFactor[]> {
    return [...EMISSION_FACTORS];
  }

  async getAssignments(): Promise<Record<string, string>> {
    return { ...this.read().assignments };
  }

  async saveAssignment(activityDataId: string, emissionFactorId: string | null): Promise<void> {
    const state = this.read();
    if (emissionFactorId) {
      state.assignments[activityDataId] = emissionFactorId;
    } else {
      delete state.assignments[activityDataId];
    }
    this.write(state);
  }

  async getCalculations(): Promise<FootprintCalculation[]> {
    return [...this.read().calculations];
  }

  async replaceCalculations(
    period: string,
    calculations: readonly FootprintCalculation[],
  ): Promise<void> {
    const state = this.read();
    state.calculations = [
      ...state.calculations.filter((item) => item.period !== period),
      ...calculations,
    ];
    this.write(state);
  }

  async clearCalculations(): Promise<void> {
    const state = this.read();
    state.calculations = [];
    this.write(state);
  }

  async reset(): Promise<void> {
    this.write(seedState());
  }

  private read(): StoredState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const seed = seedState();
      this.write(seed);
      return seed;
    }

    try {
      const parsed = JSON.parse(stored) as StoredState;
      return {
        assignments: { ...parsed.assignments },
        calculations: parsed.calculations.map(
          (calculation) => new FootprintCalculation(calculation),
        ),
      };
    } catch {
      const seed = seedState();
      this.write(seed);
      return seed;
    }
  }

  private write(state: StoredState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function seedState(): StoredState {
  let sequence = 0;
  const outcome = calculateFootprint('2026-06', ACTIVITY_DATA, SEED_ASSIGNMENTS, EMISSION_FACTORS, {
    calculatedAt: '2026-07-02T09:00:00.000Z',
    newId: () => `calc-seed-${++sequence}`,
  });

  return {
    assignments: { ...SEED_ASSIGNMENTS },
    calculations: outcome.status === 'COMPLETED' ? [...outcome.calculations] : [],
  };
}

function activity(
  id: string,
  emissionSourceId: string,
  sourceName: string,
  facilityName: string,
  scope: FootprintScope,
  period: string,
  quantity: number,
  unit: string,
): ActivityDataItem {
  return { id, emissionSourceId, sourceName, facilityName, scope, period, quantity, unit };
}

function factor(
  id: string,
  name: string,
  scope: FootprintScope,
  unit: string,
  value: number,
): EmissionFactor {
  return new EmissionFactor({ id, name, scope, unit, value, source: DEMO_FACTOR_SOURCE });
}
