import { EmissionSummary } from './emission-summary.entity';
import { comparePeriods } from './period-comparison';
import { Report } from './report.entity';

const january = new EmissionSummary('2026-01', [
  { scope: 'scope1', tonnesCo2e: 2.5 },
  { scope: 'scope2', tonnesCo2e: 12 },
  { scope: 'scope3', tonnesCo2e: null },
]);

const february = new EmissionSummary('2026-02', [
  { scope: 'scope1', tonnesCo2e: 3 },
  { scope: 'scope2', tonnesCo2e: 12 },
  { scope: 'scope3', tonnesCo2e: 1.6 },
]);

describe('EmissionSummary', () => {
  it('US-16 adds the scopes with results into the total', () => {
    expect(january.hasData).toBe(true);
    expect(january.totalTonnesCo2e).toBeCloseTo(14.5);
    expect(february.totalTonnesCo2e).toBeCloseTo(16.6);
  });

  it('US-17 reports each scope and the scopes without results', () => {
    expect(january.tonnesFor('scope2')).toBe(12);
    expect(january.tonnesFor('scope3')).toBeNull();
    expect(january.missingScopes).toEqual(['scope3']);
    expect(february.missingScopes).toEqual([]);
  });

  it('US-17 calculates the share of each scope over the total', () => {
    expect(february.sharePercentFor('scope2')).toBeCloseTo((12 / 16.6) * 100);
    expect(january.sharePercentFor('scope3')).toBeNull();
  });

  it('US-16 has no total when the period has no calculations', () => {
    const empty = EmissionSummary.empty('2026-03');

    expect(empty.hasData).toBe(false);
    expect(empty.totalTonnesCo2e).toBeNull();
    expect(empty.missingScopes).toEqual(['scope1', 'scope2', 'scope3']);
    expect(empty.sharePercentFor('scope1')).toBeNull();
  });
});

describe('comparePeriods', () => {
  it('US-20 returns the variation from the base period to the target period', () => {
    const comparison = comparePeriods(january, february);

    expect(comparison?.deltaTonnesCo2e).toBeCloseTo(2.1);
    expect(comparison?.deltaPercent).toBeCloseTo((2.1 / 14.5) * 100);
  });

  it('US-20 cannot compare when one of the periods has no results', () => {
    expect(comparePeriods(january, EmissionSummary.empty('2026-03'))).toBeNull();
    expect(comparePeriods(EmissionSummary.empty('2026-03'), february)).toBeNull();
  });

  it('US-20 reports no percentage change when the base period emitted nothing', () => {
    const zero = new EmissionSummary('2026-04', [
      { scope: 'scope1', tonnesCo2e: 0 },
      { scope: 'scope2', tonnesCo2e: null },
      { scope: 'scope3', tonnesCo2e: null },
    ]);

    expect(comparePeriods(zero, february)?.deltaPercent).toBe(0);
  });
});

describe('Report', () => {
  it('US-28 can be downloaded only when it is available', () => {
    const available = new Report('1', 'a', 'period', '2026-01', '2026-02-02T10:00:00.000Z', 'available', 1);
    const unavailable = new Report('2', 'b', 'period', '2026-01', '2026-02-02T10:00:00.000Z', 'unavailable', 1);

    expect(available.isDownloadable).toBe(true);
    expect(unavailable.isDownloadable).toBe(false);
  });
});
