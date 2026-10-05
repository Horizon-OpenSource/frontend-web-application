import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'emissions.delete.title' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'emissions.delete.message' | translate:{ name: sourceName } }}</p>
      <p class="warning">{{ 'emissions.delete.warning' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close(false)">{{ 'emissions.actions.cancel' | translate }}</button>
      <button mat-flat-button type="button" class="delete-button" (click)="close(true)">{{ 'emissions.actions.delete' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .warning { color: #b3261e; font-weight: 500; }
    .delete-button { background: #b3261e; color: #fff; }
  `]
})
export class ConfirmDeleteDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDeleteDialog, boolean>);
  protected readonly sourceName = inject<string>(MAT_DIALOG_DATA);

  protected close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
