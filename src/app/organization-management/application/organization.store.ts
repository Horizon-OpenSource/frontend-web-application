import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import { Observable, forkJoin, tap } from 'rxjs';

import { OrganizationApi } from '../infrastructure/organization-api';

import { Organization } from '../domain/model/organization.entity';
import { OrganizationActivity } from '../domain/model/organization-activity.entity';
import { Site } from '../domain/model/site.entity';
import { BusinessUnit } from '../domain/model/business-unit.entity';

@Injectable({
  providedIn: 'root'
})
export class OrganizationStore {

  private readonly organizationApi = inject(OrganizationApi);

  private readonly organizationStorageKey =
    'ecotrack.currentOrganizationId';

  readonly organization = signal<Organization | null>(null);

  readonly sites = signal<Site[]>([]);

  readonly businessUnits = signal<BusinessUnit[]>([]);

  readonly activities = signal<OrganizationActivity[]>([]);

  readonly loading = signal(false);

  readonly error = signal(false);

  readonly currentOrganizationId = signal(
    this.getStoredOrganizationId()
  );

  readonly registeredSites = computed(
    () => this.sites().length
  );

  readonly registeredBusinessUnits = computed(
    () => this.businessUnits().length
  );

  loadOverview(
    organizationId: number = this.currentOrganizationId()
  ): void {

    this.setCurrentOrganizationId(organizationId);

    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      organization:
        this.organizationApi.getOrganization(organizationId),

      sites:
        this.organizationApi.getSites(organizationId),

      businessUnits:
        this.organizationApi.getBusinessUnits(organizationId),

      activities:
        this.organizationApi.getActivities(organizationId)
    }).subscribe({
      next: data => {

        this.organization.set(data.organization);

        this.sites.set(data.sites);

        this.businessUnits.set(data.businessUnits);

        this.activities.set(data.activities);

        this.loading.set(false);
      },

      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  updateOrganization(
    changes: Partial<Organization>
  ): Observable<Organization> {

    return this.organizationApi
      .updateOrganization(
        this.currentOrganizationId(),
        changes
      )
      .pipe(
        tap(updatedOrganization => {
          this.organization.set(updatedOrganization);
        })
      );
  }

  loadSites(
    organizationId: number = this.currentOrganizationId()
  ): void {

    this.loading.set(true);
    this.error.set(false);

    this.organizationApi
      .getSites(organizationId)
      .subscribe({
        next: sites => {
          this.sites.set(sites);
          this.loading.set(false);
        },

        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
  }

  createSite(
    site: Omit<Site, 'id'>
  ): Observable<Site> {

    return this.organizationApi
      .createSite(site)
      .pipe(
        tap(createdSite => {
          this.sites.update(sites => [
            ...sites,
            createdSite
          ]);
        })
      );
  }

  loadBusinessUnits(
    organizationId: number = this.currentOrganizationId()
  ): void {

    this.loading.set(true);
    this.error.set(false);

    this.organizationApi
      .getBusinessUnits(organizationId)
      .subscribe({
        next: businessUnits => {

          this.businessUnits.set(businessUnits);

          this.loading.set(false);
        },

        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
  }

  createBusinessUnit(
    businessUnit: Omit<BusinessUnit, 'id'>
  ): Observable<BusinessUnit> {

    return this.organizationApi
      .createBusinessUnit(businessUnit)
      .pipe(
        tap(createdBusinessUnit => {

          this.businessUnits.update(units => [
            ...units,
            createdBusinessUnit
          ]);

        })
      );
  }

  createOrganization(
    organization: Omit<Organization, 'id'>
  ): Observable<Organization> {

    return this.organizationApi
      .createOrganization(organization)
      .pipe(
        tap(createdOrganization => {

          this.setCurrentOrganizationId(
            createdOrganization.id
          );

          this.organization.set(
            createdOrganization
          );

          this.sites.set([]);

          this.businessUnits.set([]);

          this.activities.set([]);
        })
      );
  }

  private setCurrentOrganizationId(
    id: number
  ): void {

    this.currentOrganizationId.set(id);

    localStorage.setItem(
      this.organizationStorageKey,
      String(id)
    );
  }

  private getStoredOrganizationId(): number {

    const storedValue = localStorage.getItem(
      this.organizationStorageKey
    );

    const organizationId = Number(storedValue);

    return Number.isInteger(organizationId)
    && organizationId > 0
      ? organizationId
      : 1;
  }
}
