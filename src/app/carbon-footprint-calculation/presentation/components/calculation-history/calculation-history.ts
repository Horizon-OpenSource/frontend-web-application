import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { CO2E_UNIT } from '../../../domain/model/footprint-calculation.entity';
import { CalculationHistoryEntry } from '../../../domain/model/footprint-summary.model';

@Component({
  selector: 'app-calculation-history',
  imports: [DatePipe, DecimalPipe, MatIcon, MatTableModule, TranslatePipe],
  templateUrl: './calculation-history.html',
  styleUrl: './calculation-history.css',
})
export class CalculationHistory {
  readonly history = input.required<readonly CalculationHistoryEntry[]>();

  protected readonly unit = CO2E_UNIT;
  protected readonly displayedColumns = ['period', 'calculatedAt', 'records', 'total'];
}
