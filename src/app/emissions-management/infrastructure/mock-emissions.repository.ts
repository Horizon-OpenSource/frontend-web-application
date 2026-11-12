import { Injectable } from '@angular/core';
import { ActivityData } from '../domain/model/activity-data.entity';
import { EmissionRecord, EmissionRecordInput, FacilityOption } from '../domain/model/emission-record.model';
import { EmissionScope } from '../domain/model/emission-scope';
import { EmissionSource } from '../domain/model/emission-source.entity';

const STORAGE_KEY = 'ecotrack-emission-records';

const FACILITIES: FacilityOption[] = [
  { id: 'facility-lima', name: 'Lima Production Plant' },
  { id: 'facility-callao', name: 'Callao Logistics Center' },
  { id: 'facility-office', name: 'Corporate Office' }
];

const MOCK_RECORDS: EmissionRecord[] = [
  createRecord('src-001', 'act-001', 'Natural gas boiler', 'Stationary combustion', FACILITIES[0], EmissionScope.Scope1, 1250, 'm³', '2026-01', 'MANUAL'),
  createRecord('src-002', 'act-002', 'Delivery fleet', 'Mobile combustion', FACILITIES[1], EmissionScope.Scope1, 3860, 'L', '2026-02', 'CSV'),
  createRecord('src-003', 'act-003', 'Purchased electricity', 'Electricity consumption', FACILITIES[0], EmissionScope.Scope2, 48200, 'kWh', '2026-01', 'MANUAL'),
  createRecord('src-004', 'act-004', 'Corporate office electricity', 'Electricity consumption', FACILITIES[2], EmissionScope.Scope2, 12950, 'kWh', '2026-03', 'API'),
  createRecord('src-005', 'act-005', 'Business air travel', 'Business travel', FACILITIES[2], EmissionScope.Scope3, 18750, 'km', '2026-02', 'MANUAL'),
  createRecord('src-006', 'act-006', 'Raw material transport', 'Upstream transportation', FACILITIES[1], EmissionScope.Scope3, 9420, 'ton-km', '2026-03', 'CSV')
];

@Injectable({ providedIn: 'root' })
export class MockEmissionsRepository {
  readonly facilities = FACILITIES;

  getAll(): EmissionRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      const initial = this.hydrate(MOCK_RECORDS);
      this.save(initial);
      return initial;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error('Expected an array.');
      return this.hydrate(parsed as EmissionRecord[]);
    } catch {
      // Never overwrite existing data when parsing or validation fails.
      throw new Error('Saved emission records could not be read.');
    }
  }

  create(input: EmissionRecordInput): EmissionRecord {
    this.validateFacility(input);
    const now = new Date().toISOString();
    const sourceId = crypto.randomUUID();
    const record: EmissionRecord = {
      source: new EmissionSource({
        id: sourceId,
        facilityId: input.facilityId,
        facilityName: input.facilityName,
        name: input.sourceName,
        type: input.sourceType,
        scope: input.scope,
        createdAt: now
      }),
      activityData: new ActivityData({
        id: crypto.randomUUID(),
        emissionSourceId: sourceId,
        period: input.period,
        quantity: input.quantity,
        unit: input.unit,
        origin: input.origin,
        recordedAt: now
      })
    };
    this.save([...this.getAll(), record]);
    return record;
  }

  update(activityDataId: string, input: EmissionRecordInput): EmissionRecord {
    this.validateFacility(input);
    const records = this.getAll();
    const current = records.find(record => record.activityData.id === activityDataId);
    if (!current) throw new Error('Emission record not found.');

    const updated: EmissionRecord = {
      source: new EmissionSource({
        id: current.source.id,
        facilityId: input.facilityId,
        facilityName: input.facilityName,
        name: input.sourceName,
        type: input.sourceType,
        scope: input.scope,
        createdAt: current.source.createdAt
      }),
      activityData: new ActivityData({
        id: current.activityData.id,
        emissionSourceId: current.source.id,
        period: input.period,
        quantity: input.quantity,
        unit: input.unit,
        origin: input.origin,
        recordedAt: current.activityData.recordedAt
      })
    };
    this.save(records.map(record => record.activityData.id === activityDataId ? updated : record));
    return updated;
  }

  delete(activityDataId: string): void {
    const records = this.getAll();
    if (!records.some(record => record.activityData.id === activityDataId)) {
      throw new Error('Emission record not found.');
    }
    this.save(records.filter(record => record.activityData.id !== activityDataId));
  }

  reset(): EmissionRecord[] {
    this.save(MOCK_RECORDS);
    return MOCK_RECORDS;
  }

  private validateFacility(input: EmissionRecordInput): void {
    if (!this.facilities.some(facility => facility.id === input.facilityId && facility.name === input.facilityName)) {
      throw new Error('A valid facility is required.');
    }
  }

  private save(records: EmissionRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  private hydrate(records: EmissionRecord[]): EmissionRecord[] {
    const ids = new Set<string>();
    return records.map(record => {
      const source = new EmissionSource(record.source);
      const activityData = new ActivityData(record.activityData);
      if (activityData.emissionSourceId !== source.id || ids.has(activityData.id)) {
        throw new Error('Invalid or duplicated emission record.');
      }
      ids.add(activityData.id);
      return { source, activityData };
    });
  }
}

function createRecord(
  sourceId: string,
  activityId: string,
  name: string,
  type: string,
  facility: FacilityOption,
  scope: EmissionScope,
  quantity: number,
  unit: string,
  period: string,
  origin: 'MANUAL' | 'CSV' | 'API'
): EmissionRecord {
  return {
    source: new EmissionSource({ id: sourceId, facilityId: facility.id, facilityName: facility.name, name, type, scope, createdAt: '2026-01-05T10:00:00.000Z' }),
    activityData: new ActivityData({ id: activityId, emissionSourceId: sourceId, period, quantity, unit, origin, recordedAt: '2026-03-10T14:30:00.000Z' })
  };
}
