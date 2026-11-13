import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BACKEND_API_BASE_URL } from '../../shared/infrastructure/api/api.config';
import { AnalyticsApiRepository } from './analytics-api.repository';
import { AnalyticsBackendRepository } from './analytics-backend.repository';

const BASE_URL = `${BACKEND_API_BASE_URL}/analytics`;

describe('AnalyticsBackendRepository', () => {
  let repository: AnalyticsBackendRepository;
  let http: HttpTestingController;
  const mockApi = {
    getOrganizationName: vi.fn(async () => 'Andina Export S.A.C.'),
    getPeriods: vi.fn(async () => []),
    getGoals: vi.fn(async () => []),
  };

  beforeEach(() => {
    localStorage.clear();
    Object.values(mockApi).forEach((method) => method.mockClear());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AnalyticsApiRepository, useValue: mockApi },
      ],
    });
    repository = TestBed.inject(AnalyticsBackendRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('keeps reading the organization, periods and goals from the Mock API', async () => {
    expect(await repository.getOrganizationName()).toBe('Andina Export S.A.C.');
    await repository.getPeriods();
    await repository.getGoals();

    expect(mockApi.getOrganizationName).toHaveBeenCalledTimes(1);
    expect(mockApi.getPeriods).toHaveBeenCalledTimes(1);
    expect(mockApi.getGoals).toHaveBeenCalledTimes(1);
  });

  it('reads the summaries of the current organization from the Spring Boot API', async () => {
    localStorage.setItem('ecotrack.currentOrganizationId', '5');

    const pending = repository.getSummaries();
    const request = http.expectOne((req) => req.url === `${BASE_URL}/summary`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('organizationId')).toBe('5');
    request.flush([
      {
        period: '2026-01',
        hasData: true,
        total: 14.5,
        scopes: [
          { scope: 'SCOPE_1', tonnes: 2.5 },
          { scope: 'SCOPE_2', tonnes: 12 },
          { scope: 'SCOPE_3', tonnes: null },
        ],
      },
    ]);
    const summaries = await pending;

    expect(summaries).toHaveLength(1);
    expect(summaries[0].periodId).toBe('2026-01');
    expect(summaries[0].tonnesFor('scope1')).toBe(2.5);
    expect(summaries[0].tonnesFor('scope3')).toBeNull();
    expect(summaries[0].totalTonnesCo2e).toBe(14.5);
  });

  it('uses organization 1 when no organization is stored', async () => {
    const pending = repository.getReports();

    const request = http.expectOne((req) => req.url === `${BASE_URL}/reports`);
    expect(request.request.params.get('organizationId')).toBe('1');
    request.flush([]);

    expect(await pending).toEqual([]);
  });

  it('maps the reports of the API to the reports of the application', async () => {
    const pending = repository.getReports();
    http.expectOne((req) => req.url === `${BASE_URL}/reports`).flush([
      {
        id: 7,
        organizationId: 1,
        type: 'PERIOD',
        period: '2026-02',
        totalTonnes: 16.6,
        status: 'DOWNLOADED',
        generatedAt: '2026-11-13T01:26:31',
      },
      {
        id: 8,
        organizationId: 1,
        type: 'CONSOLIDATED',
        period: null,
        totalTonnes: 31.1,
        status: 'GENERATED',
        generatedAt: '2026-11-13T01:30:00',
      },
    ]);
    const [period, consolidated] = await pending;

    expect(period.id).toBe('7');
    expect(period.type).toBe('period');
    expect(period.periodId).toBe('2026-02');
    expect(period.title).toBe('ecotrack-2026-02-period-report');
    expect(period.isDownloadable).toBe(true);
    expect(consolidated.type).toBe('consolidated');
    expect(consolidated.periodId).toBe('ALL');
    expect(consolidated.title).toBe('ecotrack-all-periods-consolidated-report');
    expect(consolidated.totalTonnesCo2e).toBe(31.1);
  });

  it('creates a period report through the API', async () => {
    const pending = repository.createReport('period', '2026-02');

    const request = http.expectOne(`${BASE_URL}/reports/period`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ organizationId: 1, period: '2026-02' });
    request.flush({
      id: 9,
      organizationId: 1,
      type: 'PERIOD',
      period: '2026-02',
      totalTonnes: 16.6,
      status: 'GENERATED',
      generatedAt: '2026-11-13T02:00:00',
    });

    expect((await pending).id).toBe('9');
  });

  it('creates a consolidated report through the API', async () => {
    const pending = repository.createReport('consolidated', 'ALL');

    const request = http.expectOne(`${BASE_URL}/reports/consolidated`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ organizationId: 1 });
    request.flush({
      id: 10,
      organizationId: 1,
      type: 'CONSOLIDATED',
      period: null,
      totalTonnes: 31.1,
      status: 'GENERATED',
      generatedAt: '2026-11-13T02:05:00',
    });

    const report = await pending;
    expect(report.type).toBe('consolidated');
    expect(report.periodId).toBe('ALL');
  });
});
