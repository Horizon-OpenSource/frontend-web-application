import { Routes } from '@angular/router';

import { OrganizationShell } from './organization-management/presentation/pages/organization-shell/organization-shell';
import { OrganizationOverview } from './organization-management/presentation/pages/organization-overview/organization-overview';
import { OrganizationEdit } from './organization-management/presentation/pages/organization-edit/organization-edit';
import { Sites } from './organization-management/presentation/pages/sites/sites';

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
      },
      {
        path: 'sites',
        component: Sites
      }
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'organization'
  }
];
