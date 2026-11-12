import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityDataOrigin } from '../../../domain/model/activity-data.entity';
import { EmissionRecord, EmissionRecordInput, FacilityOption } from '../../../domain/model/emission-record.model';
import { EMISSION_SCOPES, EmissionScope } from '../../../domain/model/emission-scope';
import { SOURCE_NAME_MAX_LENGTH, SOURCE_TYPE_MAX_LENGTH, UNIT_MAX_LENGTH } from '../../../domain/model/emission-validation';
import { requiredTrimmedText, validActivityQuantity, validEmissionScope, validFacility, validReportingPeriod } from './emission-form.validators';

export interface EmissionFormDialogData {
  record?: EmissionRecord;
  facilities: FacilityOption[];
}

@Component({
  selector: 'app-emission-form-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatButton, TranslatePipe],
  templateUrl: './emission-form-dialog.html',
  styleUrl: './emission-form-dialog.css'
})
export class EmissionFormDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EmissionFormDialog, EmissionRecordInput>);
  protected readonly data = inject<EmissionFormDialogData>(MAT_DIALOG_DATA);
  protected readonly scopes = EMISSION_SCOPES;
  protected readonly isEditing = Boolean(this.data.record);

  protected readonly form = this.formBuilder.nonNullable.group({
    sourceName: [this.data.record?.source.name ?? '', requiredTrimmedText(SOURCE_NAME_MAX_LENGTH)],
    sourceType: [this.data.record?.source.type ?? '', requiredTrimmedText(SOURCE_TYPE_MAX_LENGTH)],
    facilityId: [this.data.record?.source.facilityId ?? '', validFacility(this.data.facilities.map(facility => facility.id))],
    scope: [this.data.record?.source.scope ?? ('' as EmissionScope | ''), validEmissionScope],
    quantity: [this.data.record?.activityData.quantity ?? 0, validActivityQuantity],
    unit: [this.data.record?.activityData.unit ?? '', requiredTrimmedText(UNIT_MAX_LENGTH)],
    period: [this.data.record?.activityData.period ?? '', validReportingPeriod],
    origin: [this.data.record?.activityData.origin ?? ('MANUAL' as ActivityDataOrigin)]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const facility = this.data.facilities.find(option => option.id === value.facilityId);
    if (!facility) return;

    this.dialogRef.close({
      ...value,
      sourceName: value.sourceName.trim(),
      sourceType: value.sourceType.trim(),
      unit: value.unit.trim(),
      facilityName: facility.name,
      scope: value.scope as EmissionScope
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
