import { FootprintScope } from './footprint-scope';

/**
 * Activity data as the calculation consumes it. In the integrated product this
 * information is provided by Emissions Management; this bounded context keeps
 * its own read model so it does not depend on another bounded context.
 */
export interface ActivityDataItem {
  readonly id: string;
  readonly emissionSourceId: string;
  readonly sourceName: string;
  readonly facilityName: string;
  readonly scope: FootprintScope;
  readonly period: string;
  readonly quantity: number;
  readonly unit: string;
}
