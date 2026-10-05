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

        this.activities.set(
          [...data.activities].sort(
            (a, b) =>
              b.occurredAt.localeCompare(
                a.occurredAt
              )
          )
        );

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

          this.organization.set(
            updatedOrganization
          );

          this.registerActivity(
            'ORGANIZATION_UPDATED',
            'Updated organization information'
          );
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

          this.sites.update(
            sites => [
              ...sites,
              createdSite
            ]
          );

          this.registerActivity(
            'SITE_CREATED',
            `Added new site: ${createdSite.name}`
          );
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
      .createBusinessUnit(
        businessUnit
      )
      .pipe(
        tap(createdBusinessUnit => {

          this.businessUnits.update(
            units => [
              ...units,
              createdBusinessUnit
            ]
          );

          this.registerActivity(
            'BUSINESS_UNIT_CREATED',
            `Added business unit: ${createdBusinessUnit.name}`
          );
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

  updateSite(
    id: number,
    changes: Partial<Site>
  ): Observable<Site> {

    return this.organizationApi
      .updateSite(id, changes)
      .pipe(
        tap(updatedSite => {

          this.sites.update(
            sites =>
              sites.map(
                site =>
                  site.id === id
                    ? updatedSite
                    : site
              )
          );

          this.registerActivity(
            'SITE_UPDATED',
            `Updated site: ${updatedSite.name}`
          );
        })
      );
  }


  deleteSite(
    id: number
  ): Observable<void> {

    const site =
      this.sites()
        .find(
          item =>
            item.id === id
        );

    return this.organizationApi
      .deleteSite(id)
      .pipe(
        tap(() => {

          this.sites.update(
            sites =>
              sites.filter(
                item =>
                  item.id !== id
              )
          );

          this.registerActivity(
            'SITE_DELETED',
            `Deleted site: ${site?.name ?? id}`
          );
        })
      );
  }


  updateBusinessUnit(
    id: number,
    changes: Partial<BusinessUnit>
  ): Observable<BusinessUnit> {

    return this.organizationApi
      .updateBusinessUnit(
        id,
        changes
      )
      .pipe(
        tap(updatedBusinessUnit => {

          this.businessUnits.update(
            units =>
              units.map(
                unit =>
                  unit.id === id
                    ? updatedBusinessUnit
                    : unit
              )
          );

          this.registerActivity(
            'BUSINESS_UNIT_UPDATED',
            `Updated business unit: ${updatedBusinessUnit.name}`
          );
        })
      );
  }


  deleteBusinessUnit(
    id: number
  ): Observable<void> {

    const businessUnit =
      this.businessUnits()
        .find(
          unit =>
            unit.id === id
        );

    return this.organizationApi
      .deleteBusinessUnit(id)
      .pipe(
        tap(() => {

          this.businessUnits.update(
            units =>
              units.filter(
                unit =>
                  unit.id !== id
              )
          );

          this.registerActivity(
            'BUSINESS_UNIT_DELETED',
            `Deleted business unit: ${businessUnit?.name ?? id}`
          );
        })
      );
  }

  private registerActivity(
    type: string,
    description: string
  ): void {

    this.organizationApi
      .createActivity({
        organizationId:
          this.currentOrganizationId(),

        type,

        description,

        occurredAt:
          new Date().toISOString()
      })
      .subscribe({

        next: activity => {

          this.activities.update(
            activities => [
              activity,
              ...activities
            ]
          );
        },

        error: error => {

          console.error(
            'Unable to register activity',
            error
          );
        }
      });
  }
}
