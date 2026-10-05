import { ActivityDataItem } from './activity-data-item.model';
import { FootprintScope } from './footprint-scope';

export class EmissionFactor {
  readonly id: string;
  readonly name: string;
  readonly scope: FootprintScope;
  /** Unit of activity data this factor converts, for example kWh, L or km. */
  readonly unit: string;
  /** kgCO₂e emitted for each one `unit` of activity data. */
  readonly value: number;
  readonly source: string;

  constructor(factor: {
    id: string;
    name: string;
    scope: FootprintScope;
    unit: string;
    value: number;
    source: string;
  }) {
    if (!factor.id.trim() || !factor.name.trim() || !factor.unit.trim()) {
      throw new Error('Emission factor id, name and unit are required.');
    }
    if (!Object.values(FootprintScope).includes(factor.scope)) {
      throw new Error('A valid emission scope is required.');
    }
    if (!Number.isFinite(factor.value) || factor.value <= 0) {
      throw new Error('Emission factor value must be greater than zero.');
    }

    this.id = factor.id;
    this.name = factor.name.trim();
    this.scope = factor.scope;
    this.unit = factor.unit.trim();
    this.value = factor.value;
    this.source = factor.source;
  }

  /** A factor is compatible when it applies to the same scope and the same unit as the activity data. */
  isCompatibleWith(activity: Pick<ActivityDataItem, 'scope' | 'unit'>): boolean {
    return (
      this.scope === activity.scope && normalizeUnit(this.unit) === normalizeUnit(activity.unit)
    );
  }
}

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}
