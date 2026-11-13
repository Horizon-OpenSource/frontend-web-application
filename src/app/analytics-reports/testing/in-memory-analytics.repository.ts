import { EmissionSummary } from '../domain/model/emission-summary.entity';
import { GoalSnapshot } from '../domain/model/goal-snapshot.entity';
import { Report, ReportType } from '../domain/model/report.entity';
import { ReportingPeriod } from '../domain/model/reporting-period.entity';
import { AnalyticsRepository } from '../domain/repository/analytics.repository';

/**
 * Repository that keeps the demo data in memory so the store can be tested without HTTP.
 *
 * - 2026-01 has no Scope 3 result (partial data).
 * - 2026-02 is complete and about 14.5 % above 2026-01.
 * - 2026-03 has no results (empty state).
 */
export class InMemoryAnalyticsRepository extends AnalyticsRepository {
  readonly createdReports: Report[] = [];

  private readonly reports: Report[] = [
    new Report('rep-1', 'ecotrack-2026-01-period-report', 'period', '2026-01',
      '2026-02-02T10:00:00.000Z', 'available', 14.55),
    new Report('rep-2', 'ecotrack-all-periods-consolidated-report', 'consolidated', 'ALL',
      '2026-02-03T10:00:00.000Z', 'unavailable', 14.55),
  ];

  async getOrganizationName(): Promise<string> {
    return 'Andina Export S.A.C.';
  }

  async getPeriods(): Promise<ReportingPeriod[]> {
    return ['2026-01', '2026-02', '2026-03'].map(
      (period) => new ReportingPeriod(period, period, `${period}-01`, `${period}-28`),
    );
  }

  async getSummaries(): Promise<EmissionSummary[]> {
    return [
      new EmissionSummary('2026-01', [
        { scope: 'scope1', tonnesCo2e: 2.5 },
        { scope: 'scope2', tonnesCo2e: 12 },
        { scope: 'scope3', tonnesCo2e: null },
      ]),
      new EmissionSummary('2026-02', [
        { scope: 'scope1', tonnesCo2e: 3 },
        { scope: 'scope2', tonnesCo2e: 12 },
        { scope: 'scope3', tonnesCo2e: 1.6 },
      ]),
    ];
  }

  async getGoals(): Promise<GoalSnapshot[]> {
    return [new GoalSnapshot('goal-1', 'Reduce Scope 2 emissions by 15 %', 15, 40, '2026-12-31', 'active')];
  }

  async getReports(): Promise<Report[]> {
    return [...this.reports, ...this.createdReports];
  }

  async createReport(type: ReportType, periodId: string, totalTonnesCo2e: number): Promise<Report> {
    const report = new Report(`rep-new-${this.createdReports.length + 1}`, `ecotrack-${periodId}-${type}-report`,
      type, periodId, '2026-03-10T10:00:00.000Z', 'available', totalTonnesCo2e);
    this.createdReports.push(report);
    return report;
  }
}
