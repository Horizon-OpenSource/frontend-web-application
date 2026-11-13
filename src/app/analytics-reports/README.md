# Analytics and Reports bounded context

This Angular bounded context implements EP-06 for EcoTrack:

- US-16 shows the organization's total calculated emissions in t CO₂e for a period.
- US-17 shows calculated emissions by Scope 1, 2 and 3.
- US-20 compares the footprint of two periods and their variation.
- US-26 summarizes total, distribution by scope and environmental goals.
- US-27 generates a consolidated environmental report.
- US-28 downloads a generated report as CSV.
- US-29 generates a report for a specific period.
- US-30 lists previously generated reports with a period filter.

## Architecture

- `domain`: emission summary, period comparison, goal snapshot and report models, and the `AnalyticsRepository` port.
- `application`: signal-based store with dashboard, comparison and report use cases.
- `infrastructure`: HTTP repositories and a CSV file exporter.
- `presentation`: dashboard and reports pages and their components.
- `testing`: in-memory repository used by the specs.

## Data sources

`AnalyticsBackendRepository` is the repository registered in `app.config.ts`. It mixes two sources:

| Data | Source | Endpoint |
|---|---|---|
| Emission summaries by period and scope (US-16, US-17, US-20, US-26) | Spring Boot API (`http://localhost:8080/api/v1`) | `GET /analytics/summary` |
| Report history (US-30) | Spring Boot API | `GET /analytics/reports` |
| Report generation (US-27, US-29) | Spring Boot API | `POST /analytics/reports/consolidated`, `POST /analytics/reports/period` |
| Organization name, reporting periods and environmental goals | Mock API (`http://localhost:3000/api/v1`) | `GET /organizations/{id}`, `GET /activity-data`, `GET /environmental-goals` |

The CSV file of US-28 is still built in the browser by `AnalyticsStore`. The backend already exposes `GET /analytics/reports/{id}/download` for when the download is moved to the API.

To use only the Mock API, register `AnalyticsApiRepository` instead of `AnalyticsBackendRepository` in `app.config.ts`; no other file needs to change. `MockAnalyticsRepository` is an older in-memory demo that no component uses.

## Running it

1. Start the Mock API (`ecotrack-platform-mock`, port 3000).
2. Start the backend (`backend-web-services`, port 8080).
3. Run `npm start` (port 4200).

The backend allows requests from `http://localhost:4200`. The demo organization is Andina Export S.A.C. (id 1); the period selector comes from its activity data in the Mock API:

- 2026-01 has no Scope 3 result (partial data scenario).
- 2026-02 is complete and about +12 % against 2026-01.
- 2026-03 has no results in the backend (empty state and insufficient data scenarios).

## Tests

Run the specs of this bounded context with:

```bash
npx ng test --watch=false --include "src/app/analytics-reports/**/*.spec.ts"
```

The specs cover the domain models, the store use cases and the mapping of the `AnalyticsBackendRepository` with `HttpTestingController`.
