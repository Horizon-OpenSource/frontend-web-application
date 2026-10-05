import { computed, inject, Injectable, signal } from '@angular/core';
import { EmissionRecord, EmissionRecordInput } from '../domain/model/emission-record.model';
import { EmissionScope } from '../domain/model/emission-scope';
import { MockEmissionsRepository } from '../infrastructure/mock-emissions.repository';

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

  readonly periods = computed(() =>
    [...new Set(this.recordsSignal().map(record => record.activityData.period))].sort().reverse()
  );

  readonly sourceOptions = computed(() =>
    [...new Set(this.recordsSignal().map(record => record.source.name))].sort()
  );

  readonly filteredRecords = computed(() => {
    const term = this.searchSignal().trim().toLowerCase();
    const scope = this.scopeSignal();
    const period = this.periodSignal();
    const source = this.sourceSignal();

    return this.recordsSignal().filter(record => {
      const searchable = [
        record.source.name,
        record.source.type,
        record.source.facilityName,
        record.activityData.unit,
        record.activityData.origin
      ].join(' ').toLowerCase();

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
    const record = this.repository.create(input);
    this.recordsSignal.update(records => [...records, record]);
  }

  update(activityDataId: string, input: EmissionRecordInput): void {
    const updated = this.repository.update(activityDataId, input);
    this.recordsSignal.update(records =>
      records.map(record => record.activityData.id === activityDataId ? updated : record)
    );
  }

  delete(activityDataId: string): void {
    this.repository.delete(activityDataId);
    this.recordsSignal.update(records =>
      records.filter(record => record.activityData.id !== activityDataId)
    );
  }

  resetDemoData(): void {
    this.recordsSignal.set(this.repository.reset());
    this.clearFilters();
  }

  private countByScope(scope: EmissionScope): number {
    return this.recordsSignal().filter(record => record.source.scope === scope).length;
  }
}
