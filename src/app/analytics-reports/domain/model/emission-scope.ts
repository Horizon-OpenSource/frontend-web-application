/**
 * GHG Protocol scopes used by the Analytics and Reports bounded context.
 * Defined locally so this BC does not depend on Emissions Management.
 */
export type EmissionScope = 'scope1' | 'scope2' | 'scope3';

export const EMISSION_SCOPES: readonly EmissionScope[] = ['scope1', 'scope2', 'scope3'];
