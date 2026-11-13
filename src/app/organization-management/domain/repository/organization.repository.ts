import { Observable } from 'rxjs';

import { Organization } from '../model/organization.entity';
import { Site } from '../model/site.entity';
import { BusinessUnit } from '../model/business-unit.entity';
import { OrganizationActivity } from '../model/organization-activity.entity';

/**
 * Repository contract for Organization Management.
 * @author Javier Tello Murga
 */
export abstract class OrganizationRepository {

  abstract getOrganization(id: number): Observable<Organization>;

  abstract getSites(organizationId: number): Observable<Site[]>;

  abstract getBusinessUnits(organizationId: number): Observable<BusinessUnit[]>;

  abstract getActivities(organizationId: number): Observable<OrganizationActivity[]>;

  abstract createOrganization(
    organization: Omit<Organization, 'id'>
  ): Observable<Organization>;

  abstract updateOrganization(
    id: number,
    changes: Partial<Organization>
  ): Observable<Organization>;

  abstract createSite(site: Omit<Site, 'id'>): Observable<Site>;

  abstract updateSite(
    id: number,
    changes: Partial<Site>
  ): Observable<Site>;

  abstract deleteSite(id: number): Observable<void>;

  abstract createBusinessUnit(
    unit: Omit<BusinessUnit, 'id'>
  ): Observable<BusinessUnit>;

  abstract updateBusinessUnit(
    id: number,
    changes: Partial<BusinessUnit>
  ): Observable<BusinessUnit>;

  abstract deleteBusinessUnit(id: number): Observable<void>;

  abstract createActivity(
    activity: Omit<OrganizationActivity, 'id'>
  ): Observable<OrganizationActivity>;
}
