import { Injectable } from '@angular/core';
import { EmissionSummary } from '../domain/model/emission-summary.entity';
import { GoalSnapshot } from '../domain/model/goal-snapshot.entity';
import { Report, ReportType } from '../domain/model/report.entity';
import { ReportingPeriod } from '../domain/model/reporting-period.entity';

const STORAGE_KEY = 'ecotrack-analytics-reports';

const ORGANIZATION_NAME = 'Andina Export S.A.C.';

/** Reporting periods available for the demo organization, oldest first. */
const PERIODS: ReportingPeriod[] = [
  new ReportingPeriod('q4-2025', 'Q4 2025', '2025-10-01', '2025-12-31'),
  new ReportingPeriod('q1-2026', 'Q1 2026', '2026-01-01', '2026-03-31'),
  new ReportingPeriod('q2-2026', 'Q2 2026', '2026-04-01', '2026-06-30'),
  new ReportingPeriod('q3-2026', 'Q3 2026', '2026-07-01', '2026-09-30'),
];

/**
 * Calculated footprint per period (t CO2e).
 * - Q4 2025 has no Scope 3 calculation (partial data scenario).
 * - Q2 2026 is +5.5 % against Q1 2026, as in the UX/UI mock-ups.
 * - Q3 2026 has no calculations yet (empty state scenario).
 */
const SUMMARIES: EmissionSummary[] = [
  new EmissionSummary('q4-2025', [
    { scope: 'scope1', tonnesCo2e: 7600 },
    { scope: 'scope2', tonnesCo2e: 9500 },
    { scope: 'scope3', tonnesCo2e: null },
  ]),
  new EmissionSummary('q1-2026', [
    { scope: 'scope1', tonnesCo2e: 7900 },
    { scope: 'scope2', tonnesCo2e: 9800 },
    { scope: 'scope3', tonnesCo2e: 6442 },
  ]),
  new EmissionSummary('q2-2026', [
    { scope: 'scope1', tonnesCo2e: 8200 },
    { scope: 'scope2', tonnesCo2e: 10350 },
    { scope: 'scope3', tonnesCo2e: 6920 },
  ]),
  EmissionSummary.empty('q3-2026'),
];

/** Read-only goals shown in the environmental summary. */
const GOALS: GoalSnapshot[] = [
  new GoalSnapshot('goal-001', 'Reduce Scope 2 emissions by 15 %', 15, 40, '2026-12-31', 'active'),
  new GoalSnapshot(
    'goal-002',
    'Cut delivery fleet fuel use by 10 %',
    10,
    72,
    '2026-09-30',
    'atRisk',
  ),
  new GoalSnapshot(
    'goal-003',
    'Source 30 % renewable electricity',
    30,
    100,
    '2026-06-30',
    'achieved',
  ),
];

/** Reports generated before the demo starts. The third one shows the unavailable download scenario. */
const MOCK_REPORTS: Report[] = [
  new Report(
    'rep-001',
    'ecotrack-q4-2025-period-report',
    'period',
    'q4-2025',
    '2026-01-15T15:00:00.000Z',
    'available',
    17100,
  ),
  new Report(
    'rep-002',
    'ecotrack-q1-2026-period-report',
    'period',
    'q1-2026',
    '2026-04-12T16:30:00.000Z',
    'available',
    24142,
  ),
  new Report(
    'rep-003',
    'ecotrack-consolidated-report',
    'consolidated',
    'ALL',
    '2026-04-20T10:15:00.000Z',
    'unavailable',
    41242,
  ),
];

@Injectable({ providedIn: 'root' })
export class MockAnalyticsRepository {
  readonly organizationName = ORGANIZATION_NAME;

  getPeriods(): ReportingPeriod[] {
    return PERIODS;
  }

  getSummaries(): EmissionSummary[] {
    return SUMMARIES;
  }

  getGoals(): GoalSnapshot[] {
    return GOALS;
  }

  getReports(): Report[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.save(MOCK_REPORTS);
      return MOCK_REPORTS;
    }

    try {
      return this.hydrate(JSON.parse(stored) as Report[]);
    } catch {
      this.save(MOCK_REPORTS);
      return MOCK_REPORTS;
    }
  }

  createReport(type: ReportType, periodId: string, totalTonnesCo2e: number): Report {
    const periodSlug = periodId === 'ALL' ? 'all-periods' : periodId;
    const report = new Report(
      crypto.randomUUID(),
      `ecotrack-${periodSlug}-${type}-report`,
      type,
      periodId,
      new Date().toISOString(),
      'available',
      totalTonnesCo2e,
    );
    this.save([...this.getReports(), report]);
    return report;
  }

  reset(): Report[] {
    this.save(MOCK_REPORTS);
    return MOCK_REPORTS;
  }

  private save(reports: Report[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  private hydrate(reports: Report[]): Report[] {
    return reports.map(
      (report) =>
        new Report(
          report.id,
          report.title,
          report.type,
          report.periodId,
          report.generatedAt,
          report.status,
          report.totalTonnesCo2e,
        ),
    );
  }
}
