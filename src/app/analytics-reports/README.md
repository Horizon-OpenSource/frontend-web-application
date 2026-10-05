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

- `domain`: emission summary, period comparison, goal snapshot and report models.
- `application`: signal-based store with dashboard, comparison and report use cases.
- `infrastructure`: mock repository with demonstration data and a CSV file exporter.
- `presentation`: dashboard page and its components.

## Demo data

`MockAnalyticsRepository` uses the demo organization Andina Export S.A.C. with four quarterly periods:

- Q4 2025 has no Scope 3 calculation (partial data scenario).
- Q1 2026 and Q2 2026 are complete; Q2 2026 is +5.5 % against Q1 2026.
- Q3 2026 has no calculations (empty state and insufficient data scenarios).

Generated reports are stored in browser `localStorage`. The demo includes one unavailable report to show the failed download scenario.

The bounded context does not depend on other bounded contexts. When the Spring Boot API is available, the mock repository can be replaced with an HTTP repository without changing the domain or presentation layers.
