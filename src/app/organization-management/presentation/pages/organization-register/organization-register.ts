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

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import { OrganizationStore } from '../../../application/organization.store';

@Component({
  selector: 'app-organization-register',

  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe
  ],

  templateUrl:
    './organization-register.html',

  styleUrl:
    './organization-register.scss',

  changeDetection:
  ChangeDetectionStrategy.OnPush
})
export class OrganizationRegister {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  private readonly translate =
    inject(TranslateService);

  protected readonly store =
    inject(OrganizationStore);

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

  protected readonly form =
    this.formBuilder.nonNullable.group({

      organizationName: [
        '',
        Validators.required
      ],

      industry: [
        '',
        Validators.required
      ],

      addressLine1: [
        '',
        Validators.required
      ],

      addressLine2: [''],

      city: [
        '',
        Validators.required
      ],

      stateProvince: [
        '',
        Validators.required
      ],

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
      ]
    });

  protected register(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    this.form.disable();

    this.store
      .createOrganization({

        name:
        value.organizationName,

        industry:
        value.industry,

        addressLine1:
        value.addressLine1,

        addressLine2:
        value.addressLine2,

        city:
        value.city,

        stateProvince:
        value.stateProvince,

        postalCode:
        value.postalCode,

        country:
        value.country,

        contactEmail:
        value.contactEmail,

        phone:
        value.phone,

        activeUsers: 1
      })
      .subscribe({

        next: () => {

          this.snackBar.open(
            this.translate.instant(
              'organization.messages.created'
            ),

            this.translate.instant(
              'organization.actions.close'
            ),

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
            this.translate.instant(
              'organization.messages.createError'
            ),

            this.translate.instant(
              'organization.actions.close'
            ),

            {
              duration: 3000
            }
          );
        }
      });
  }
}
