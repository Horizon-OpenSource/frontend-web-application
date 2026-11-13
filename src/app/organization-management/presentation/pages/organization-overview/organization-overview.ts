import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslatePipe } from '@ngx-translate/core';

import { OrganizationStore } from '../../../application/organization.store';

@Component({
  selector: 'app-organization-overview',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './organization-overview.html',
  styleUrl: './organization-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationOverview {

  protected readonly store = inject(OrganizationStore);

  constructor() {
    this.store.loadOverview();
  }
}
