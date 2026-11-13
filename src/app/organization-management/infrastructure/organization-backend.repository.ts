
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BACKEND_API_BASE_URL } from '../../shared/infrastructure/api/api.config';

import { OrganizationRepository } from '../domain/repository/organization.repository';
import { OrganizationApi } from './organization-api';

import { Organization } from '../domain/model/organization.entity';
import { Site } from '../domain/model/site.entity';
import { BusinessUnit } from '../domain/model/business-unit.entity';
import { OrganizationActivity } from '../domain/model/organization-activity.entity';

@Injectable({ providedIn: 'root' })
export class OrganizationBackendRepository extends OrganizationRepository {

  private readonly http = inject(HttpClient);
  private readonly mockApi = inject(OrganizationApi);

  private readonly baseUrl =
    `${BACKEND_API_BASE_URL}/organizations`;

  // Spring Boot: US-06
  createOrganization(
    organization: Omit<Organization, 'id'>
  ): Observable<Organization> {
    return this.http.post<Organization>(
      this.baseUrl,
      organization
    );
  }

  // Spring Boot: US-09
  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(
      `${this.baseUrl}/${id}`
    );
  }

  // Spring Boot: US-10
  updateOrganization(
    id: number,
    changes: Partial<Organization>
  ): Observable<Organization> {
    return this.http.patch<Organization>(
      `${this.baseUrl}/${id}`,
      changes
    );
  }

  // Mock API: sedes, pendientes de migrar
  getSites(organizationId: number): Observable<Site[]> {
    return this.mockApi.getSites(organizationId);
  }

  createSite(site: Omit<Site, 'id'>): Observable<Site> {
    return this.mockApi.createSite(site);
  }

  updateSite(id: number, changes: Partial<Site>): Observable<Site> {
    return this.mockApi.updateSite(id, changes);
  }

  deleteSite(id: number): Observable<void> {
    return this.mockApi.deleteSite(id);
  }

  // Mock API: unidades de negocio
  getBusinessUnits(organizationId: number): Observable<BusinessUnit[]> {
    return this.mockApi.getBusinessUnits(organizationId);
  }

  createBusinessUnit(
    unit: Omit<BusinessUnit, 'id'>
  ): Observable<BusinessUnit> {
    return this.mockApi.createBusinessUnit(unit);
  }

  updateBusinessUnit(
    id: number,
    changes: Partial<BusinessUnit>
  ): Observable<BusinessUnit> {
    return this.mockApi.updateBusinessUnit(id, changes);
  }

  deleteBusinessUnit(id: number): Observable<void> {
    return this.mockApi.deleteBusinessUnit(id);
  }

  // Mock API: historial de actividades
  getActivities(
    organizationId: number
  ): Observable<OrganizationActivity[]> {
    return this.mockApi.getActivities(organizationId);
  }

  createActivity(
    activity: Omit<OrganizationActivity, 'id'>
  ): Observable<OrganizationActivity> {
    return this.mockApi.createActivity(activity);
  }
}
