import { computed, inject, Service, signal } from '@angular/core';
import { ActivityDataItem } from '../domain/model/activity-data-item.model';
import { CalculationOutcome } from '../domain/model/calculation-outcome.model';
import { EmissionFactor } from '../domain/model/emission-factor.entity';
import { FootprintCalculation } from '../domain/model/footprint-calculation.entity';
import { FootprintRepository } from '../domain/repository/footprint.repository';
import {
  assessActivity,
  calculateFootprint,
  FactorAssignments,
} from '../domain/service/footprint-calculator';
import { buildHistory, summarizeByScope, totalOf } from '../domain/service/footprint-summary';
import { ActivityFactorRow } from './activity-factor-row.model';

@Service({ autoProvided: false })
export class FootprintStore {
  private readonly repository = inject(FootprintRepository);
  private readonly activitySignal = signal<readonly ActivityDataItem[]>([]);
  private readonly factorSignal = signal<readonly EmissionFactor[]>([]);
  private readonly assignmentSignal = signal<FactorAssignments>({});
  private readonly calculationSignal = signal<readonly FootprintCalculation[]>([]);
  private readonly periodSignal = signal('');
  private readonly outcomeSignal = signal<CalculationOutcome | null>(null);
  private readonly loadedSignal = signal(false);

  readonly period = this.periodSignal.asReadonly();
  readonly lastOutcome = this.outcomeSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();

  /** Every period that has activity data or a previous calculation, most recent first. */
  readonly periods = computed(() =>
    [
      ...new Set([
        ...this.activitySignal().map((activity) => activity.period),
        ...this.calculationSignal().map((calculation) => calculation.period),
      ]),
    ]
      .sort()
      .reverse(),
  );

  /** Activity data of the selected period with its factor selection (US-46). */
  readonly rows = computed<ActivityFactorRow[]>(() => {
    const factors = this.factorSignal();
    const factorById = new Map(factors.map((factor) => [factor.id, factor]));
    const assignments = this.assignmentSignal();

    return this.activitySignal()
      .filter((activity) => activity.period === this.periodSignal())
      .map((activity) => {
        const factor = factorById.get(assignments[activity.id] ?? '') ?? null;
        return {
          activity,
          factor,
          issue: assessActivity(activity, factor),
          compatibleFactors: factors.filter((candidate) => candidate.isCompatibleWith(activity)),
        };
      });
  });

  /** Results of the selected period (US-36). */
  readonly periodCalculations = computed(() =>
    this.calculationSignal().filter((calculation) => calculation.period === this.periodSignal()),
  );
  readonly periodTotal = computed(() => totalOf(this.periodCalculations()));

  /** Results of the selected period split by scope (US-35). */
  readonly scopeResults = computed(() => summarizeByScope(this.periodCalculations()));

  /** Previously calculated periods (US-37). */
  readonly history = computed(() => buildHistory(this.calculationSignal()));

  /** Items that prevented the last calculation from being completed (US-34). */
  readonly pendingIssues = computed(() => {
    const outcome = this.outcomeSignal();
    return outcome?.status === 'INCOMPLETE' ? outcome.pending : [];
  });

  /** Total of the last completed calculation, or null when it was not completed. */
  readonly completedTotal = computed(() => {
    const outcome = this.outcomeSignal();
    return outcome?.status === 'COMPLETED' ? outcome.total : null;
  });

  async load(): Promise<void> {
    const [activities, factors, assignments, calculations] = await Promise.all([
      this.repository.getActivityData(),
      this.repository.getEmissionFactors(),
      this.repository.getAssignments(),
      this.repository.getCalculations(),
    ]);

    this.activitySignal.set(activities);
    this.factorSignal.set(factors);
    this.assignmentSignal.set(assignments);
    this.calculationSignal.set(calculations);

    if (!this.periods().includes(this.periodSignal())) {
      this.periodSignal.set(this.periods()[0] ?? '');
    }
    this.loadedSignal.set(true);
  }

  selectPeriod(period: string): void {
    this.periodSignal.set(period);
    this.outcomeSignal.set(null);
  }

  async assignFactor(activityDataId: string, factorId: string | null): Promise<void> {
    await this.repository.saveAssignment(activityDataId, factorId);
    this.assignmentSignal.update((current) => {
      const next: Record<string, string> = { ...current };
      if (factorId) {
        next[activityDataId] = factorId;
      } else {
        delete next[activityDataId];
      }
      return next;
    });
    this.outcomeSignal.set(null);
  }

  async calculate(): Promise<CalculationOutcome> {
    const period = this.periodSignal();
    const outcome = calculateFootprint(
      period,
      this.activitySignal(),
      this.assignmentSignal(),
      this.factorSignal(),
      { calculatedAt: new Date().toISOString(), newId: () => crypto.randomUUID() },
    );

    if (outcome.status === 'COMPLETED') {
      await this.repository.replaceCalculations(period, outcome.calculations);
      this.calculationSignal.update((current) => [
        ...current.filter((calculation) => calculation.period !== period),
        ...outcome.calculations,
      ]);
    }

    this.outcomeSignal.set(outcome);
    return outcome;
  }

  async clearResults(): Promise<void> {
    await this.repository.clearCalculations();
    this.calculationSignal.set([]);
    this.outcomeSignal.set(null);
  }

  async resetDemoData(): Promise<void> {
    await this.repository.reset();
    this.outcomeSignal.set(null);
    await this.load();
  }
}
