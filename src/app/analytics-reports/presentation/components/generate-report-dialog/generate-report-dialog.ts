import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportType } from '../../../domain/model/report.entity';
import { ReportingPeriod } from '../../../domain/model/reporting-period.entity';

export interface GenerateReportDialogData {
  periods: readonly ReportingPeriod[];
  defaultPeriodId: string;
}

export interface GenerateReportRequest {
  type: ReportType;
  periodId: string;
}

/** Lets the user choose a period report (US-29) or a consolidated report (US-27). */
@Component({
  selector: 'app-generate-report-dialog',
  imports: [
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatRadioGroup,
    MatRadioButton,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'analytics.reports.form.title' | translate }}</h2>

    <mat-dialog-content>
      <p id="report-type-label" class="field-label">
        {{ 'analytics.reports.form.type' | translate }}
      </p>
      <mat-radio-group
        class="type-group"
        aria-labelledby="report-type-label"
        [value]="type()"
        (change)="type.set($event.value)"
      >
        <mat-radio-button value="period">{{
          'analytics.reports.types.period' | translate
        }}</mat-radio-button>
        <mat-radio-button value="consolidated">{{
          'analytics.reports.types.consolidated' | translate
        }}</mat-radio-button>
      </mat-radio-group>

      @if (type() === 'period') {
        <mat-form-field appearance="outline" class="period-field">
          <mat-label>{{ 'analytics.filters.period' | translate }}</mat-label>
          <mat-select [value]="periodId()" (selectionChange)="periodId.set($event.value)">
            @for (period of data.periods; track period.id) {
              <mat-option [value]="period.id">{{ period.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <p class="hint">{{ 'analytics.reports.form.periodHint' | translate }}</p>
      } @else {
        <p class="hint">{{ 'analytics.reports.form.consolidatedHint' | translate }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>
        {{ 'analytics.reports.actions.cancel' | translate }}
      </button>
      <button mat-flat-button type="button" (click)="confirm()">
        {{ 'analytics.reports.actions.generate' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .field-label {
      margin: 0 0 8px;
      color: #263238;
      font-weight: 500;
    }
    .type-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      margin-bottom: 20px;
    }
    .period-field {
      width: 100%;
    }
    .hint {
      margin: 0;
      color: #455a64;
      font-size: 0.875rem;
    }
  `,
})
export class GenerateReportDialog {
  protected readonly data = inject<GenerateReportDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<GenerateReportDialog, GenerateReportRequest>>(MatDialogRef);

  protected readonly type = signal<ReportType>('period');
  protected readonly periodId = signal(this.data.defaultPeriodId);

  protected confirm(): void {
    this.dialogRef.close({ type: this.type(), periodId: this.periodId() });
  }
}
