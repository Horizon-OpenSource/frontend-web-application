import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CO2E_UNIT } from '../../../domain/model/footprint-calculation.entity';
import { ScopeResult } from '../../../domain/model/footprint-summary.model';

@Component({
  selector: 'app-scope-results',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './scope-results.html',
  styleUrl: './scope-results.css',
})
export class ScopeResults {
  /** Total of the period, or null when the period has no results. */
  readonly total = input.required<number | null>();
  readonly scopes = input.required<readonly ScopeResult[]>();

  protected readonly unit = CO2E_UNIT;
}
