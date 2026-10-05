import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EMISSION_SCOPES } from '../../../domain/model/emission-scope';
import { EmissionSummary } from '../../../domain/model/emission-summary.entity';

/** Distribution of emissions by Scope 1, 2 and 3 (US-17). */
@Component({
  selector: 'app-scope-distribution',
  imports: [DecimalPipe, TranslatePipe],
  template: `
    <section class="card" aria-labelledby="distribution-title">
      <h2 id="distribution-title">{{ 'analytics.distribution.title' | translate }}</h2>

      <div class="bar" aria-hidden="true">
        @for (scope of scopes; track scope) {
          @let share = summary().sharePercentFor(scope);
          @if (share !== null && share > 0) {
            <span class="segment" [class]="scope" [style.width.%]="share"></span>
          }
        }
      </div>

      <ul class="legend">
        @for (scope of scopes; track scope) {
          @let tonnes = summary().tonnesFor(scope);
          <li>
            <span class="swatch" [class]="scope" aria-hidden="true"></span>
            <span class="legend-name">{{ 'analytics.scopes.' + scope | translate }}</span>
            @if (tonnes !== null) {
              <span class="legend-value">
                {{ tonnes | number: '1.0-0' }} {{ 'analytics.units.tonnes' | translate }}
              </span>
              <span class="legend-share"
                >{{ summary().sharePercentFor(scope) | number: '1.1-1' }} %</span
              >
            } @else {
              <span class="legend-value muted">{{
                'analytics.distribution.noData' | translate
              }}</span>
            }
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .bar {
      display: flex;
      height: 20px;
      border-radius: 8px;
      overflow: hidden;
      background: #e2e8ea;
      margin: 16px 0 20px;
    }
    .segment {
      height: 100%;
    }
    .legend {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 12px;
    }
    .legend li {
      display: grid;
      grid-template-columns: 14px 1fr auto auto;
      align-items: center;
      gap: 12px;
      color: #263238;
    }
    .swatch {
      width: 14px;
      height: 14px;
      border-radius: 4px;
    }
    .legend-value {
      font-weight: 500;
    }
    .legend-share {
      color: #455a64;
      min-width: 64px;
      text-align: right;
    }
    .muted {
      color: #455a64;
      font-weight: 400;
      grid-column: span 2;
    }
    .scope1 {
      background: #2e7d32;
    }
    .scope2 {
      background: #009688;
    }
    .scope3 {
      background: #607d8b;
    }
  `,
})
export class ScopeDistribution {
  readonly summary = input.required<EmissionSummary>();
  protected readonly scopes = EMISSION_SCOPES;
}
