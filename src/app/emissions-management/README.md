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

- `domain`: emission source, activity data and scope models.
- `application`: signal-based store and feature use cases.
- `infrastructure`: repository boundary and demonstration data.
- `presentation`: routed page and CRUD dialogs.

## Demo data

`MockEmissionsRepository` includes six records distributed across Scope 1, Scope 2 and Scope 3. Data is copied to browser `localStorage` so create, update and delete operations remain available after a refresh. Use **Reset demo data** on the page before a presentation to restore the original scenario.

The mock repository is intentionally isolated behind the application store. When the Spring Boot API is available, it can be replaced with an HTTP repository without changing the domain or presentation layers.

## Verification

```bash
npm run build
npm test -- --watch=false
```
