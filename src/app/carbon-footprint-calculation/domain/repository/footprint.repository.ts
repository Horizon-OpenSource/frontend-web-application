import { ActivityDataItem } from '../model/activity-data-item.model';
import { EmissionFactor } from '../model/emission-factor.entity';
import { FootprintCalculation } from '../model/footprint-calculation.entity';

/**
 * Port used by the application layer. Today it is implemented by an in-memory mock;
 * when the Spring Boot API is available, an HTTP implementation replaces it.
 */
export abstract class FootprintRepository {
  abstract getActivityData(): Promise<ActivityDataItem[]>;
  abstract getEmissionFactors(): Promise<EmissionFactor[]>;
  abstract getAssignments(): Promise<Record<string, string>>;
  abstract saveAssignment(activityDataId: string, emissionFactorId: string | null): Promise<void>;
  abstract getCalculations(): Promise<FootprintCalculation[]>;
  abstract replaceCalculations(
    period: string,
    calculations: readonly FootprintCalculation[],
  ): Promise<void>;
  abstract clearCalculations(): Promise<void>;
  abstract reset(): Promise<void>;
}
