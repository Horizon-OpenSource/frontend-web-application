import { ActivityData, ActivityDataOrigin } from './activity-data.entity';
import { EmissionScope } from './emission-scope';
import { EmissionSource } from './emission-source.entity';

export interface EmissionRecord {
  source: EmissionSource;
  activityData: ActivityData;
}

export interface EmissionRecordInput {
  sourceName: string;
  sourceType: string;
  facilityId: string;
  facilityName: string;
  scope: EmissionScope;
  quantity: number;
  unit: string;
  period: string;
  origin: ActivityDataOrigin;
}

export interface FacilityOption {
  id: string;
  name: string;
}
