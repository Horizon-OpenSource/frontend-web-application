import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPeriod, isValidQuantity, isValidScope } from '../../../domain/model/emission-validation';

export function requiredTrimmedText(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (typeof value !== 'string' || !value.trim()) return { required: true };
    return value.trim().length <= maxLength ? null : { maxlength: { requiredLength: maxLength } };
  };
}

export const validActivityQuantity: ValidatorFn = control =>
  isValidQuantity(control.value) ? null : { positive: true };

export const validReportingPeriod: ValidatorFn = control =>
  isValidPeriod(control.value) ? null : { period: true };

export const validEmissionScope: ValidatorFn = control =>
  isValidScope(control.value) ? null : { scope: true };

export function validFacility(ids: readonly string[]): ValidatorFn {
  return control => ids.includes(control.value) ? null : { facility: true };
}
