import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'carbon-footprint',
    loadChildren: () =>
      import('./carbon-footprint-calculation/carbon-footprint.routes').then(
        (module) => module.CARBON_FOOTPRINT_ROUTES,
      ),
  },
];
