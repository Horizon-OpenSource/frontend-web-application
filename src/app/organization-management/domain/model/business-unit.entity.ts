export interface BusinessUnit {
  id: number;
  organizationId: number;
  siteId: number;

  name: string;
  code: string;
  responsible: string;
  description: string;

  active: boolean;
  emissionSourceCount: number;
}
