import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTabsModule,
    TranslatePipe
  ],
  templateUrl: './organization-shell.html',
  styleUrl: './organization-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationShell {}
