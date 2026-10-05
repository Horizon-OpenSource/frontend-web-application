import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';

import {
  forkJoin,
  Observable,
  tap
} from 'rxjs';

import {
  EmissionRecord,
  EmissionRecordInput,
  FacilityOption
} from '../domain/model/emission-record.model';

import {
  EmissionScope
} from '../domain/model/emission-scope';

import {
  EmissionsApiRepository
} from '../infrastructure/emissions-api.repository';


@Injectable({
  providedIn: 'root'
})
export class EmissionsStore {

  private readonly repository =
    inject(EmissionsApiRepository);


  private readonly recordsSignal =
    signal<EmissionRecord[]>([]);

  private readonly facilitiesSignal =
    signal<FacilityOption[]>([]);

  private readonly searchSignal =
    signal('');

  private readonly scopeSignal =
    signal<EmissionScope | 'ALL'>(
      'ALL'
    );

  private readonly periodSignal =
    signal('ALL');

  private readonly sourceSignal =
    signal('ALL');


  readonly records =
    this.recordsSignal.asReadonly();

  readonly facilities =
    this.facilitiesSignal.asReadonly();

  readonly search =
    this.searchSignal.asReadonly();

  readonly scope =
    this.scopeSignal.asReadonly();

  readonly period =
    this.periodSignal.asReadonly();

  readonly source =
    this.sourceSignal.asReadonly();


  readonly periods = computed(() =>
    [
      ...new Set(
        this.recordsSignal()
          .map(
            record =>
              record.activityData.period
          )
      )
    ]
      .sort()
      .reverse()
  );


  readonly sourceOptions =
    computed(() =>
      [
        ...new Set(
          this.recordsSignal()
            .map(
              record =>
                record.source.name
            )
        )
      ].sort()
    );


  readonly filteredRecords =
    computed(() => {

      const term =
        this.searchSignal()
          .trim()
          .toLowerCase();

      const scope =
        this.scopeSignal();

      const period =
        this.periodSignal();

      const source =
        this.sourceSignal();


      return this.recordsSignal()
        .filter(record => {

          const searchable = [
            record.source.name,
            record.source.type,
            record.source.facilityName,
            record.activityData.unit,
            record.activityData.origin
          ]
            .join(' ')
            .toLowerCase();


          return (
              !term ||
              searchable.includes(term)
            )
            &&
            (
              scope === 'ALL' ||
              record.source.scope === scope
            )
            &&
            (
              period === 'ALL' ||
              record.activityData.period === period
            )
            &&
            (
              source === 'ALL' ||
              record.source.name === source
            );
        });
    });


  readonly totalRecords =
    computed(
      () =>
        this.recordsSignal().length
    );


  readonly scope1Count =
    computed(
      () =>
        this.countByScope(
          EmissionScope.Scope1
        )
    );


  readonly scope2Count =
    computed(
      () =>
        this.countByScope(
          EmissionScope.Scope2
        )
    );


  readonly scope3Count =
    computed(
      () =>
        this.countByScope(
          EmissionScope.Scope3
        )
    );


  load(): void {

    forkJoin({
      records:
        this.repository.getAll(),

      facilities:
        this.repository.getFacilities()
    }).subscribe({
      next: result => {

        this.recordsSignal.set(
          result.records
        );

        this.facilitiesSignal.set(
          result.facilities
        );
      }
    });
  }


  setSearch(
    value: string
  ): void {

    this.searchSignal.set(value);
  }


  setScope(
    value: EmissionScope | 'ALL'
  ): void {

    this.scopeSignal.set(value);
  }


  setPeriod(
    value: string
  ): void {

    this.periodSignal.set(value);
  }


  setSource(
    value: string
  ): void {

    this.sourceSignal.set(value);
  }


  clearFilters(): void {

    this.searchSignal.set('');

    this.scopeSignal.set('ALL');

    this.periodSignal.set('ALL');

    this.sourceSignal.set('ALL');
  }


  create(
    input: EmissionRecordInput
  ): Observable<EmissionRecord> {

    return this.repository
      .create(input)
      .pipe(
        tap(record => {

          this.recordsSignal.update(
            records => [
              ...records,
              record
            ]
          );
        })
      );
  }


  update(
    activityDataId: string,
    input: EmissionRecordInput
  ): Observable<EmissionRecord> {

    return this.repository
      .update(
        activityDataId,
        input
      )
      .pipe(
        tap(updated => {

          this.recordsSignal.update(
            records =>
              records.map(
                record =>
                  record.activityData.id ===
                  activityDataId
                    ? updated
                    : record
              )
          );
        })
      );
  }


  delete(
    activityDataId: string
  ): Observable<void> {

    return this.repository
      .delete(activityDataId)
      .pipe(
        tap(() => {

          this.recordsSignal.update(
            records =>
              records.filter(
                record =>
                  record.activityData.id !==
                  activityDataId
              )
          );
        })
      );
  }


  private countByScope(
    scope: EmissionScope
  ): number {

    return this.recordsSignal()
      .filter(
        record =>
          record.source.scope === scope
      )
      .length;
  }
}
