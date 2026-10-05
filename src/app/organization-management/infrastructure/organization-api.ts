import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Organization } from '../domain/model/organization.entity';
import { OrganizationActivity } from '../domain/model/organization-activity.entity';
import { Site } from '../domain/model/site.entity';
import { BusinessUnit } from '../domain/model/business-unit.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationApi {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000/api/v1';

  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(
      `${this.baseUrl}/organizations/${id}`
    );
  }

  getSites(organizationId: number): Observable<Site[]> {
    return this.http.get<Site[]>(
      `${this.baseUrl}/sites`,
      {
        params: { organizationId }
      }
    );
  }

  getBusinessUnits(organizationId: number): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(
      `${this.baseUrl}/business-units`,
      {
        params: { organizationId }
      }
    );
  }

  getActivities(organizationId: number): Observable<OrganizationActivity[]> {
    return this.http.get<OrganizationActivity[]>(
      `${this.baseUrl}/organization-activities`,
      {
        params: { organizationId }
      }
    );
  }

  updateOrganization(
    id: number,
    organization: Organization
  ): Observable<Organization> {
    return this.http.put<Organization>(
      `${this.baseUrl}/organizations/${id}`,
      organization
    );
  }

  createOrganization(
    organization: Omit<Organization, 'id'>
  ): Observable<Organization> {
    return this.http.post<Organization>(
      `${this.baseUrl}/organizations`,
      organization
    );
  }

  createSite(site: Omit<Site, 'id'>): Observable<Site> {
    return this.http.post<Site>(
      `${this.baseUrl}/sites`,
      site
    );
  }

  createBusinessUnit(
    businessUnit: Omit<BusinessUnit, 'id'>
  ): Observable<BusinessUnit> {
    return this.http.post<BusinessUnit>(
      `${this.baseUrl}/business-units`,
      businessUnit
    );
  }
}
