import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./analytics-reports/presentation/pages/dashboard-page/dashboard-page').then(
        (component) => component.DashboardPage,
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./analytics-reports/presentation/pages/reports-page/reports-page').then(
        (component) => component.ReportsPage,
      ),
  },
];
