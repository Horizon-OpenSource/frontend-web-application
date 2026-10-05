import { EmissionScope } from './emission-scope';

export class EmissionSource {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly name: string;
  readonly type: string;
  readonly scope: EmissionScope;
  readonly createdAt: string;

  constructor(source: {
    id: string;
    facilityId: string;
    facilityName: string;
    name: string;
    type: string;
    scope: EmissionScope;
    createdAt: string;
  }) {
    if (!source.name.trim() || !source.type.trim() || !source.facilityId.trim()) {
      throw new Error('Emission source name, type and facility are required.');
    }
    if (!Object.values(EmissionScope).includes(source.scope)) {
      throw new Error('A valid emission scope is required.');
    }

    this.id = source.id;
    this.facilityId = source.facilityId;
    this.facilityName = source.facilityName;
    this.name = source.name.trim();
    this.type = source.type.trim();
    this.scope = source.scope;
    this.createdAt = source.createdAt;
  }
}
