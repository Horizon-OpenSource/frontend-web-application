import { Routes } from '@angular/router';
import { FootprintStore } from './application/footprint.store';
import { FootprintRepository } from './domain/repository/footprint.repository';
import { MockFootprintRepository } from './infrastructure/mock-footprint.repository';

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
      { provide: FootprintRepository, useClass: MockFootprintRepository },
    ],
    loadComponent: () =>
      import('./presentation/pages/footprint-page/footprint-page').then(
        (component) => component.FootprintPage,
      ),
  },
];
