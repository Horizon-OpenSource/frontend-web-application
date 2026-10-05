import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import { OrganizationStore } from '../../../application/organization.store';

import { BusinessUnit } from '../../../domain/model/business-unit.entity';

import {
  BusinessUnitFormDialog
} from '../../components/business-unit-form-dialog/business-unit-form-dialog';

@Component({
  selector: 'app-business-units',

  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TranslatePipe
  ],

  templateUrl: './business-units.html',
  styleUrl: './business-units.scss',

  changeDetection:
  ChangeDetectionStrategy.OnPush
})
export class BusinessUnits {

  private readonly dialog =
    inject(MatDialog);

  private readonly snackBar =
    inject(MatSnackBar);

  private readonly translate =
    inject(TranslateService);

  protected readonly store =
    inject(OrganizationStore);

  protected readonly displayedColumns = [
    'name',
    'site',
    'responsible',
    'emissions',
    'status'
  ];

  constructor() {

    if (
      this.store.sites().length === 0
    ) {
      this.store.loadSites();
    }

    this.store.loadBusinessUnits();
  }

  protected getSiteName(
    siteId: number
  ): string {

    return this.store
      .sites()
      .find(
        site =>
          site.id === siteId
      )?.name ?? '-';
  }

  protected openAddBusinessUnitDialog(): void {

    const dialogRef =
      this.dialog.open(
        BusinessUnitFormDialog,
        {
          width: '560px',

          data: {
            organizationId:
              this.store.currentOrganizationId(),

            sites:
              this.store.sites()
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        (
          businessUnit:
            Omit<BusinessUnit, 'id'>
            | undefined
        ) => {

          if (!businessUnit) {
            return;
          }

          this.store
            .createBusinessUnit(
              businessUnit
            )
            .subscribe({

              next: () => {

                this.snackBar.open(
                  this.translate.instant(
                    'organization.messages.businessUnitCreated'
                  ),

                  this.translate.instant(
                    'organization.actions.close'
                  ),

                  {
                    duration: 3000
                  }
                );
              },

              error: () => {

                this.snackBar.open(
                  this.translate.instant(
                    'organization.messages.businessUnitCreateError'
                  ),

                  this.translate.instant(
                    'organization.actions.close'
                  ),

                  {
                    duration: 3000
                  }
                );
              }
            });
        }
      );
  }
}
