/**
 * A reporting period (e.g. Q2 2026) used to filter analytics and reports.
 */
export class ReportingPeriod {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly startDate: string,
    public readonly endDate: string
  ) {}
}
