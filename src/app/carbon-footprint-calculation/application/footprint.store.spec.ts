import { TestBed } from '@angular/core/testing';
import { FootprintRepository } from '../domain/repository/footprint.repository';
import { FootprintScope } from '../domain/model/footprint-scope';
import { MockFootprintRepository } from '../infrastructure/mock-footprint.repository';
import { FootprintStore } from './footprint.store';

describe('FootprintStore', () => {
  let store: FootprintStore;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        FootprintStore,
        { provide: FootprintRepository, useClass: MockFootprintRepository },
      ],
    });
    store = TestBed.inject(FootprintStore);
    await store.load();
  });

  it('loads the periods, most recent first, and selects the latest one', () => {
    expect(store.periods()).toEqual(['2026-09', '2026-08', '2026-06']);
    expect(store.period()).toBe('2026-09');
  });

  describe('US-34 calculate the carbon footprint', () => {
    it('calculates a period whose records all have an emission factor', async () => {
      store.selectPeriod('2026-08');

      const outcome = await store.calculate();

      expect(outcome.status).toBe('COMPLETED');
      expect(store.completedTotal()).toBe(8215.5);
      expect(store.periodTotal()).toBe(8215.5);
      expect(store.pendingIssues()).toEqual([]);
    });

    it('does not complete when a record has no factor and says which one is pending', async () => {
      store.selectPeriod('2026-09');

      const outcome = await store.calculate();

      expect(outcome.status).toBe('INCOMPLETE');
      expect(store.pendingIssues()).toEqual([
        { reason: 'MISSING_FACTOR', activityDataId: 'act-301', sourceName: 'Natural gas boiler' },
      ]);
      expect(store.periodTotal()).toBeNull();
      expect(store.completedTotal()).toBeNull();
    });

    it('completes after the missing factor is selected', async () => {
      store.selectPeriod('2026-09');
      await store.calculate();

      await store.assignFactor('act-301', 'factor-natural-gas');
      const outcome = await store.calculate();

      expect(outcome.status).toBe('COMPLETED');
      expect(store.periodTotal()).toBe(5850);
    });

    it('stores the calculation so it survives a reload', async () => {
      store.selectPeriod('2026-08');
      await store.calculate();

      await store.load();

      expect(store.periodTotal()).toBe(8215.5);
    });
  });

  describe('US-46 select the emission factor', () => {
    it('offers only factors with the same scope and unit as the activity data', () => {
      store.selectPeriod('2026-09');
      const gas = store.rows().find((row) => row.activity.id === 'act-301');
      const electricity = store.rows().find((row) => row.activity.id === 'act-302');

      expect(gas?.compatibleFactors.map((factor) => factor.id)).toEqual(['factor-natural-gas']);
      expect(electricity?.compatibleFactors.map((factor) => factor.id)).toEqual([
        'factor-grid',
        'factor-renewable',
      ]);
    });

    it('marks records without a factor as pending and the others as ready', () => {
      store.selectPeriod('2026-09');

      expect(store.rows().map((row) => row.issue)).toEqual(['MISSING_FACTOR', null]);
    });

    it('lets the user change or remove the selected factor', async () => {
      store.selectPeriod('2026-09');

      await store.assignFactor('act-302', 'factor-renewable');
      expect(store.rows().find((row) => row.activity.id === 'act-302')?.factor?.id).toBe(
        'factor-renewable',
      );

      await store.assignFactor('act-302', null);
      expect(store.rows().find((row) => row.activity.id === 'act-302')?.issue).toBe(
        'MISSING_FACTOR',
      );
    });
  });

  describe('US-35 results by scope', () => {
    it('shows the total of each scope in a calculated period', async () => {
      store.selectPeriod('2026-08');
      await store.calculate();

      expect(store.scopeResults().map((result) => [result.scope, result.total])).toEqual([
        [FootprintScope.Scope1, 2278],
        [FootprintScope.Scope2, 3125],
        [FootprintScope.Scope3, 2812.5],
      ]);
    });

    it('leaves a scope without data as having no results', () => {
      store.selectPeriod('2026-06');

      expect(store.scopeResults().map((result) => result.total)).toEqual([8576, 10450, null]);
    });
  });

  describe('US-36 results by period', () => {
    it('shows the results of a period that was already calculated', () => {
      store.selectPeriod('2026-06');

      expect(store.periodTotal()).toBe(19026);
    });

    it('has no results for a period that was not calculated', () => {
      store.selectPeriod('2026-08');

      expect(store.periodTotal()).toBeNull();
      expect(store.scopeResults().every((result) => result.total === null)).toBe(true);
    });
  });

  describe('US-37 calculation history', () => {
    it('lists the periods that were calculated before', () => {
      expect(store.history().map((entry) => [entry.period, entry.total])).toEqual([
        ['2026-06', 19026],
      ]);
    });

    it('adds a period to the history once it is calculated', async () => {
      store.selectPeriod('2026-08');
      await store.calculate();

      expect(store.history().map((entry) => entry.period)).toEqual(['2026-08', '2026-06']);
    });

    it('is empty when no calculation exists', async () => {
      await store.clearResults();

      expect(store.history()).toEqual([]);
    });
  });

  it('restores the demonstration data', async () => {
    store.selectPeriod('2026-08');
    await store.calculate();
    store.selectPeriod('2026-09');
    await store.assignFactor('act-302', null);
    expect(store.rows().find((row) => row.activity.id === 'act-302')?.issue).toBe('MISSING_FACTOR');

    await store.resetDemoData();

    expect(store.history().map((entry) => entry.period)).toEqual(['2026-06']);
    expect(store.rows().find((row) => row.activity.id === 'act-302')?.issue).toBeNull();
  });
});
