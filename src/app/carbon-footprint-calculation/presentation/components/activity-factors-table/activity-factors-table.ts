import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityFactorRow } from '../../../application/activity-factor-row.model';

export interface FactorChange {
  activityDataId: string;
  factorId: string | null;
}

@Component({
  selector: 'app-activity-factors-table',
  imports: [
    DecimalPipe,
    MatFormField,
    MatIcon,
    MatOption,
    MatSelect,
    MatTableModule,
    TranslatePipe,
  ],
  templateUrl: './activity-factors-table.html',
  styleUrl: './activity-factors-table.css',
})
export class ActivityFactorsTable {
  readonly rows = input.required<readonly ActivityFactorRow[]>();
  readonly factorChange = output<FactorChange>();

  protected readonly displayedColumns = ['source', 'scope', 'activity', 'factor', 'status'];

  protected onFactorSelected(activityDataId: string, factorId: string): void {
    this.factorChange.emit({ activityDataId, factorId: factorId || null });
  }
}
