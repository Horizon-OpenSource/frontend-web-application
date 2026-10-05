import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslatePipe } from '@ngx-translate/core';

import { OrganizationStore } from '../../../application/organization.store';

@Component({
  selector: 'app-organization-register',

  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe
  ],

  templateUrl: './organization-register.html',
  styleUrl: './organization-register.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationRegister {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly store = inject(OrganizationStore);

  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

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

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      organizationName: [
        '',
        Validators.required
      ],

      industry: [
        '',
        Validators.required
      ],

      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      stateProvince: [''],
      postalCode: [''],

      country: [
        '',
        Validators.required
      ],

      contactEmail: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '',
        Validators.required
      ],

      firstName: [
        '',
        Validators.required
      ],

      lastName: [
        '',
        Validators.required
      ],

      accountEmail: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]
    },
    {
      validators: this.passwordsMatchValidator
    }
  );

  protected register(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.form.disable();

    this.store
      .createOrganization({
        name: value.organizationName,
        industry: value.industry,

        addressLine1: value.addressLine1,
        addressLine2: value.addressLine2,

        city: value.city,
        stateProvince: value.stateProvince,
        postalCode: value.postalCode,
        country: value.country,

        contactEmail: value.contactEmail,
        phone: value.phone,

        activeUsers: 1
      })
      .subscribe({
        next: () => {

          this.snackBar.open(
            'Organization created successfully',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate([
            '/organization'
          ]);
        },

        error: () => {

          this.form.enable();

          this.snackBar.open(
            'Unable to create organization',
            'Close',
            {
              duration: 3000
            }
          );
        }
      });
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    return password === confirmPassword
      ? null
      : { passwordsMismatch: true };
  }
}
