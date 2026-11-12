import { EmissionScope } from './emission-scope';
import { isNonBlank, isValidScope, SOURCE_NAME_MAX_LENGTH, SOURCE_TYPE_MAX_LENGTH } from './emission-validation';

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
    if (!isNonBlank(source.id, 128) || !isNonBlank(source.facilityId, 128) || !isNonBlank(source.facilityName, 120)) {
      throw new Error('Source and facility identifiers and facility name are required.');
    }
    if (!isNonBlank(source.name, SOURCE_NAME_MAX_LENGTH) || !isNonBlank(source.type, SOURCE_TYPE_MAX_LENGTH)) {
      throw new Error('A valid source name and type are required.');
    }
    if (!isValidScope(source.scope)) {
      throw new Error('A valid emission scope is required.');
    }
    if (typeof source.createdAt !== 'string' || !Number.isFinite(Date.parse(source.createdAt))) {
      throw new Error('A valid source creation date is required.');
    }

    this.id = source.id.trim();
    this.facilityId = source.facilityId.trim();
    this.facilityName = source.facilityName.trim();
    this.name = source.name.trim();
    this.type = source.type.trim();
    this.scope = source.scope;
    this.createdAt = source.createdAt;
  }
}
