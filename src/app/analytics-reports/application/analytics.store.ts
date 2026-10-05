import { computed, inject, Injectable, signal } from '@angular/core';
import { EMISSION_SCOPES } from '../domain/model/emission-scope';
import { EmissionSummary } from '../domain/model/emission-summary.entity';
import { GoalSnapshot } from '../domain/model/goal-snapshot.entity';
import { comparePeriods } from '../domain/model/period-comparison';
import { Report, ReportType } from '../domain/model/report.entity';
import { ReportingPeriod } from '../domain/model/reporting-period.entity';
import { MockAnalyticsRepository } from '../infrastructure/mock-analytics.repository';
import { ReportFileExporter } from '../infrastructure/report-file.exporter';

export type ReportGenerationResult = 'generated' | 'insufficientData';
export type ReportDownloadResult = 'downloaded' | 'unavailable';

/** Period id used by consolidated reports, which cover every period with data. */
export const ALL_PERIODS = 'ALL';

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly repository = inject(MockAnalyticsRepository);
  private readonly exporter = inject(ReportFileExporter);

  private readonly periodsSignal = signal<ReportingPeriod[]>([]);
  private readonly summariesSignal = signal<EmissionSummary[]>([]);
  private readonly goalsSignal = signal<GoalSnapshot[]>([]);
  private readonly reportsSignal = signal<Report[]>([]);
  private readonly selectedPeriodIdSignal = signal('');
  private readonly comparisonBaseIdSignal = signal('');
  private readonly comparisonTargetIdSignal = signal('');
  private readonly reportPeriodFilterSignal = signal(ALL_PERIODS);

  readonly organizationName = this.repository.organizationName;
  readonly periods = this.periodsSignal.asReadonly();
  readonly goals = this.goalsSignal.asReadonly();
  readonly selectedPeriodId = this.selectedPeriodIdSignal.asReadonly();
  readonly comparisonBaseId = this.comparisonBaseIdSignal.asReadonly();
  readonly comparisonTargetId = this.comparisonTargetIdSignal.asReadonly();
  readonly reportPeriodFilter = this.reportPeriodFilterSignal.asReadonly();

  /** Summary of the selected period (US-16, US-17, US-26). */
  readonly summary = computed(() => this.summaryFor(this.selectedPeriodIdSignal()));

  /** Variation of the selected period against the previous one, shown next to the total. */
  readonly previousPeriodComparison = computed(() => {
    const periods = this.periodsSignal();
    const index = periods.findIndex((period) => period.id === this.selectedPeriodIdSignal());
    if (index <= 0) {
      return null;
    }
    return comparePeriods(this.summaryFor(periods[index - 1].id), this.summary());
  });

  /** Comparison between the two periods chosen by the user (US-20). */
  readonly comparison = computed(() =>
    comparePeriods(
      this.summaryFor(this.comparisonBaseIdSignal()),
      this.summaryFor(this.comparisonTargetIdSignal()),
    ),
  );

  /** Generated reports, newest first (US-30). */
  readonly reports = computed(() =>
    [...this.reportsSignal()].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),
  );

  readonly filteredReports = computed(() => {
    const filter = this.reportPeriodFilterSignal();
    return this.reports().filter((report) => filter === ALL_PERIODS || report.periodId === filter);
  });

  load(): void {
    const periods = this.repository.getPeriods();
    const summaries = this.repository.getSummaries();
    this.periodsSignal.set(periods);
    this.summariesSignal.set(summaries);
    this.goalsSignal.set(this.repository.getGoals());
    this.reportsSignal.set(this.repository.getReports());

    if (this.selectedPeriodIdSignal()) {
      return;
    }
    const periodsWithData = periods.filter((period) => this.summaryFor(period.id).hasData);
    const latest = periodsWithData.at(-1) ?? periods.at(-1);
    const previous = periodsWithData.at(-2) ?? latest;
    if (latest && previous) {
      this.selectedPeriodIdSignal.set(latest.id);
      this.comparisonBaseIdSignal.set(previous.id);
      this.comparisonTargetIdSignal.set(latest.id);
    }
  }

  selectPeriod(periodId: string): void {
    this.selectedPeriodIdSignal.set(periodId);
  }

  setComparisonBase(periodId: string): void {
    this.comparisonBaseIdSignal.set(periodId);
  }

  setComparisonTarget(periodId: string): void {
    this.comparisonTargetIdSignal.set(periodId);
  }

  setReportPeriodFilter(periodId: string): void {
    this.reportPeriodFilterSignal.set(periodId);
  }

  periodLabel(periodId: string): string {
    return this.periodsSignal().find((period) => period.id === periodId)?.label ?? periodId;
  }

  /**
   * Generates a period report (US-29) or a consolidated report (US-27).
   * Nothing is generated when the requested scope has no calculated results.
   */
  generateReport(type: ReportType, periodId: string): ReportGenerationResult {
    const total =
      type === 'consolidated'
        ? this.consolidatedTotal()
        : this.summaryFor(periodId).totalTonnesCo2e;
    if (total === null) {
      return 'insufficientData';
    }
    const report = this.repository.createReport(
      type,
      type === 'consolidated' ? ALL_PERIODS : periodId,
      total,
    );
    this.reportsSignal.update((reports) => [...reports, report]);
    return 'generated';
  }

  /** Downloads a report as CSV, or reports that it is not available (US-28). */
  downloadReport(report: Report): ReportDownloadResult {
    if (!report.isDownloadable) {
      return 'unavailable';
    }
    this.exporter.downloadCsv(`${report.title}.csv`, this.buildCsv(report));
    return 'downloaded';
  }

  resetDemoData(): void {
    this.reportsSignal.set(this.repository.reset());
    this.reportPeriodFilterSignal.set(ALL_PERIODS);
  }

  private summaryFor(periodId: string): EmissionSummary {
    return (
      this.summariesSignal().find((summary) => summary.periodId === periodId) ??
      EmissionSummary.empty(periodId)
    );
  }

  private summariesWithData(): EmissionSummary[] {
    return this.summariesSignal().filter((summary) => summary.hasData);
  }

  private consolidatedTotal(): number | null {
    const summaries = this.summariesWithData();
    if (!summaries.length) {
      return null;
    }
    return summaries.reduce((sum, summary) => sum + (summary.totalTonnesCo2e ?? 0), 0);
  }

  private buildCsv(report: Report): string {
    const summaries =
      report.periodId === ALL_PERIODS
        ? this.summariesWithData()
        : [this.summaryFor(report.periodId)];
    const scopeHeaders = EMISSION_SCOPES.map((scope) => `${scope} (t CO2e)`);

    const rows: (string | number)[][] = [
      ['EcoTrack environmental report'],
      ['Organization', this.organizationName],
      ['Report type', report.type],
      [
        'Period',
        report.periodId === ALL_PERIODS
          ? 'All periods with data'
          : this.periodLabel(report.periodId),
      ],
      ['Generated at', report.generatedAt],
      [],
      ['Period', ...scopeHeaders, 'Total (t CO2e)'],
      ...summaries.map((summary) => [
        this.periodLabel(summary.periodId),
        ...EMISSION_SCOPES.map((scope) => summary.tonnesFor(scope) ?? 'No data'),
        summary.totalTonnesCo2e ?? 'No data',
      ]),
    ];

    if (report.type === 'consolidated') {
      rows.push(
        [],
        ['Goal', 'Target reduction (%)', 'Progress (%)', 'Target date', 'Status'],
        ...this.goalsSignal().map((goal) => [
          goal.name,
          goal.targetReductionPercent,
          goal.progressPercent,
          goal.targetDate,
          goal.status,
        ]),
      );
    }

    return rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(',')).join('\r\n');
  }

  private escapeCsv(value: string | number): string {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
}
