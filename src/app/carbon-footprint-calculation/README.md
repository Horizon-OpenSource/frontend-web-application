# Carbon Footprint Calculation bounded context

This Angular bounded context implements EP-04 for EcoTrack:

- US-34 calculates the carbon footprint of a reporting period and shows the result in kgCO₂e. When information is missing, the calculation is not completed and the pending items are listed.
- US-35 shows the results of a period split by Scope 1, Scope 2 and Scope 3.
- US-36 shows the results of the selected reporting period.
- US-37 lists the periods that were calculated before.
- US-46 selects the emission factor of each activity data record, offering only compatible factors.

## Architecture

- `domain`: activity data, emission factor and calculation models, the calculation and summary rules, and the `FootprintRepository` port.
- `application`: signal-based `FootprintStore` with the feature use cases.
- `infrastructure`: `HttpFootprintRepository`, the implementation of the port that consumes the Mock API (`API_BASE_URL`).
- `presentation`: routed page and its components (activity data and factors, results by scope, history).

The bounded context does not depend on any other one. It keeps its own read model of the activity data, which in the integrated product is provided by Emissions Management.

## Demo data

Data comes from the Mock API: emission sources, activity data, emission factors, factor assignments and footprint calculations. Unit tests use `testing/in-memory-footprint.repository.ts`, an in-memory implementation of the same port, so they do not need the API.

| Period | Situation | Stories |
|---|---|---|
| 2026-06 | Already calculated, with no Scope 3 data | US-35, US-36, US-37 |
| 2026-08 | Ready to calculate, covers the three scopes | US-34, US-35 |
| 2026-09 | One record has no emission factor, so the calculation cannot be completed. Select the factor and calculate again | US-34, US-46 |

Emission factor values are illustrative and are not official factors.

## Assumptions to confirm

- A factor is compatible with an activity data record when both have the same scope and unit.
- The calculation is all-or-nothing: if any record is pending, nothing is calculated and every pending item is reported.
- The result unit is kgCO₂e.
- The organization and the user are not modeled yet (IAM is outside this delivery).

## Replacing the mock

`carbon-footprint.routes.ts` provides `FootprintRepository` with `HttpFootprintRepository`. When the Spring Boot API is available, only the base URL or the implementation of that port changes; the domain, the store and the presentation layer do not.

## Verification

```bash
npm run build
npm test -- --watch=false
```
