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

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  Site
} from '../../../domain/model/site.entity';


interface SiteFormDialogData {

  organizationId: number;

  site?: Site;
}


@Component({
  selector:
    'app-site-form-dialog',

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    TranslatePipe
  ],

  templateUrl:
    './site-form-dialog.html',

  styleUrl:
    './site-form-dialog.scss',

  changeDetection:
  ChangeDetectionStrategy.OnPush
})
export class SiteFormDialog {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly dialogRef =
    inject(
      MatDialogRef<SiteFormDialog>
    );

  private readonly data =
    inject<SiteFormDialogData>(
      MAT_DIALOG_DATA
    );


  protected readonly isEdit =
    !!this.data.site;


  protected readonly form =
    this.formBuilder.nonNullable.group({

      name: [
        this.data.site?.name ?? '',
        Validators.required
      ],

      location: [
        this.data.site?.location ?? '',
        Validators.required
      ],

      active: [
        this.data.site?.active ?? true
      ]

    });


  protected save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    const value =
      this.form.getRawValue();


    const site:
      Omit<Site, 'id'> = {

      organizationId:
      this.data.organizationId,

      name:
      value.name,

      location:
      value.location,

      active:
      value.active,

      assignedUsers:
        this.data.site
          ?.assignedUsers
        ?? 0
    };


    this.dialogRef.close(site);
  }


  protected cancel(): void {

    this.dialogRef.close();
  }
}
