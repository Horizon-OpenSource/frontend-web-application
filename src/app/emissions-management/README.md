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

## Demo data and limitations

`MockEmissionsRepository` seeds six records across Scope 1, Scope 2 and Scope 3 and persists changes in browser `localStorage`. Records are local to that browser and site; they are not shared with other users or synchronized with a backend. Open tabs on the same site refresh when the stored data changes. CSV and API origins are labels on existing records, not import or integration functionality.

Unreadable or invalid stored data is not silently overwritten. Storage failures are reported in the interface. **Reset demo data** requires confirmation and replaces all locally saved records with the original demo records, so use it only when those changes can be discarded.

The mock repository is isolated behind the application store. A future backend integration requires an HTTP repository and appropriate server-side validation and access controls.

## Verification

From the project root:

```bash
npm run build
npm test -- --watch=false
```
