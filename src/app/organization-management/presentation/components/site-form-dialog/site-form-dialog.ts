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
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TranslatePipe } from '@ngx-translate/core';

import { Site } from '../../../domain/model/site.entity';

@Component({
  selector: 'app-site-form-dialog',

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    TranslatePipe
  ],

  templateUrl: './site-form-dialog.html',
  styleUrl: './site-form-dialog.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFormDialog {

  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<SiteFormDialog>
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    active: [true]
  });

  protected save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const site: Omit<Site, 'id'> = {
      organizationId: 1,
      name: value.name,
      location: value.location,
      active: value.active,
      assignedUsers: 0
    };

    this.dialogRef.close(site);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
