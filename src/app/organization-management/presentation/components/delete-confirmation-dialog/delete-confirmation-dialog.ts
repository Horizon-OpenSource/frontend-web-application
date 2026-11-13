import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  TranslatePipe
} from '@ngx-translate/core';


export interface DeleteConfirmationDialogData {

  titleKey: string;

  messageKey: string;

  confirmKey: string;

  name: string;
}


@Component({
  selector:
    'app-delete-confirmation-dialog',

  imports: [
    MatDialogModule,
    MatButtonModule,
    TranslatePipe
  ],

  templateUrl:
    './delete-confirmation-dialog.html',

  styleUrl:
    './delete-confirmation-dialog.scss',

  changeDetection:
  ChangeDetectionStrategy.OnPush
})
export class DeleteConfirmationDialog {

  protected readonly data =
    inject<DeleteConfirmationDialogData>(
      MAT_DIALOG_DATA
    );

  private readonly dialogRef =
    inject(
      MatDialogRef<
        DeleteConfirmationDialog
      >
    );


  protected confirm(): void {

    this.dialogRef.close(true);
  }


  protected cancel(): void {

    this.dialogRef.close(false);
  }
}
