import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { TranslatePipe } from '@ngx-translate/core';

import { OrganizationStore } from '../../../application/organization.store';

@Component({
  selector: 'app-organization-edit',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
    MatDividerModule
  ],
  templateUrl: './organization-edit.html',
  styleUrl: './organization-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationEdit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly store = inject(OrganizationStore);

  protected readonly industries = [
    'Manufacturing & Energy',
    'Agriculture',
    'Textile',
    'Mining',
    'Logistics',
    'Other'
  ];

  protected readonly countries = [
    'Peru',
    'Chile',
    'Colombia',
    'Ecuador'
  ];

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    industry: ['', Validators.required],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    stateProvince: ['', Validators.required],
    postalCode: [''],
    country: ['', Validators.required],
    contactEmail: ['', [
      Validators.required,
      Validators.email
    ]],
    phone: ['', Validators.required]
  });

  constructor() {

    if (!this.store.organization()) {
      this.store.loadOverview();
    }

    effect(() => {
      const organization = this.store.organization();

      if (!organization) {
        return;
      }

      this.form.patchValue({
        name: organization.name,
        industry: organization.industry,
        addressLine1: organization.addressLine1,
        addressLine2: organization.addressLine2,
        city: organization.city,
        stateProvince: organization.stateProvince,
        postalCode: organization.postalCode,
        country: organization.country,
        contactEmail: organization.contactEmail,
        phone: organization.phone
      });
    });
  }

  protected save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();

    this.store
      .updateOrganization(1, this.form.getRawValue())
      .subscribe({
        next: () => {

          this.snackBar.open(
            'Organization updated successfully',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate(['/organization']);
        },

        error: () => {

          this.form.enable();

          this.snackBar.open(
            'Unable to update organization',
            'Close',
            {
              duration: 3000
            }
          );
        }
      });
  }

  protected cancel(): void {
    this.router.navigate(['/organization']);
  }
}
