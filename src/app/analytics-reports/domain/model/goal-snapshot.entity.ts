/**
 * Read-only view of an environmental goal shown in the summary (US-26).
 * Analytics and Reports only reads goals; they are managed by Goals and Reduction Plans.
 */
export type GoalStatus = 'active' | 'achieved' | 'atRisk';

export class GoalSnapshot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly targetReductionPercent: number,
    public readonly progressPercent: number,
    public readonly targetDate: string,
    public readonly status: GoalStatus
  ) {}
}
