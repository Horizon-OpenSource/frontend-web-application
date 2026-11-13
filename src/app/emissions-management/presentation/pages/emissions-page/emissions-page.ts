import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EmissionsStore } from '../../../application/emissions.store';
import { EmissionRecord, EmissionRecordInput } from '../../../domain/model/emission-record.model';
import { EMISSION_SCOPES, EmissionScope } from '../../../domain/model/emission-scope';
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog/confirm-delete-dialog';
import { EmissionDetailDialog } from '../../components/emission-detail-dialog/emission-detail-dialog';
import { EmissionFormDialog } from '../../components/emission-form-dialog/emission-form-dialog';

@Component({
  selector: 'app-emissions-page',
  imports: [MatButton, MatIconButton, MatChip, MatFormField, MatLabel, MatPrefix, MatIcon, MatInput, MatSelect, MatOption, MatTableModule, MatTooltip, TranslatePipe],
  templateUrl: './emissions-page.html',
  styleUrl: './emissions-page.css'
})
export class EmissionsPage implements OnInit {
  protected readonly store = inject(EmissionsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  protected readonly scopes = EMISSION_SCOPES;
  protected readonly loadError = signal(false);
  protected readonly displayedColumns = ['source', 'scope', 'activity', 'period', 'origin', 'actions'];

  ngOnInit(): void {
    this.reloadRecords();
  }

  protected reloadRecords(): void {
    this.store.load().subscribe({
      next: () => this.loadError.set(false),
      error: () => this.loadError.set(true)
    });
  }

  protected setScope(value: EmissionScope | 'ALL'): void {
    this.store.setScope(value);
  }

  protected openCreate(): void {
    this.dialog.open(EmissionFormDialog, {
      width: '760px',
      maxWidth: '95vw',
      data: { facilities: this.store.facilities(), save: (input: EmissionRecordInput) => this.store.create(input) }
    }).afterClosed().subscribe((input?: EmissionRecordInput) => {
      if (input) this.notify('emissions.messages.created');
    });
  }

  protected openEdit(record: EmissionRecord): void {
    this.dialog.open(EmissionFormDialog, {
      width: '760px',
      maxWidth: '95vw',
      data: { record, facilities: this.store.facilities(), save: (input: EmissionRecordInput) => this.store.update(record.activityData.id, input) }
    }).afterClosed().subscribe((input?: EmissionRecordInput) => {
      if (input) this.notify('emissions.messages.updated');
    });
  }

  protected openDetail(record: EmissionRecord): void {
    this.dialog.open(EmissionDetailDialog, { data: record, maxWidth: '92vw' });
  }

  protected confirmDelete(record: EmissionRecord): void {
    this.dialog.open(ConfirmDeleteDialog, { data: record.source.name, width: '440px', maxWidth: '95vw' })
      .afterClosed().subscribe((confirmed?: boolean) => {
        if (confirmed) this.store.delete(record.activityData.id).subscribe({
          next: () => this.notify('emissions.messages.deleted'),
          error: () => this.notify('emissions.messages.operationFailed')
        });
      });
  }

  private notify(key: string): void {
    this.snackBar.open(this.translate.instant(key), this.translate.instant('emissions.actions.close'), { duration: 5000 });
  }
}
