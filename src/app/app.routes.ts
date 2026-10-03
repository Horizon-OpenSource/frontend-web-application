import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'emissions',
    loadComponent: () => import('./emissions-management/presentation/pages/emissions-page/emissions-page')
      .then(component => component.EmissionsPage)
  },
  { path: '', pathMatch: 'full', redirectTo: 'emissions' },
  { path: '**', redirectTo: 'emissions' }
];
