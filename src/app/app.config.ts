import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AnalyticsRepository } from './analytics-reports/domain/repository/analytics.repository';
import { AnalyticsBackendRepository } from './analytics-reports/infrastructure/analytics-backend.repository';
import { OrganizationRepository } from './organization-management/domain/repository/organization.repository';
import { OrganizationApi } from './organization-management/infrastructure/organization-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: AnalyticsRepository, useClass: AnalyticsBackendRepository },
    {
      provide: OrganizationRepository,
      useClass: OrganizationApi
    },
    provideRouter(routes),
    provideHttpClient(withXhr()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    })
  ]
};
