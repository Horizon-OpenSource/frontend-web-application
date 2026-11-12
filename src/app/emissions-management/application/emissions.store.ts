import { computed, inject, Injectable, signal } from '@angular/core';
import { EmissionRecord, EmissionRecordInput } from '../domain/model/emission-record.model';
import { EmissionScope } from '../domain/model/emission-scope';
import { MockEmissionsRepository } from '../infrastructure/mock-emissions.repository';
import { normalizeSearchText } from './search-text';

@Injectable({ providedIn: 'root' })
export class EmissionsStore {
  private readonly repository = inject(MockEmissionsRepository);
  private readonly recordsSignal = signal<EmissionRecord[]>([]);
  private readonly searchSignal = signal('');
  private readonly scopeSignal = signal<EmissionScope | 'ALL'>('ALL');
  private readonly periodSignal = signal('ALL');
  private readonly sourceSignal = signal('ALL');

  readonly records = this.recordsSignal.asReadonly();
  readonly search = this.searchSignal.asReadonly();
  readonly scope = this.scopeSignal.asReadonly();
  readonly period = this.periodSignal.asReadonly();
  readonly source = this.sourceSignal.asReadonly();
  readonly facilities = this.repository.facilities;
  readonly storageKey = this.repository.storageKey;

  readonly periods = computed(() =>
    [...new Set(this.recordsSignal().map(record => record.activityData.period))].sort().reverse()
  );

  readonly sourceOptions = computed(() =>
    [...new Set(this.recordsSignal().map(record => record.source.name))].sort()
  );

  readonly filteredRecords = computed(() => {
    const term = normalizeSearchText(this.searchSignal());
    const scope = this.scopeSignal();
    const period = this.periodSignal();
    const source = this.sourceSignal();

    return this.recordsSignal().filter(record => {
      const searchable = normalizeSearchText([
        record.source.name,
        record.source.type,
        record.source.facilityName,
        record.source.scope.replace('_', ' '),
        record.activityData.period,
        record.activityData.unit,
        record.activityData.origin
      ].join(' '));

      return (!term || searchable.includes(term))
        && (scope === 'ALL' || record.source.scope === scope)
        && (period === 'ALL' || record.activityData.period === period)
        && (source === 'ALL' || record.source.name === source);
    });
  });

  readonly totalRecords = computed(() => this.recordsSignal().length);
  readonly scope1Count = computed(() => this.countByScope(EmissionScope.Scope1));
  readonly scope2Count = computed(() => this.countByScope(EmissionScope.Scope2));
  readonly scope3Count = computed(() => this.countByScope(EmissionScope.Scope3));

  load(): void {
    this.recordsSignal.set(this.repository.getAll());
    if (this.periodSignal() !== 'ALL' && !this.periods().includes(this.periodSignal())) {
      this.periodSignal.set('ALL');
    }
    if (this.sourceSignal() !== 'ALL' && !this.sourceOptions().includes(this.sourceSignal())) {
      this.sourceSignal.set('ALL');
    }
  }

  setSearch(value: string): void {
    this.searchSignal.set(value);
  }

  setScope(value: EmissionScope | 'ALL'): void {
    this.scopeSignal.set(value);
  }

  setPeriod(value: string): void {
    this.periodSignal.set(value);
  }

  setSource(value: string): void {
    this.sourceSignal.set(value);
  }

  clearFilters(): void {
    this.searchSignal.set('');
    this.scopeSignal.set('ALL');
    this.periodSignal.set('ALL');
    this.sourceSignal.set('ALL');
  }

  create(input: EmissionRecordInput): void {
    this.repository.create(input);
    this.load();
  }

  update(activityDataId: string, input: EmissionRecordInput): void {
    this.repository.update(activityDataId, input);
    this.load();
  }

  delete(activityDataId: string): void {
    this.repository.delete(activityDataId);
    this.load();
  }

  resetDemoData(): void {
    this.recordsSignal.set(this.repository.reset());
    this.clearFilters();
  }

  private countByScope(scope: EmissionScope): number {
    return this.recordsSignal().filter(record => record.source.scope === scope).length;
  }
}
