import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'organization',
    loadComponent: () =>
      import(
        './organization-management/presentation/pages/organization-shell/organization-shell'
        ).then(m => m.OrganizationShell),

    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './organization-management/presentation/pages/organization-overview/organization-overview'
            ).then(m => m.OrganizationOverview)
      }
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'organization'
  }
];
