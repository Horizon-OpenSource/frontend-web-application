import { Routes } from '@angular/router';

import { OrganizationShell } from './organization-management/presentation/pages/organization-shell/organization-shell';
import { OrganizationOverview } from './organization-management/presentation/pages/organization-overview/organization-overview';
import { OrganizationEdit } from './organization-management/presentation/pages/organization-edit/organization-edit';

export const routes: Routes = [
  {
    path: 'organization',
    component: OrganizationShell,
    children: [
      {
        path: '',
        component: OrganizationOverview
      },
      {
        path: 'edit',
        component: OrganizationEdit
      }
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'organization'
  }
];
