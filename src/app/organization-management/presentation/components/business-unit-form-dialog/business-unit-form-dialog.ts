import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TranslatePipe } from '@ngx-translate/core';

import { BusinessUnit } from '../../../domain/model/business-unit.entity';
import { Site } from '../../../domain/model/site.entity';

interface BusinessUnitFormDialogData {
  organizationId: number;
  sites: Site[];
}

@Component({
  selector: 'app-business-unit-form-dialog',

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslatePipe
  ],

  templateUrl: './business-unit-form-dialog.html',
  styleUrl: './business-unit-form-dialog.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessUnitFormDialog {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly dialogRef =
    inject(MatDialogRef<BusinessUnitFormDialog>);

  private readonly data =
    inject<BusinessUnitFormDialogData>(
      MAT_DIALOG_DATA
    );

  protected readonly sites =
    this.data.sites;

  protected readonly form =
    this.formBuilder.nonNullable.group({

      name: [
        '',
        Validators.required
      ],

      code: [
        '',
        Validators.required
      ],

      siteId: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      responsible: [
        '',
        Validators.required
      ],

      description: [''],

      active: [true]
    });

  protected save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const businessUnit:
      Omit<BusinessUnit, 'id'> = {

      organizationId:
      this.data.organizationId,

      siteId:
      value.siteId,

      name:
      value.name,

      code:
      value.code,

      responsible:
      value.responsible,

      description:
      value.description,

      active:
      value.active,

      emissionSourceCount: 0
    };

    this.dialogRef.close(
      businessUnit
    );
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
