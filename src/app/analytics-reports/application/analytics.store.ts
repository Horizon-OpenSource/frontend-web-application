import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  EMISSION_SCOPES
} from '../domain/model/emission-scope';

import {
  EmissionSummary
} from '../domain/model/emission-summary.entity';

import {
  GoalSnapshot
} from '../domain/model/goal-snapshot.entity';

import {
  comparePeriods
} from '../domain/model/period-comparison';

import {
  Report,
  ReportType
} from '../domain/model/report.entity';

import {
  ReportingPeriod
} from '../domain/model/reporting-period.entity';

import {
  AnalyticsApiRepository
} from '../infrastructure/analytics-api.repository';

import {
  ReportFileExporter
} from '../infrastructure/report-file.exporter';


export type ReportGenerationResult =
  'generated'
  | 'insufficientData';

export type ReportDownloadResult =
  'downloaded'
  | 'unavailable';


export const ALL_PERIODS =
  'ALL';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsStore {

  private readonly repository =
    inject(AnalyticsApiRepository);

  private readonly exporter =
    inject(ReportFileExporter);


  readonly organizationName =
    signal('EcoTrack');


  private readonly periodsSignal =
    signal<ReportingPeriod[]>([]);

  private readonly summariesSignal =
    signal<EmissionSummary[]>([]);

  private readonly goalsSignal =
    signal<GoalSnapshot[]>([]);

  private readonly reportsSignal =
    signal<Report[]>([]);

  private readonly selectedPeriodIdSignal =
    signal('');

  private readonly comparisonBaseIdSignal =
    signal('');

  private readonly comparisonTargetIdSignal =
    signal('');

  private readonly reportPeriodFilterSignal =
    signal(ALL_PERIODS);


  readonly periods =
    this.periodsSignal.asReadonly();

  readonly goals =
    this.goalsSignal.asReadonly();

  readonly selectedPeriodId =
    this.selectedPeriodIdSignal.asReadonly();

  readonly comparisonBaseId =
    this.comparisonBaseIdSignal.asReadonly();

  readonly comparisonTargetId =
    this.comparisonTargetIdSignal.asReadonly();

  readonly reportPeriodFilter =
    this.reportPeriodFilterSignal.asReadonly();


  readonly summary =
    computed(() =>
      this.summaryFor(
        this.selectedPeriodIdSignal()
      )
    );


  readonly previousPeriodComparison =
    computed(() => {

      const periods =
        this.periodsSignal();

      const index =
        periods.findIndex(
          period =>
            period.id ===
            this.selectedPeriodIdSignal()
        );


      if (index <= 0) {
        return null;
      }


      return comparePeriods(
        this.summaryFor(
          periods[index - 1].id
        ),
        this.summary()
      );
    });


  readonly comparison =
    computed(() =>
      comparePeriods(
        this.summaryFor(
          this.comparisonBaseIdSignal()
        ),
        this.summaryFor(
          this.comparisonTargetIdSignal()
        )
      )
    );


  readonly reports =
    computed(() =>
      [
        ...this.reportsSignal()
      ].sort(
        (a, b) =>
          b.generatedAt.localeCompare(
            a.generatedAt
          )
      )
    );


  readonly filteredReports =
    computed(() => {

      const filter =
        this.reportPeriodFilterSignal();

      return this.reports()
        .filter(
          report =>
            filter === ALL_PERIODS
            ||
            report.periodId === filter
        );
    });


  async load(): Promise<void> {

    const [
      organizationName,
      periods,
      summaries,
      goals,
      reports
    ] = await Promise.all([

      this.repository
        .getOrganizationName(),

      this.repository
        .getPeriods(),

      this.repository
        .getSummaries(),

      this.repository
        .getGoals(),

      this.repository
        .getReports()
    ]);


    this.organizationName.set(
      organizationName
    );

    this.periodsSignal.set(
      periods
    );

    this.summariesSignal.set(
      summaries
    );

    this.goalsSignal.set(
      goals
    );

    this.reportsSignal.set(
      reports
    );


    if (
      this.selectedPeriodIdSignal()
    ) {
      return;
    }


    const periodsWithData =
      periods.filter(
        period =>
          this.summaryFor(
            period.id
          ).hasData
      );


    const latest =
      periodsWithData.at(-1)
      ??
      periods.at(-1);


    const previous =
      periodsWithData.length >= 2
        ? periodsWithData.at(-2)
        : undefined;


    if (latest) {

      this.selectedPeriodIdSignal.set(
        latest.id
      );
    }


    if (
      latest &&
      previous
    ) {

      this.comparisonBaseIdSignal.set(
        previous.id
      );

      this.comparisonTargetIdSignal.set(
        latest.id
      );
    }
  }


  selectPeriod(
    periodId: string
  ): void {

    this.selectedPeriodIdSignal.set(
      periodId
    );
  }


  setComparisonBase(
    periodId: string
  ): void {

    this.comparisonBaseIdSignal.set(
      periodId
    );
  }


  setComparisonTarget(
    periodId: string
  ): void {

    this.comparisonTargetIdSignal.set(
      periodId
    );
  }


  setReportPeriodFilter(
    periodId: string
  ): void {

    this.reportPeriodFilterSignal.set(
      periodId
    );
  }


  periodLabel(
    periodId: string
  ): string {

    return this.periodsSignal()
        .find(
          period =>
            period.id === periodId
        )?.label
      ??
      periodId;
  }


  async generateReport(
    type: ReportType,
    periodId: string
  ): Promise<ReportGenerationResult> {

    const total =
      type === 'consolidated'
        ? this.consolidatedTotal()
        : this.summaryFor(
          periodId
        ).totalTonnesCo2e;


    if (total === null) {
      return 'insufficientData';
    }


    const report =
      await this.repository
        .createReport(
          type,
          type === 'consolidated'
            ? ALL_PERIODS
            : periodId,
          total
        );


    this.reportsSignal.update(
      reports => [
        ...reports,
        report
      ]
    );


    return 'generated';
  }


  downloadReport(
    report: Report
  ): ReportDownloadResult {

    if (
      !report.isDownloadable
    ) {
      return 'unavailable';
    }


    this.exporter.downloadCsv(
      `${report.title}.csv`,
      this.buildCsv(report)
    );


    return 'downloaded';
  }


  private summaryFor(
    periodId: string
  ): EmissionSummary {

    return (
      this.summariesSignal()
        .find(
          summary =>
            summary.periodId ===
            periodId
        )
      ??
      EmissionSummary.empty(
        periodId
      )
    );
  }


  private summariesWithData():
    EmissionSummary[] {

    return this.summariesSignal()
      .filter(
        summary =>
          summary.hasData
      );
  }


  private consolidatedTotal():
    number | null {

    const summaries =
      this.summariesWithData();


    if (!summaries.length) {
      return null;
    }


    return summaries.reduce(
      (
        sum,
        summary
      ) =>
        sum
        +
        (
          summary.totalTonnesCo2e
          ??
          0
        ),

      0
    );
  }


  private buildCsv(
    report: Report
  ): string {

    const summaries =
      report.periodId ===
      ALL_PERIODS

        ? this.summariesWithData()

        : [
          this.summaryFor(
            report.periodId
          )
        ];


    const scopeHeaders =
      EMISSION_SCOPES.map(
        scope =>
          `${scope} (t CO2e)`
      );


    const rows:
      (string | number)[][] = [

      [
        'EcoTrack environmental report'
      ],

      [
        'Organization',
        this.organizationName()
      ],

      [
        'Report type',
        report.type
      ],

      [
        'Period',

        report.periodId ===
        ALL_PERIODS

          ? 'All periods with data'

          : this.periodLabel(
            report.periodId
          )
      ],

      [
        'Generated at',
        report.generatedAt
      ],

      [],

      [
        'Period',
        ...scopeHeaders,
        'Total (t CO2e)'
      ],

      ...summaries.map(
        summary => [

          this.periodLabel(
            summary.periodId
          ),

          ...EMISSION_SCOPES.map(
            scope =>
              summary.tonnesFor(
                scope
              )
              ??
              'No data'
          ),

          summary.totalTonnesCo2e
          ??
          'No data'
        ]
      )
    ];


    if (
      report.type ===
      'consolidated'
    ) {

      rows.push(
        [],

        [
          'Goal',
          'Target reduction (%)',
          'Progress (%)',
          'Target date',
          'Status'
        ],

        ...this.goalsSignal()
          .map(
            goal => [
              goal.name,
              goal.targetReductionPercent,
              goal.progressPercent,
              goal.targetDate,
              goal.status
            ]
          )
      );
    }


    return rows
      .map(
        row =>
          row
            .map(
              cell =>
                this.escapeCsv(
                  cell
                )
            )
            .join(',')
      )
      .join('\r\n');
  }


  private escapeCsv(
    value: string | number
  ): string {

    const text =
      String(value);


    return /[",\r\n]/.test(
      text
    )
      ? `"${text.replace(
        /"/g,
        '""'
      )}"`

      : text;
  }
}
