import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-reset-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'emissions.reset.title' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'emissions.reset.message' | translate }}</p>
      <p>{{ 'emissions.reset.warning' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close(false)">{{ 'emissions.actions.cancel' | translate }}</button>
      <button mat-flat-button type="button" (click)="close(true)">{{ 'emissions.actions.resetDemo' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmResetDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmResetDialog, boolean>);

  protected close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
