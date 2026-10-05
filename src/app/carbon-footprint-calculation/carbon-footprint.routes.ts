import { Routes } from '@angular/router';
import { FootprintStore } from './application/footprint.store';
import { FootprintRepository } from './domain/repository/footprint.repository';
import { HttpFootprintRepository } from './infrastructure/http-footprint.repository';

/**
 * Routes of the Carbon Footprint Calculation bounded context.
 * To use the real API, replace `MockFootprintRepository` with an HTTP implementation of
 * `FootprintRepository`; no other file of the bounded context needs to change.
 */
export const CARBON_FOOTPRINT_ROUTES: Routes = [
  {
    path: '',
    providers: [
      FootprintStore,
      {
        provide: FootprintRepository,
        useClass: HttpFootprintRepository
      },
    ],
    loadComponent: () =>
      import('./presentation/pages/footprint-page/footprint-page').then(
        (component) => component.FootprintPage,
      ),
  },
];
