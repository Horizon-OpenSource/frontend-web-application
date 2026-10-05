import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsStore } from '../../../application/analytics.store';

/** Compares the footprint of two periods (US-20). */
@Component({
  selector: 'app-period-comparison-card',
  imports: [DecimalPipe, MatFormField, MatLabel, MatSelect, MatOption, MatIcon, TranslatePipe],
  template: `
    <section class="card" aria-labelledby="comparison-title">
      <h2 id="comparison-title">{{ 'analytics.comparison.title' | translate }}</h2>

      <div class="selectors">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'analytics.comparison.base' | translate }}</mat-label>
          <mat-select
            [value]="store.comparisonBaseId()"
            (selectionChange)="store.setComparisonBase($event.value)"
          >
            @for (period of store.periods(); track period.id) {
              <mat-option [value]="period.id">{{ period.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ 'analytics.comparison.target' | translate }}</mat-label>
          <mat-select
            [value]="store.comparisonTargetId()"
            (selectionChange)="store.setComparisonTarget($event.value)"
          >
            @for (period of store.periods(); track period.id) {
              <mat-option [value]="period.id">{{ period.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div aria-live="polite">
        @if (store.comparison(); as result) {
          <dl class="values">
            <div>
              <dt>{{ store.periodLabel(result.base.periodId) }}</dt>
              <dd>
                {{ result.base.totalTonnesCo2e | number: '1.0-0' }}
                {{ 'analytics.units.tonnes' | translate }}
              </dd>
            </div>
            <div>
              <dt>{{ store.periodLabel(result.target.periodId) }}</dt>
              <dd>
                {{ result.target.totalTonnesCo2e | number: '1.0-0' }}
                {{ 'analytics.units.tonnes' | translate }}
              </dd>
            </div>
            <div
              class="delta"
              [class.increase]="result.deltaPercent > 0"
              [class.decrease]="result.deltaPercent < 0"
            >
              <dt>{{ 'analytics.comparison.variation' | translate }}</dt>
              <dd>
                {{ result.deltaPercent > 0 ? '+' : ''
                }}{{ result.deltaPercent | number: '1.1-1' }} %
                <span class="delta-tonnes">
                  ({{ result.deltaTonnesCo2e > 0 ? '+' : ''
                  }}{{ result.deltaTonnesCo2e | number: '1.0-0' }}
                  {{ 'analytics.units.tonnes' | translate }})
                </span>
              </dd>
            </div>
          </dl>
        } @else {
          <p class="notice" role="status">
            <mat-icon aria-hidden="true">error_outline</mat-icon>
            <span>{{ 'analytics.comparison.insufficientData' | translate }}</span>
          </p>
        }
      </div>
    </section>
  `,
  styles: `
    .selectors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
    }
    .values {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 0;
    }
    .values div {
      padding: 12px;
      border: 1px solid #e2e8ea;
      border-radius: 8px;
    }
    dt {
      color: #455a64;
      font-size: 0.875rem;
    }
    dd {
      margin: 4px 0 0;
      color: #263238;
      font-size: 1.125rem;
      font-weight: 500;
    }
    .delta-tonnes {
      display: block;
      font-size: 0.8125rem;
      font-weight: 400;
    }
    .increase dd {
      color: #c62828;
    }
    .decrease dd {
      color: #2e7d32;
    }
    .notice {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0;
      padding: 12px;
      border-radius: 8px;
      background: #ffebee;
      color: #b71c1c;
    }
    @media (max-width: 600px) {
      .selectors,
      .values {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PeriodComparisonCard {
  protected readonly store = inject(AnalyticsStore);
}
