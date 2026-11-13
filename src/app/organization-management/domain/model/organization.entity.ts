export interface Organization {
  id: number;
  name: string;
  industry: string;

  addressLine1: string;
  addressLine2: string;

  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;

  contactEmail: string;
  phone: string;

  activeUsers: number;
}
