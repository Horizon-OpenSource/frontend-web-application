import { EmissionSummary } from '../model/emission-summary.entity';
import { GoalSnapshot } from '../model/goal-snapshot.entity';
import { Report, ReportType } from '../model/report.entity';
import { ReportingPeriod } from '../model/reporting-period.entity';

/**
 * Port used by the application layer of Analytics and Reports.
 * Implementations can read from the Mock API, from the Spring Boot API or from memory in tests.
 */
export abstract class AnalyticsRepository {
  abstract getOrganizationName(): Promise<string>;
  abstract getPeriods(): Promise<ReportingPeriod[]>;
  abstract getSummaries(): Promise<EmissionSummary[]>;
  abstract getGoals(): Promise<GoalSnapshot[]>;
  abstract getReports(): Promise<Report[]>;
  abstract createReport(
    type: ReportType,
    periodId: string,
    totalTonnesCo2e: number,
  ): Promise<Report>;
}
