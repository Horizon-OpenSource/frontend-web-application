import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { EmissionRecord } from '../../../domain/model/emission-record.model';

@Component({
  selector: 'app-emission-detail-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatChip, TranslatePipe],
  templateUrl: './emission-detail-dialog.html',
  styleUrl: './emission-detail-dialog.css'
})
export class EmissionDetailDialog {
  protected readonly record = inject<EmissionRecord>(MAT_DIALOG_DATA);
}
