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

import {
  DeleteConfirmationDialog
} from '../../components/delete-confirmation-dialog/delete-confirmation-dialog';

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
    'status',
    'actions'
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

  protected openEditBusinessUnitDialog(
    businessUnit: BusinessUnit
  ): void {

    this.dialog.open(
      BusinessUnitFormDialog,
      {
        width: '560px',

        data: {

          organizationId:
            this.store
              .currentOrganizationId(),

          sites:
            this.store.sites(),

          businessUnit
        }
      }
    )
      .afterClosed()
      .subscribe(
        (
          changes:
            Omit<BusinessUnit, 'id'>
            | undefined
        ) => {

          if (!changes) {
            return;
          }


          this.store
            .updateBusinessUnit(
              businessUnit.id,
              changes
            )
            .subscribe({

              next: () => {

                this.snackBar.open(
                  this.translate.instant(
                    'organization.messages.businessUnitUpdated'
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
                    'organization.messages.businessUnitUpdateError'
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


  protected confirmDeleteBusinessUnit(
    businessUnit: BusinessUnit
  ): void {

    this.dialog.open(
      DeleteConfirmationDialog,
      {
        width: '440px',

        data: {

          titleKey:
            'organization.businessUnits.deleteTitle',

          messageKey:
            'organization.businessUnits.deleteMessage',

          confirmKey:
            'organization.businessUnits.deleteAction',

          name:
          businessUnit.name
        }
      }
    )
      .afterClosed()
      .subscribe(
        (
          confirmed?: boolean
        ) => {

          if (!confirmed) {
            return;
          }


          this.store
            .deleteBusinessUnit(
              businessUnit.id
            )
            .subscribe({

              next: () => {

                this.snackBar.open(
                  this.translate.instant(
                    'organization.messages.businessUnitDeleted'
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
                    'organization.messages.businessUnitDeleteError'
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
