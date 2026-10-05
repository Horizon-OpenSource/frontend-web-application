import { ActivityDataItem } from '../model/activity-data-item.model';
import {
  CalculationOutcome,
  PendingIssue,
  PendingReason,
} from '../model/calculation-outcome.model';
import { EmissionFactor } from '../model/emission-factor.entity';
import { FootprintCalculation, roundCo2e } from '../model/footprint-calculation.entity';

/** Emission factor chosen for each activity data record, keyed by activity data id. */
export type FactorAssignments = Readonly<Record<string, string>>;

export interface CalculationContext {
  readonly calculatedAt: string;
  readonly newId: () => string;
}

/**
 * Explains why an activity data record cannot be calculated with the given factor.
 * Returns null when the record is ready to be calculated.
 */
export function assessActivity(
  activity: ActivityDataItem,
  factor: EmissionFactor | null | undefined,
): PendingReason | null {
  if (!Number.isFinite(activity.quantity) || activity.quantity <= 0 || !activity.unit.trim()) {
    return 'MISSING_INFORMATION';
  }
  if (!factor) {
    return 'MISSING_FACTOR';
  }
  if (!factor.isCompatibleWith(activity)) {
    return 'INCOMPATIBLE_FACTOR';
  }
  return null;
}

/**
 * Calculates the carbon footprint of a reporting period.
 * The calculation is all-or-nothing: if any record lacks information or a valid factor,
 * nothing is calculated and every pending item is reported.
 */
export function calculateFootprint(
  period: string,
  activities: readonly ActivityDataItem[],
  assignments: FactorAssignments,
  factors: readonly EmissionFactor[],
  context: CalculationContext,
): CalculationOutcome {
  const periodActivities = activities.filter((activity) => activity.period === period);
  if (!periodActivities.length) {
    return { status: 'INCOMPLETE', period, pending: [{ reason: 'NO_ACTIVITY_DATA' }] };
  }

  const factorById = new Map(factors.map((factor) => [factor.id, factor]));
  const pending: PendingIssue[] = [];
  const ready: { activity: ActivityDataItem; factor: EmissionFactor }[] = [];

  for (const activity of periodActivities) {
    const factor = factorById.get(assignments[activity.id] ?? '') ?? null;
    const reason = assessActivity(activity, factor);
    if (reason) {
      pending.push({ reason, activityDataId: activity.id, sourceName: activity.sourceName });
    } else if (factor) {
      ready.push({ activity, factor });
    }
  }

  if (pending.length) {
    return { status: 'INCOMPLETE', period, pending };
  }

  const calculations = ready.map(
    ({ activity, factor }) =>
      new FootprintCalculation({
        id: context.newId(),
        activityDataId: activity.id,
        emissionFactorId: factor.id,
        sourceName: activity.sourceName,
        factorName: factor.name,
        scope: activity.scope,
        period,
        quantity: activity.quantity,
        unit: activity.unit,
        factorValue: factor.value,
        resultValue: roundCo2e(activity.quantity * factor.value),
        calculatedAt: context.calculatedAt,
      }),
  );

  return {
    status: 'COMPLETED',
    period,
    calculations,
    total: roundCo2e(calculations.reduce((sum, calculation) => sum + calculation.resultValue, 0)),
  };
}
