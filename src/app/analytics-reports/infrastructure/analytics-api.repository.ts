import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  firstValueFrom
} from 'rxjs';

import {
  API_BASE_URL
} from '../../shared/infrastructure/api/api.config';

import {
  EmissionScope
} from '../domain/model/emission-scope';

import {
  EmissionSummary
} from '../domain/model/emission-summary.entity';

import {
  GoalSnapshot,
  GoalStatus
} from '../domain/model/goal-snapshot.entity';

import {
  Report,
  ReportStatus,
  ReportType
} from '../domain/model/report.entity';

import {
  ReportingPeriod
} from '../domain/model/reporting-period.entity';


interface OrganizationDto {
  id: number;
  name: string;
}


interface ActivityDataDto {
  id: string;
  organizationId: number;
  period: string;
}


interface FootprintCalculationDto {
  id: string;
  organizationId: number;
  period: string;

  scope:
    'SCOPE_1'
    | 'SCOPE_2'
    | 'SCOPE_3';

  resultValue: number;
}


interface GoalDto {
  id: string;
  organizationId: number;
  name: string;
  targetReductionPercent: number;
  progressPercent: number;
  targetDate: string;
  status: GoalStatus;
}


interface ReportDto {
  id: string;
  organizationId: number;
  title: string;
  type: ReportType;
  periodId: string;
  generatedAt: string;
  status: ReportStatus;
  totalTonnesCo2e: number;
}


@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiRepository {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    API_BASE_URL;


  async getOrganizationName():
    Promise<string> {

    const organizationId =
      this.getCurrentOrganizationId();

    const organization =
      await firstValueFrom(
        this.http.get<OrganizationDto>(
          `${this.baseUrl}/organizations/${organizationId}`
        )
      );

    return organization.name;
  }


  async getPeriods():
    Promise<ReportingPeriod[]> {

    const organizationId =
      this.getCurrentOrganizationId();

    const activities =
      await firstValueFrom(
        this.http.get<ActivityDataDto[]>(
          `${this.baseUrl}/activity-data`,
          {
            params: {
              organizationId
            }
          }
        )
      );

    const periods = [
      ...new Set(
        activities.map(
          activity => activity.period
        )
      )
    ].sort();


    return periods.map(period =>
      new ReportingPeriod(
        period,
        period,
        `${period}-01`,
        this.lastDayOfMonth(period)
      )
    );
  }


  async getSummaries():
    Promise<EmissionSummary[]> {

    const organizationId =
      this.getCurrentOrganizationId();


    const [activities, calculations] =
      await Promise.all([

        firstValueFrom(
          this.http.get<ActivityDataDto[]>(
            `${this.baseUrl}/activity-data`,
            {
              params: {
                organizationId
              }
            }
          )
        ),

        firstValueFrom(
          this.http.get<FootprintCalculationDto[]>(
            `${this.baseUrl}/footprint-calculations`,
            {
              params: {
                organizationId
              }
            }
          )
        )

      ]);


    const periods = [
      ...new Set(
        activities.map(
          activity => activity.period
        )
      )
    ].sort();


    return periods.map(period => {

      const periodCalculations =
        calculations.filter(
          calculation =>
            calculation.period === period
        );


      return new EmissionSummary(
        period,
        [
          {
            scope: 'scope1',
            tonnesCo2e:
              this.totalForScope(
                periodCalculations,
                'SCOPE_1'
              )
          },
          {
            scope: 'scope2',
            tonnesCo2e:
              this.totalForScope(
                periodCalculations,
                'SCOPE_2'
              )
          },
          {
            scope: 'scope3',
            tonnesCo2e:
              this.totalForScope(
                periodCalculations,
                'SCOPE_3'
              )
          }
        ]
      );
    });
  }


  async getGoals():
    Promise<GoalSnapshot[]> {

    const organizationId =
      this.getCurrentOrganizationId();

    const goals =
      await firstValueFrom(
        this.http.get<GoalDto[]>(
          `${this.baseUrl}/environmental-goals`,
          {
            params: {
              organizationId
            }
          }
        )
      );


    return goals.map(
      goal =>
        new GoalSnapshot(
          goal.id,
          goal.name,
          goal.targetReductionPercent,
          goal.progressPercent,
          goal.targetDate,
          goal.status
        )
    );
  }


  async getReports():
    Promise<Report[]> {

    const organizationId =
      this.getCurrentOrganizationId();

    const reports =
      await firstValueFrom(
        this.http.get<ReportDto[]>(
          `${this.baseUrl}/environmental-reports`,
          {
            params: {
              organizationId
            }
          }
        )
      );

    return reports.map(
      report =>
        this.toReport(report)
    );
  }


  async createReport(
    type: ReportType,
    periodId: string,
    totalTonnesCo2e: number
  ): Promise<Report> {

    const organizationId =
      this.getCurrentOrganizationId();

    const periodSlug =
      periodId === 'ALL'
        ? 'all-periods'
        : periodId;


    const dto: ReportDto = {

      id:
        crypto.randomUUID(),

      organizationId,

      title:
        `ecotrack-${periodSlug}-${type}-report`,

      type,

      periodId,

      generatedAt:
        new Date().toISOString(),

      status:
        'available',

      totalTonnesCo2e
    };


    const created =
      await firstValueFrom(
        this.http.post<ReportDto>(
          `${this.baseUrl}/environmental-reports`,
          dto
        )
      );


    return this.toReport(created);
  }


  private totalForScope(
    calculations:
    FootprintCalculationDto[],

    scope:
      'SCOPE_1'
      | 'SCOPE_2'
      | 'SCOPE_3'
  ): number | null {

    const matching =
      calculations.filter(
        calculation =>
          calculation.scope === scope
      );


    if (!matching.length) {
      return null;
    }


    const kilograms =
      matching.reduce(
        (
          total,
          calculation
        ) =>
          total
          + calculation.resultValue,

        0
      );


    return kilograms / 1000;
  }


  private toReport(
    report: ReportDto
  ): Report {

    return new Report(
      report.id,
      report.title,
      report.type,
      report.periodId,
      report.generatedAt,
      report.status,
      report.totalTonnesCo2e
    );
  }


  private lastDayOfMonth(
    period: string
  ): string {

    const [year, month] =
      period
        .split('-')
        .map(Number);

    const date =
      new Date(
        year,
        month,
        0
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${period}-${day}`;
  }


  private getCurrentOrganizationId():
    number {

    const storedValue =
      localStorage.getItem(
        'ecotrack.currentOrganizationId'
      );

    const organizationId =
      Number(storedValue);


    return Number.isInteger(
      organizationId
    ) && organizationId > 0
      ? organizationId
      : 1;
  }
}
