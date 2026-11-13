import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BACKEND_API_BASE_URL } from '../../shared/infrastructure/api/api.config';
import { EMISSION_SCOPES, EmissionScope } from '../domain/model/emission-scope';
import { EmissionSummary } from '../domain/model/emission-summary.entity';
import { GoalSnapshot } from '../domain/model/goal-snapshot.entity';
import { Report, ReportType } from '../domain/model/report.entity';
import { ReportingPeriod } from '../domain/model/reporting-period.entity';
import { AnalyticsRepository } from '../domain/repository/analytics.repository';
import { AnalyticsApiRepository } from './analytics-api.repository';

type BackendScope = 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';

interface ScopeEmissionDto {
  scope: BackendScope;
  tonnes: number | null;
}

interface PeriodSummaryDto {
  period: string;
  hasData: boolean;
  total: number | null;
  scopes: ScopeEmissionDto[];
}

interface SustainabilityReportDto {
  id: number;
  organizationId: number;
  type: 'CONSOLIDATED' | 'PERIOD';
  period: string | null;
  totalTonnes: number;
  status: 'GENERATED' | 'DOWNLOADED';
  generatedAt: string;
}

const BACKEND_SCOPES: Record<EmissionScope, BackendScope> = {
  scope1: 'SCOPE_1',
  scope2: 'SCOPE_2',
  scope3: 'SCOPE_3',
};

/**
 * Reads the emission summaries and reads and creates the reports through the Spring Boot API.
 * The organization name, the reporting periods and the goals still come from the Mock API,
 * because those data belong to other bounded contexts that do not have a backend yet.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsBackendRepository extends AnalyticsRepository {
  private readonly http = inject(HttpClient);
  private readonly mockApi = inject(AnalyticsApiRepository);
  private readonly baseUrl = `${BACKEND_API_BASE_URL}/analytics`;

  getOrganizationName(): Promise<string> {
    return this.mockApi.getOrganizationName();
  }

  getPeriods(): Promise<ReportingPeriod[]> {
    return this.mockApi.getPeriods();
  }

  getGoals(): Promise<GoalSnapshot[]> {
    return this.mockApi.getGoals();
  }

  async getSummaries(): Promise<EmissionSummary[]> {
    const summaries = await firstValueFrom(
      this.http.get<PeriodSummaryDto[]>(`${this.baseUrl}/summary`, {
        params: { organizationId: this.getCurrentOrganizationId() },
      }),
    );
    return summaries.map(
      (summary) =>
        new EmissionSummary(
          summary.period,
          EMISSION_SCOPES.map((scope) => ({
            scope,
            tonnesCo2e:
              summary.scopes.find((item) => item.scope === BACKEND_SCOPES[scope])?.tonnes ?? null,
          })),
        ),
    );
  }

  async getReports(): Promise<Report[]> {
    const reports = await firstValueFrom(
      this.http.get<SustainabilityReportDto[]>(`${this.baseUrl}/reports`, {
        params: { organizationId: this.getCurrentOrganizationId() },
      }),
    );
    return reports.map((report) => this.toReport(report));
  }

  async createReport(type: ReportType, periodId: string): Promise<Report> {
    const organizationId = this.getCurrentOrganizationId();
    const created = await firstValueFrom(
      type === 'consolidated'
        ? this.http.post<SustainabilityReportDto>(`${this.baseUrl}/reports/consolidated`, {
            organizationId,
          })
        : this.http.post<SustainabilityReportDto>(`${this.baseUrl}/reports/period`, {
            organizationId,
            period: periodId,
          }),
    );
    return this.toReport(created);
  }

  private toReport(report: SustainabilityReportDto): Report {
    const type: ReportType = report.type === 'CONSOLIDATED' ? 'consolidated' : 'period';
    const periodId = report.period ?? 'ALL';
    const periodSlug = report.period ?? 'all-periods';
    return new Report(
      String(report.id),
      `ecotrack-${periodSlug}-${type}-report`,
      type,
      periodId,
      report.generatedAt,
      'available',
      report.totalTonnes,
    );
  }

  private getCurrentOrganizationId(): number {
    const organizationId = Number(localStorage.getItem('ecotrack.currentOrganizationId'));
    return Number.isInteger(organizationId) && organizationId > 0 ? organizationId : 1;
  }
}
