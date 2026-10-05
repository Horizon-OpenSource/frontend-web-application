import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatChipsModule
} from '@angular/material/chips';

import {
  MatDialog
} from '@angular/material/dialog';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatSnackBar
} from '@angular/material/snack-bar';

import {
  MatTableModule
} from '@angular/material/table';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import {
  OrganizationStore
} from '../../../application/organization.store';

import {
  Site
} from '../../../domain/model/site.entity';

import {
  SiteFormDialog
} from '../../components/site-form-dialog/site-form-dialog';

import {
  DeleteConfirmationDialog
} from '../../components/delete-confirmation-dialog/delete-confirmation-dialog';


@Component({
  selector: 'app-sites',

  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TranslatePipe
  ],

  templateUrl: './sites.html',

  styleUrl: './sites.scss',

  changeDetection:
  ChangeDetectionStrategy.OnPush
})
export class Sites {

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
    'location',
    'assignedUsers',
    'status',
    'actions'
  ];


  constructor() {

    this.store.loadSites();
  }


  protected openAddSiteDialog(): void {

    const dialogRef =
      this.dialog.open(
        SiteFormDialog,
        {
          width: '520px',

          data: {
            organizationId:
              this.store
                .currentOrganizationId()
          }
        }
      );


    dialogRef
      .afterClosed()
      .subscribe(
        (
          site:
            Omit<Site, 'id'>
            | undefined
        ) => {

          if (!site) {
            return;
          }


          this.store
            .createSite(site)
            .subscribe({

              next: () =>
                this.notify(
                  'organization.messages.siteCreated'
                ),

              error: () =>
                this.notify(
                  'organization.messages.siteCreateError'
                )
            });
        }
      );
  }


  protected openEditSiteDialog(
    site: Site
  ): void {

    const dialogRef =
      this.dialog.open(
        SiteFormDialog,
        {
          width: '520px',

          data: {

            organizationId:
              this.store
                .currentOrganizationId(),

            site
          }
        }
      );


    dialogRef
      .afterClosed()
      .subscribe(
        (
          changes:
            Omit<Site, 'id'>
            | undefined
        ) => {

          if (!changes) {
            return;
          }


          this.store
            .updateSite(
              site.id,
              changes
            )
            .subscribe({

              next: () =>
                this.notify(
                  'organization.messages.siteUpdated'
                ),

              error: () =>
                this.notify(
                  'organization.messages.siteUpdateError'
                )
            });
        }
      );
  }


  protected confirmDeleteSite(
    site: Site
  ): void {

    this.dialog.open(
      DeleteConfirmationDialog,
      {
        width: '440px',

        data: {

          titleKey:
            'organization.sites.deleteTitle',

          messageKey:
            'organization.sites.deleteMessage',

          confirmKey:
            'organization.sites.deleteAction',

          name:
          site.name
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
            .deleteSite(site.id)
            .subscribe({

              next: () =>
                this.notify(
                  'organization.messages.siteDeleted'
                ),

              error: () =>
                this.notify(
                  'organization.messages.siteDeleteError'
                )
            });
        }
      );
  }


  private notify(
    key: string
  ): void {

    this.snackBar.open(

      this.translate.instant(
        key
      ),

      this.translate.instant(
        'organization.actions.close'
      ),

      {
        duration: 3000
      }
    );
  }
}
