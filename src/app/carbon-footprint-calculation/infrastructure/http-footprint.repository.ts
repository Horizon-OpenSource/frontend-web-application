import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  firstValueFrom
} from 'rxjs';

import {
  API_BASE_URL
} from '../../shared/infrastructure/api/api.config';

import {
  ActivityDataItem
} from '../domain/model/activity-data-item.model';

import {
  EmissionFactor
} from '../domain/model/emission-factor.entity';

import {
  FootprintCalculation
} from '../domain/model/footprint-calculation.entity';

import {
  FootprintScope
} from '../domain/model/footprint-scope';

import {
  FootprintRepository
} from '../domain/repository/footprint.repository';


interface EmissionSourceDto {
  id: string;
  organizationId: number;
  facilityId: string;
  facilityName: string;
  name: string;
  scope: FootprintScope;
}


interface ActivityDataDto {
  id: string;
  organizationId: number;
  emissionSourceId: string;
  period: string;
  quantity: number;
  unit: string;
}


interface EmissionFactorDto {
  id: string;
  name: string;
  scope: FootprintScope;
  unit: string;
  value: number;
  source: string;
}


interface FactorAssignmentDto {
  id: string;
  organizationId: number;
  activityDataId: string;
  emissionFactorId: string;
}


interface FootprintCalculationDto {
  id: string;
  organizationId: number;
  activityDataId: string;
  emissionFactorId: string;
  sourceName: string;
  factorName: string;
  scope: FootprintScope;
  period: string;
  quantity: number;
  unit: string;
  factorValue: number;
  resultValue: number;
  calculatedAt: string;
}


@Injectable()
export class HttpFootprintRepository
  extends FootprintRepository {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    API_BASE_URL;


  async getActivityData():
    Promise<ActivityDataItem[]> {

    const organizationId =
      this.getCurrentOrganizationId();


    const [sources, activities] =
      await Promise.all([

        firstValueFrom(
          this.http.get<EmissionSourceDto[]>(
            `${this.baseUrl}/emission-sources`,
            {
              params: {
                organizationId
              }
            }
          )
        ),

        firstValueFrom(
          this.http.get<ActivityDataDto[]>(
            `${this.baseUrl}/activity-data`,
            {
              params: {
                organizationId
              }
            }
          )
        )

      ]);


    const sourceById =
      new Map(
        sources.map(
          source => [
            source.id,
            source
          ]
        )
      );


    return activities
      .map(activity => {

        const source =
          sourceById.get(
            activity.emissionSourceId
          );

        if (!source) {
          return null;
        }

        return {
          id:
          activity.id,

          emissionSourceId:
          activity.emissionSourceId,

          sourceName:
          source.name,

          facilityName:
          source.facilityName,

          scope:
          source.scope,

          period:
          activity.period,

          quantity:
          activity.quantity,

          unit:
          activity.unit
        };
      })
      .filter(
        (
          activity
        ): activity is ActivityDataItem =>
          activity !== null
      );
  }


  async getEmissionFactors():
    Promise<EmissionFactor[]> {

    const factors =
      await firstValueFrom(
        this.http.get<EmissionFactorDto[]>(
          `${this.baseUrl}/emission-factors`
        )
      );


    return factors.map(
      factor =>
        new EmissionFactor({
          id:
          factor.id,

          name:
          factor.name,

          scope:
          factor.scope,

          unit:
          factor.unit,

          value:
          factor.value,

          source:
          factor.source
        })
    );
  }


  async getAssignments():
    Promise<Record<string, string>> {

    const organizationId =
      this.getCurrentOrganizationId();


    const assignments =
      await firstValueFrom(
        this.http.get<FactorAssignmentDto[]>(
          `${this.baseUrl}/factor-assignments`,
          {
            params: {
              organizationId
            }
          }
        )
      );


    return Object.fromEntries(
      assignments.map(
        assignment => [
          assignment.activityDataId,
          assignment.emissionFactorId
        ]
      )
    );
  }


  async saveAssignment(
    activityDataId: string,
    emissionFactorId: string | null
  ): Promise<void> {

    const organizationId =
      this.getCurrentOrganizationId();


    const existing =
      await firstValueFrom(
        this.http.get<FactorAssignmentDto[]>(
          `${this.baseUrl}/factor-assignments`,
          {
            params: {
              organizationId,
              activityDataId
            }
          }
        )
      );


    const assignment =
      existing[0];


    if (!emissionFactorId) {

      if (assignment) {

        await firstValueFrom(
          this.http.delete(
            `${this.baseUrl}/factor-assignments/${assignment.id}`
          )
        );
      }

      return;
    }


    if (assignment) {

      await firstValueFrom(
        this.http.patch(
          `${this.baseUrl}/factor-assignments/${assignment.id}`,
          {
            emissionFactorId
          }
        )
      );

      return;
    }


    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/factor-assignments`,
        {
          id:
            crypto.randomUUID(),

          organizationId,

          activityDataId,

          emissionFactorId
        }
      )
    );
  }


  async getCalculations():
    Promise<FootprintCalculation[]> {

    const organizationId =
      this.getCurrentOrganizationId();


    const calculations =
      await firstValueFrom(
        this.http.get<FootprintCalculationDto[]>(
          `${this.baseUrl}/footprint-calculations`,
          {
            params: {
              organizationId
            }
          }
        )
      );


    return calculations.map(
      calculation =>
        new FootprintCalculation({
          id:
          calculation.id,

          activityDataId:
          calculation.activityDataId,

          emissionFactorId:
          calculation.emissionFactorId,

          sourceName:
          calculation.sourceName,

          factorName:
          calculation.factorName,

          scope:
          calculation.scope,

          period:
          calculation.period,

          quantity:
          calculation.quantity,

          unit:
          calculation.unit,

          factorValue:
          calculation.factorValue,

          resultValue:
          calculation.resultValue,

          calculatedAt:
          calculation.calculatedAt
        })
    );
  }


  async replaceCalculations(
    period: string,
    calculations:
    readonly FootprintCalculation[]
  ): Promise<void> {

    const organizationId =
      this.getCurrentOrganizationId();


    const existing =
      await firstValueFrom(
        this.http.get<FootprintCalculationDto[]>(
          `${this.baseUrl}/footprint-calculations`,
          {
            params: {
              organizationId,
              period
            }
          }
        )
      );


    await Promise.all(
      existing.map(
        calculation =>
          firstValueFrom(
            this.http.delete(
              `${this.baseUrl}/footprint-calculations/${calculation.id}`
            )
          )
      )
    );


    await Promise.all(
      calculations.map(
        calculation =>
          firstValueFrom(
            this.http.post(
              `${this.baseUrl}/footprint-calculations`,
              {
                id:
                calculation.id,

                organizationId,

                activityDataId:
                calculation.activityDataId,

                emissionFactorId:
                calculation.emissionFactorId,

                sourceName:
                calculation.sourceName,

                factorName:
                calculation.factorName,

                scope:
                calculation.scope,

                period:
                calculation.period,

                quantity:
                calculation.quantity,

                unit:
                calculation.unit,

                factorValue:
                calculation.factorValue,

                resultValue:
                calculation.resultValue,

                calculatedAt:
                calculation.calculatedAt
              }
            )
          )
      )
    );
  }


  async clearCalculations():
    Promise<void> {

    const organizationId =
      this.getCurrentOrganizationId();


    const calculations =
      await firstValueFrom(
        this.http.get<FootprintCalculationDto[]>(
          `${this.baseUrl}/footprint-calculations`,
          {
            params: {
              organizationId
            }
          }
        )
      );


    await Promise.all(
      calculations.map(
        calculation =>
          firstValueFrom(
            this.http.delete(
              `${this.baseUrl}/footprint-calculations/${calculation.id}`
            )
          )
      )
    );
  }


  async reset(): Promise<void> {
    return Promise.resolve();
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
