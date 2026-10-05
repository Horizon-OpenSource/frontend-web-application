import { Routes } from '@angular/router';

import { OrganizationShell } from './organization-management/presentation/pages/organization-shell/organization-shell';
import { OrganizationOverview } from './organization-management/presentation/pages/organization-overview/organization-overview';
import { OrganizationEdit } from './organization-management/presentation/pages/organization-edit/organization-edit';
import { Sites } from './organization-management/presentation/pages/sites/sites';
import { BusinessUnits } from './organization-management/presentation/pages/business-units/business-units';
import { OrganizationRegister } from './organization-management/presentation/pages/organization-register/organization-register';

export const routes: Routes = [
  {
    path: 'register-organization',
    component: OrganizationRegister
  },

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
      },
      {
        path: 'business-units',
        component: BusinessUnits
      }
    ]
  },

  {
    path: 'emissions',
    loadComponent: () =>
      import(
        './emissions-management/presentation/pages/emissions-page/emissions-page'
        ).then(
        component => component.EmissionsPage
      )
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'organization'
  },

  {
    path: '**',
    redirectTo: 'organization'
  }
];
