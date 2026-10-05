import { ActivityDataItem } from '../model/activity-data-item.model';
import { EmissionFactor } from '../model/emission-factor.entity';
import { FootprintScope } from '../model/footprint-scope';
import { assessActivity, calculateFootprint, CalculationContext } from './footprint-calculator';
import { buildHistory, summarizeByScope, totalOf } from './footprint-summary';

const diesel = new EmissionFactor({
  id: 'f-diesel',
  name: 'Diesel',
  scope: FootprintScope.Scope1,
  unit: 'L',
  value: 2.68,
  source: 'test',
});
const grid = new EmissionFactor({
  id: 'f-grid',
  name: 'Grid',
  scope: FootprintScope.Scope2,
  unit: 'kWh',
  value: 0.25,
  source: 'test',
});
const factors = [diesel, grid];

function item(overrides: Partial<ActivityDataItem> = {}): ActivityDataItem {
  return {
    id: 'act-1',
    emissionSourceId: 'src-1',
    sourceName: 'Diesel generator',
    facilityName: 'Plant',
    scope: FootprintScope.Scope1,
    period: '2026-08',
    quantity: 850,
    unit: 'L',
    ...overrides,
  };
}

function context(): CalculationContext {
  let sequence = 0;
  return { calculatedAt: '2026-09-01T10:00:00.000Z', newId: () => `calc-${++sequence}` };
}

describe('EmissionFactor compatibility (US-46)', () => {
  it('is compatible with the same scope and unit, ignoring case and spaces', () => {
    expect(grid.isCompatibleWith({ scope: FootprintScope.Scope2, unit: ' KWH ' })).toBe(true);
  });

  it('is not compatible with a different scope or unit', () => {
    expect(grid.isCompatibleWith({ scope: FootprintScope.Scope1, unit: 'kWh' })).toBe(false);
    expect(grid.isCompatibleWith({ scope: FootprintScope.Scope2, unit: 'L' })).toBe(false);
  });

  it('rejects a factor without a positive value', () => {
    expect(
      () =>
        new EmissionFactor({
          id: 'x',
          name: 'x',
          scope: FootprintScope.Scope1,
          unit: 'L',
          value: 0,
          source: '',
        }),
    ).toThrow();
  });
});

describe('assessActivity', () => {
  it('reports a missing factor', () => {
    expect(assessActivity(item(), null)).toBe('MISSING_FACTOR');
  });

  it('reports an incompatible factor', () => {
    expect(assessActivity(item(), grid)).toBe('INCOMPATIBLE_FACTOR');
  });

  it('reports missing information when quantity or unit are not usable', () => {
    expect(assessActivity(item({ quantity: 0 }), diesel)).toBe('MISSING_INFORMATION');
    expect(assessActivity(item({ unit: ' ' }), diesel)).toBe('MISSING_INFORMATION');
  });

  it('is ready when the factor is valid and compatible', () => {
    expect(assessActivity(item(), diesel)).toBeNull();
  });
});

describe('calculateFootprint (US-34)', () => {
  it('calculates the footprint of a period in kgCO2e', () => {
    const activities = [
      item(),
      item({
        id: 'act-2',
        sourceName: 'Electricity',
        scope: FootprintScope.Scope2,
        quantity: 12500,
        unit: 'kWh',
      }),
    ];

    const outcome = calculateFootprint(
      '2026-08',
      activities,
      { 'act-1': 'f-diesel', 'act-2': 'f-grid' },
      factors,
      context(),
    );

    expect(outcome.status).toBe('COMPLETED');
    if (outcome.status !== 'COMPLETED') return;
    expect(outcome.calculations).toHaveLength(2);
    expect(outcome.calculations[0].resultValue).toBe(2278);
    expect(outcome.calculations[1].resultValue).toBe(3125);
    expect(outcome.total).toBe(5403);
  });

  it('does not complete and lists the records without an emission factor', () => {
    const activities = [
      item(),
      item({ id: 'act-2', sourceName: 'Electricity', scope: FootprintScope.Scope2, unit: 'kWh' }),
    ];

    const outcome = calculateFootprint(
      '2026-08',
      activities,
      { 'act-1': 'f-diesel' },
      factors,
      context(),
    );

    expect(outcome.status).toBe('INCOMPLETE');
    if (outcome.status !== 'INCOMPLETE') return;
    expect(outcome.pending).toEqual([
      { reason: 'MISSING_FACTOR', activityDataId: 'act-2', sourceName: 'Electricity' },
    ]);
  });

  it('reports every pending record, not only the first one', () => {
    const activities = [item(), item({ id: 'act-2', sourceName: 'Other', quantity: 0 })];

    const outcome = calculateFootprint('2026-08', activities, {}, factors, context());

    expect(outcome.status).toBe('INCOMPLETE');
    if (outcome.status !== 'INCOMPLETE') return;
    expect(outcome.pending.map((issue) => issue.reason)).toEqual([
      'MISSING_FACTOR',
      'MISSING_INFORMATION',
    ]);
  });

  it('does not complete when the period has no activity data', () => {
    const outcome = calculateFootprint('2026-01', [item()], {}, factors, context());

    expect(outcome).toEqual({
      status: 'INCOMPLETE',
      period: '2026-01',
      pending: [{ reason: 'NO_ACTIVITY_DATA' }],
    });
  });

  it('ignores activity data of other periods', () => {
    const activities = [item(), item({ id: 'act-9', period: '2026-09' })];

    const outcome = calculateFootprint(
      '2026-08',
      activities,
      { 'act-1': 'f-diesel' },
      factors,
      context(),
    );

    expect(outcome.status).toBe('COMPLETED');
  });
});

describe('footprint summaries (US-35, US-36, US-37)', () => {
  const activities = [
    item(),
    item({
      id: 'act-2',
      sourceName: 'Electricity',
      scope: FootprintScope.Scope2,
      quantity: 12500,
      unit: 'kWh',
    }),
  ];
  const assignments = { 'act-1': 'f-diesel', 'act-2': 'f-grid' };

  function calculations(period: string, calculatedAt: string) {
    const outcome = calculateFootprint(
      period,
      activities.map((a) => ({ ...a, period })),
      assignments,
      factors,
      {
        calculatedAt,
        newId: () => crypto.randomUUID(),
      },
    );
    return outcome.status === 'COMPLETED' ? [...outcome.calculations] : [];
  }

  it('splits the results by scope and leaves a null total for a scope without results', () => {
    const results = summarizeByScope(calculations('2026-08', '2026-09-01T10:00:00.000Z'));

    expect(results.map((result) => result.scope)).toEqual([
      FootprintScope.Scope1,
      FootprintScope.Scope2,
      FootprintScope.Scope3,
    ]);
    expect(results.map((result) => result.total)).toEqual([2278, 3125, null]);
  });

  it('returns a null total when there are no calculations', () => {
    expect(totalOf([])).toBeNull();
    expect(summarizeByScope([]).every((result) => result.total === null)).toBe(true);
  });

  it('builds one history entry per period, most recent period first', () => {
    const history = buildHistory([
      ...calculations('2026-06', '2026-07-02T09:00:00.000Z'),
      ...calculations('2026-08', '2026-09-01T10:00:00.000Z'),
    ]);

    expect(history.map((entry) => entry.period)).toEqual(['2026-08', '2026-06']);
    expect(history[0]).toEqual({
      period: '2026-08',
      records: 2,
      total: 5403,
      calculatedAt: '2026-09-01T10:00:00.000Z',
    });
  });

  it('returns an empty history when nothing was calculated', () => {
    expect(buildHistory([])).toEqual([]);
  });
});
