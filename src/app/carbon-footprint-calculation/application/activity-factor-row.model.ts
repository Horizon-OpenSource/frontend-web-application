import { ActivityDataItem } from '../domain/model/activity-data-item.model';
import { PendingReason } from '../domain/model/calculation-outcome.model';
import { EmissionFactor } from '../domain/model/emission-factor.entity';

/** An activity data record together with its emission factor selection and readiness. */
export interface ActivityFactorRow {
  readonly activity: ActivityDataItem;
  /** Factor currently selected for the record, or null when none was selected. */
  readonly factor: EmissionFactor | null;
  /** Why the record cannot be calculated yet, or null when it is ready. */
  readonly issue: PendingReason | null;
  /** Factors that can be selected for the record (same scope and unit). */
  readonly compatibleFactors: readonly EmissionFactor[];
}
