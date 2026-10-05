import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  forkJoin,
  map,
  Observable,
  switchMap
} from 'rxjs';

import { API_BASE_URL } from '../../shared/infrastructure/api/api.config';

import {
  ActivityData,
  ActivityDataOrigin
} from '../domain/model/activity-data.entity';

import {
  EmissionRecord,
  EmissionRecordInput,
  FacilityOption
} from '../domain/model/emission-record.model';

import { EmissionScope } from '../domain/model/emission-scope';

import { EmissionSource } from '../domain/model/emission-source.entity';


interface EmissionSourceDto {
  id: string;
  organizationId: number;
  facilityId: string;
  facilityName: string;
  name: string;
  type: string;
  scope: EmissionScope;
  createdAt: string;
}


interface ActivityDataDto {
  id: string;
  organizationId: number;
  emissionSourceId: string;
  period: string;
  quantity: number;
  unit: string;
  origin: ActivityDataOrigin;
  recordedAt: string;
}


interface SiteDto {
  id: number;
  organizationId: number;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmissionsApiRepository {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    API_BASE_URL;


  getAll(): Observable<EmissionRecord[]> {

    const organizationId =
      this.getCurrentOrganizationId();

    return forkJoin({
      sources: this.http.get<EmissionSourceDto[]>(
        `${this.baseUrl}/emission-sources`,
        {
          params: {
            organizationId
          }
        }
      ),

      activities: this.http.get<ActivityDataDto[]>(
        `${this.baseUrl}/activity-data`,
        {
          params: {
            organizationId
          }
        }
      )
    }).pipe(
      map(({ sources, activities }) =>
        activities
          .map(activity => {

            const source =
              sources.find(
                item =>
                  item.id ===
                  activity.emissionSourceId
              );

            if (!source) {
              return null;
            }

            return this.toRecord(
              source,
              activity
            );
          })
          .filter(
            (
              record
            ): record is EmissionRecord =>
              record !== null
          )
      )
    );
  }


  getFacilities():
    Observable<FacilityOption[]> {

    const organizationId =
      this.getCurrentOrganizationId();

    return this.http
      .get<SiteDto[]>(
        `${this.baseUrl}/sites`,
        {
          params: {
            organizationId
          }
        }
      )
      .pipe(
        map(sites =>
          sites.map(site => ({
            id: String(site.id),
            name: site.name
          }))
        )
      );
  }


  create(
    input: EmissionRecordInput
  ): Observable<EmissionRecord> {

    const organizationId =
      this.getCurrentOrganizationId();

    const now =
      new Date().toISOString();

    const sourceId =
      crypto.randomUUID();

    const activityId =
      crypto.randomUUID();


    const source: EmissionSourceDto = {
      id: sourceId,
      organizationId,
      facilityId: input.facilityId,
      facilityName: input.facilityName,
      name: input.sourceName,
      type: input.sourceType,
      scope: input.scope,
      createdAt: now
    };


    const activity: ActivityDataDto = {
      id: activityId,
      organizationId,
      emissionSourceId: sourceId,
      period: input.period,
      quantity: input.quantity,
      unit: input.unit,
      origin: input.origin,
      recordedAt: now
    };


    return this.http
      .post<EmissionSourceDto>(
        `${this.baseUrl}/emission-sources`,
        source
      )
      .pipe(
        switchMap(createdSource =>
          this.http
            .post<ActivityDataDto>(
              `${this.baseUrl}/activity-data`,
              activity
            )
            .pipe(
              map(createdActivity =>
                this.toRecord(
                  createdSource,
                  createdActivity
                )
              )
            )
        )
      );
  }


  update(
    activityDataId: string,
    input: EmissionRecordInput
  ): Observable<EmissionRecord> {

    return this.http
      .get<ActivityDataDto>(
        `${this.baseUrl}/activity-data/${activityDataId}`
      )
      .pipe(
        switchMap(currentActivity =>

          forkJoin({
            source:
              this.http.patch<EmissionSourceDto>(
                `${this.baseUrl}/emission-sources/${currentActivity.emissionSourceId}`,
                {
                  facilityId:
                  input.facilityId,

                  facilityName:
                  input.facilityName,

                  name:
                  input.sourceName,

                  type:
                  input.sourceType,

                  scope:
                  input.scope
                }
              ),

            activity:
              this.http.patch<ActivityDataDto>(
                `${this.baseUrl}/activity-data/${activityDataId}`,
                {
                  period:
                  input.period,

                  quantity:
                  input.quantity,

                  unit:
                  input.unit,

                  origin:
                  input.origin
                }
              )
          })
        ),

        map(result =>
          this.toRecord(
            result.source,
            result.activity
          )
        )
      );
  }


  delete(
    activityDataId: string
  ): Observable<void> {

    return this.http
      .get<ActivityDataDto>(
        `${this.baseUrl}/activity-data/${activityDataId}`
      )
      .pipe(
        switchMap(activity =>
          forkJoin([
            this.http.delete(
              `${this.baseUrl}/activity-data/${activityDataId}`
            ),

            this.http.delete(
              `${this.baseUrl}/emission-sources/${activity.emissionSourceId}`
            )
          ])
        ),

        map(() => void 0)
      );
  }


  private toRecord(
    source: EmissionSourceDto,
    activity: ActivityDataDto
  ): EmissionRecord {

    return {
      source: new EmissionSource({
        id: source.id,
        facilityId: source.facilityId,
        facilityName: source.facilityName,
        name: source.name,
        type: source.type,
        scope: source.scope,
        createdAt: source.createdAt
      }),

      activityData: new ActivityData({
        id: activity.id,
        emissionSourceId:
        activity.emissionSourceId,
        period: activity.period,
        quantity: activity.quantity,
        unit: activity.unit,
        origin: activity.origin,
        recordedAt: activity.recordedAt
      })
    };
  }


  private getCurrentOrganizationId():
    number {

    const storedValue =
      localStorage.getItem(
        'ecotrack.currentOrganizationId'
      );

    const organizationId =
      Number(storedValue);

    return Number.isInteger(
      organizationId
    ) && organizationId > 0
      ? organizationId
      : 1;
  }
}
