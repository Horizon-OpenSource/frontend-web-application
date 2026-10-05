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

import { Site } from '../../../domain/model/site.entity';

import {
  SiteFormDialog
} from '../../components/site-form-dialog/site-form-dialog';

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
    'status'
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
              this.store.currentOrganizationId()
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

              next: () => {

                this.snackBar.open(
                  this.translate.instant(
                    'organization.messages.siteCreated'
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
                    'organization.messages.siteCreateError'
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
