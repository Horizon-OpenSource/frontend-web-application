export interface OrganizationActivity {
  id: number;
  organizationId: number;

  type: string;
  description: string;
  occurredAt: string;
}
