import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../shared/infrastructure/api/api.config';

import { Organization } from '../domain/model/organization.entity';
import { OrganizationActivity } from '../domain/model/organization-activity.entity';
import { Site } from '../domain/model/site.entity';
import { BusinessUnit } from '../domain/model/business-unit.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationApi {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = API_BASE_URL;

  getOrganization(
    id: number
  ): Observable<Organization> {

    return this.http.get<Organization>(
      `${this.baseUrl}/organizations/${id}`
    );
  }

  getSites(
    organizationId: number
  ): Observable<Site[]> {

    return this.http.get<Site[]>(
      `${this.baseUrl}/sites`,
      {
        params: { organizationId }
      }
    );
  }

  getBusinessUnits(
    organizationId: number
  ): Observable<BusinessUnit[]> {

    return this.http.get<BusinessUnit[]>(
      `${this.baseUrl}/business-units`,
      {
        params: { organizationId }
      }
    );
  }

  getActivities(
    organizationId: number
  ): Observable<OrganizationActivity[]> {

    return this.http.get<OrganizationActivity[]>(
      `${this.baseUrl}/organization-activities`,
      {
        params: { organizationId }
      }
    );
  }

  updateOrganization(
    id: number,
    changes: Partial<Organization>
  ): Observable<Organization> {

    return this.http.patch<Organization>(
      `${this.baseUrl}/organizations/${id}`,
      changes
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

  createSite(
    site: Omit<Site, 'id'>
  ): Observable<Site> {

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

  updateSite(
    id: number,
    changes: Partial<Site>
  ): Observable<Site> {

    return this.http.patch<Site>(
      `${this.baseUrl}/sites/${id}`,
      changes
    );
  }

  deleteSite(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/sites/${id}`
    );
  }

  updateBusinessUnit(
    id: number,
    changes: Partial<BusinessUnit>
  ): Observable<BusinessUnit> {

    return this.http.patch<BusinessUnit>(
      `${this.baseUrl}/business-units/${id}`,
      changes
    );
  }

  deleteBusinessUnit(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/business-units/${id}`
    );
  }

  createActivity(
    activity: Omit<OrganizationActivity, 'id'>
  ): Observable<OrganizationActivity> {

    return this.http.post<OrganizationActivity>(
      `${this.baseUrl}/organization-activities`,
      activity
    );
  }
}
