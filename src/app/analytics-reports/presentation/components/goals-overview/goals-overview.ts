import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { GoalSnapshot } from '../../../domain/model/goal-snapshot.entity';

/** Environmental goals included in the summary (US-26). Read-only in this BC. */
@Component({
  selector: 'app-goals-overview',
  imports: [DatePipe, MatProgressBar, TranslatePipe],
  template: `
    <section class="card" aria-labelledby="goals-title">
      <h2 id="goals-title">{{ 'analytics.goals.title' | translate }}</h2>

      @if (goals().length) {
        <ul class="goal-list">
          @for (goal of goals(); track goal.id) {
            <li class="goal">
              <div class="goal-head">
                <span class="goal-name">{{ goal.name }}</span>
                <span class="status" [class]="goal.status">
                  {{ 'analytics.goals.status.' + goal.status | translate }}
                </span>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="goal.progressPercent"
                [attr.aria-label]="
                  'analytics.goals.progressLabel'
                    | translate: { name: goal.name, value: goal.progressPercent }
                "
              />
              <span class="goal-meta">
                {{
                  'analytics.goals.meta'
                    | translate
                      : {
                          progress: goal.progressPercent,
                          date: (goal.targetDate | date: 'dd/MM/yyyy' : 'UTC'),
                        }
                }}
              </span>
            </li>
          }
        </ul>
      } @else {
        <p class="empty">{{ 'analytics.goals.empty' | translate }}</p>
      }
    </section>
  `,
  styles: `
    .goal-list {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      display: grid;
      gap: 20px;
    }
    .goal {
      display: grid;
      gap: 8px;
    }
    .goal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .goal-name {
      color: #263238;
      font-weight: 500;
    }
    .goal-meta,
    .empty {
      color: #455a64;
      font-size: 0.875rem;
    }
    .status {
      flex-shrink: 0;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .active {
      background: #e8f5e9;
      color: #1b5e20;
    }
    .achieved {
      background: #c8e6c9;
      color: #1b5e20;
    }
    .atRisk {
      background: #fff3e0;
      color: #8a4b00;
    }
    mat-progress-bar {
      --mat-progress-bar-active-indicator-color: #388e3c;
      --mat-progress-bar-track-color: #e8f5e9;
    }
  `,
})
export class GoalsOverview {
  readonly goals = input.required<readonly GoalSnapshot[]>();
}
