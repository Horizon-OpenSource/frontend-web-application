import { TestBed } from '@angular/core/testing';
import { EmissionsStore } from './emissions.store';
import { EmissionScope } from '../domain/model/emission-scope';
import { EmissionRecordInput } from '../domain/model/emission-record.model';

describe('EmissionsStore', () => {
  let store: EmissionsStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(EmissionsStore);
    store.load();
  });

  it('loads the demonstration records grouped across all scopes', () => {
    expect(store.totalRecords()).toBe(6);
    expect(store.scope1Count()).toBe(2);
    expect(store.scope2Count()).toBe(2);
    expect(store.scope3Count()).toBe(2);
  });

  it('filters records by search, scope and period', () => {
    store.setSearch('electricity');
    expect(store.filteredRecords()).toHaveLength(2);

    store.setScope(EmissionScope.Scope2);
    store.setPeriod('2026-01');
    expect(store.filteredRecords()).toHaveLength(1);
    expect(store.filteredRecords()[0].source.name).toBe('Purchased electricity');
  });

  it('creates, updates and deletes an emission record', () => {
    const input: EmissionRecordInput = {
      sourceName: 'Emergency generator',
      sourceType: 'Stationary combustion',
      facilityId: 'facility-lima',
      facilityName: 'Lima Production Plant',
      scope: EmissionScope.Scope1,
      quantity: 300,
      unit: 'L',
      period: '2026-04',
      origin: 'MANUAL'
    };

    store.create(input);
    const created = store.records().at(-1)!;
    expect(store.totalRecords()).toBe(7);

    store.update(created.activityData.id, { ...input, quantity: 450 });
    expect(store.records().at(-1)?.activityData.quantity).toBe(450);

    store.delete(created.activityData.id);
    expect(store.totalRecords()).toBe(6);
  });
});
