import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityDataOrigin } from '../../../domain/model/activity-data.entity';
import { EmissionRecord, EmissionRecordInput, FacilityOption } from '../../../domain/model/emission-record.model';
import { EMISSION_SCOPES, EmissionScope } from '../../../domain/model/emission-scope';

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
  protected readonly origins: ActivityDataOrigin[] = ['MANUAL', 'CSV', 'API'];
  protected readonly isEditing = Boolean(this.data.record);

  protected readonly form = this.formBuilder.nonNullable.group({
    sourceName: [this.data.record?.source.name ?? '', [Validators.required, Validators.maxLength(120)]],
    sourceType: [this.data.record?.source.type ?? '', [Validators.required, Validators.maxLength(100)]],
    facilityId: [this.data.record?.source.facilityId ?? '', Validators.required],
    scope: [this.data.record?.source.scope ?? EmissionScope.Scope1, Validators.required],
    quantity: [this.data.record?.activityData.quantity ?? 0, [Validators.required, Validators.min(0.01)]],
    unit: [this.data.record?.activityData.unit ?? '', [Validators.required, Validators.maxLength(20)]],
    period: [this.data.record?.activityData.period ?? '', Validators.required],
    origin: [this.data.record?.activityData.origin ?? 'MANUAL', Validators.required]
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
      facilityName: facility.name,
      scope: value.scope as EmissionScope,
      origin: value.origin as ActivityDataOrigin
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
