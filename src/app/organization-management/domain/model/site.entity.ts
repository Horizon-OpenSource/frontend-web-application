export interface Site {
  id: number;
  organizationId: number;

  name: string;
  location: string;

  active: boolean;
  assignedUsers: number;
}
