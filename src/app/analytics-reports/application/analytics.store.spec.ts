import { TestBed } from '@angular/core/testing';

import { AnalyticsRepository } from '../domain/repository/analytics.repository';
import { ReportFileExporter } from '../infrastructure/report-file.exporter';
import { InMemoryAnalyticsRepository } from '../testing/in-memory-analytics.repository';
import { ALL_PERIODS, AnalyticsStore } from './analytics.store';

describe('AnalyticsStore', () => {
  let store: AnalyticsStore;
  let repository: InMemoryAnalyticsRepository;
  const downloadCsv = vi.fn();

  beforeEach(async () => {
    downloadCsv.mockClear();
    repository = new InMemoryAnalyticsRepository();
    TestBed.configureTestingModule({
      providers: [
        { provide: AnalyticsRepository, useValue: repository },
        { provide: ReportFileExporter, useValue: { downloadCsv } },
      ],
    });
    store = TestBed.inject(AnalyticsStore);
    await store.load();
  });

  it('loads the organization, periods, goals and reports and selects the latest period with data', () => {
    expect(store.organizationName()).toBe('Andina Export S.A.C.');
    expect(store.periods().map((period) => period.id)).toEqual(['2026-01', '2026-02', '2026-03']);
    expect(store.goals()).toHaveLength(1);
    expect(store.reports()).toHaveLength(2);
    expect(store.selectedPeriodId()).toBe('2026-02');
    expect(store.comparisonBaseId()).toBe('2026-01');
    expect(store.comparisonTargetId()).toBe('2026-02');
  });

  describe('US-16, US-17 and US-26 environmental summary', () => {
    it('shows the total and the scopes of the selected period', () => {
      expect(store.summary().totalTonnesCo2e).toBeCloseTo(16.6);
      expect(store.summary().missingScopes).toEqual([]);
    });

    it('flags the scope without results in a partial period', () => {
      store.selectPeriod('2026-01');

      expect(store.summary().hasData).toBe(true);
      expect(store.summary().missingScopes).toEqual(['scope3']);
    });

    it('shows no total for a period without calculations', () => {
      store.selectPeriod('2026-03');

      expect(store.summary().hasData).toBe(false);
      expect(store.summary().totalTonnesCo2e).toBeNull();
    });
  });

  describe('US-20 period comparison', () => {
    it('compares the two latest periods with data by default', () => {
      expect(store.comparison()?.deltaTonnesCo2e).toBeCloseTo(2.1);
      expect(store.comparison()?.deltaPercent).toBeCloseTo((2.1 / 14.5) * 100);
    });

    it('cannot compare when a selected period has no results', () => {
      store.setComparisonTarget('2026-03');

      expect(store.comparison()).toBeNull();
    });

    it('compares the selected period with the previous one', () => {
      expect(store.previousPeriodComparison()?.base.periodId).toBe('2026-01');

      store.selectPeriod('2026-01');

      expect(store.previousPeriodComparison()).toBeNull();
    });
  });

  describe('US-27 and US-29 report generation', () => {
    it('generates a report of the selected period', async () => {
      const result = await store.generateReport('period', '2026-02');

      expect(result).toBe('generated');
      expect(repository.createdReports).toHaveLength(1);
      expect(repository.createdReports[0].periodId).toBe('2026-02');
      expect(repository.createdReports[0].totalTonnesCo2e).toBeCloseTo(16.6);
      expect(store.reports()).toHaveLength(3);
    });

    it('does not generate a period report when the period has no data', async () => {
      const result = await store.generateReport('period', '2026-03');

      expect(result).toBe('insufficientData');
      expect(repository.createdReports).toHaveLength(0);
      expect(store.reports()).toHaveLength(2);
    });

    it('generates a consolidated report with every period that has data', async () => {
      const result = await store.generateReport('consolidated', '2026-02');

      expect(result).toBe('generated');
      expect(repository.createdReports[0].type).toBe('consolidated');
      expect(repository.createdReports[0].periodId).toBe(ALL_PERIODS);
      expect(repository.createdReports[0].totalTonnesCo2e).toBeCloseTo(31.1);
    });
  });

  describe('US-30 report history', () => {
    it('lists the newest reports first', () => {
      expect(store.reports().map((report) => report.id)).toEqual(['rep-2', 'rep-1']);
    });

    it('filters the reports by period', () => {
      store.setReportPeriodFilter('2026-01');

      expect(store.filteredReports().map((report) => report.id)).toEqual(['rep-1']);

      store.setReportPeriodFilter(ALL_PERIODS);

      expect(store.filteredReports()).toHaveLength(2);
    });

    it('returns no reports for a period without reports', () => {
      store.setReportPeriodFilter('2026-03');

      expect(store.filteredReports()).toEqual([]);
    });
  });

  describe('US-28 report download', () => {
    it('downloads an available report as a CSV file', () => {
      const report = store.reports().find((item) => item.id === 'rep-1')!;

      const result = store.downloadReport(report);

      expect(result).toBe('downloaded');
      expect(downloadCsv).toHaveBeenCalledTimes(1);
      const [fileName, content] = downloadCsv.mock.calls[0];
      expect(fileName).toBe('ecotrack-2026-01-period-report.csv');
      expect(content).toContain('EcoTrack environmental report');
      expect(content).toContain('Organization,Andina Export S.A.C.');
      expect(content).toContain('2026-01,2.5,12,No data,14.5');
    });

    it('does not download an unavailable report', () => {
      const report = store.reports().find((item) => item.id === 'rep-2')!;

      expect(store.downloadReport(report)).toBe('unavailable');
      expect(downloadCsv).not.toHaveBeenCalled();
    });

    it('adds the goals to a consolidated report', async () => {
      await store.generateReport('consolidated', '2026-02');
      const consolidated = store.reports().find((item) => item.id === 'rep-new-1')!;

      const result = store.downloadReport(consolidated);

      expect(result).toBe('downloaded');
      const [fileName, content] = downloadCsv.mock.calls[0];
      expect(fileName).toBe('ecotrack-ALL-consolidated-report.csv');
      expect(content).toContain('Period,scope1 (t CO2e),scope2 (t CO2e),scope3 (t CO2e),Total (t CO2e)');
      expect(content).toContain('Reduce Scope 2 emissions by 15 %');
    });
  });
});
