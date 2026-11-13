# Emissions Management bounded context

This Angular bounded context implements EP-03 for EcoTrack:

- US-11 registers an emission source scoped to a facility.
- US-12 classifies the source as Scope 1, 2 or 3.
- US-13 lists the organization's emission activity records.
- US-14 edits an existing record with validation.
- US-15 deletes a record after explicit confirmation.
- US-18 searches records by source and associated information.
- US-19 filters records by scope.
- US-45 registers quantity, unit and period as activity data.

## Architecture

- `domain`: emission source, activity data, scope and shared validation rules.
- `application`: signal-based store, search normalization and feature use cases.
- `infrastructure`: repository boundary and demonstration data.
- `presentation`: routed page, validated CRUD forms and confirmation dialogs.

## Using the feature

Create a record by selecting its facility and scope and providing the source and activity details. Editing applies the same validation and retains the record's existing origin. Deletion requires confirmation. The form keeps its values and displays an error if saving fails.

Search is case- and accent-insensitive and matches source and associated record fields. The search and available filters can be combined; filters are cleared if their selected options disappear. Registration checks required fields, valid periods, positive finite quantities and consistency between facility and source. The stored values represent activity data, not calculated emissions in CO2 equivalent.

## Integration and limitations

The application uses `EmissionsApiRepository` to connect to the shared EcoTrack mock API at `http://localhost:3000/api/v1`, including its sites, emission-sources and activity-data endpoints. Start the `ecotrack-platform-mock` service before using the screen. The repository is a mock service, not the Spring Boot backend; integration with the production backend and its access controls still requires verification. Existing localStorage demo data is not migrated or deleted by this feature.

Search, scope/period/source filters, form validation, CRUD confirmation and error feedback remain available. A failed save keeps the form open. Activity quantities are not calculated CO₂-equivalent emissions. CSV and API origins are labels on records, not import or integration functions. The local `MockEmissionsRepository` is retained for isolated unit tests, not used by the screen.

## Verification

From the project root:

```bash
npm run build
npm test -- --watch=false
```
