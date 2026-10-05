import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ALL_PERIODS, AnalyticsStore } from '../../../application/analytics.store';
import { Report } from '../../../domain/model/report.entity';
import {
  GenerateReportDialog,
  GenerateReportDialogData,
  GenerateReportRequest,
} from '../../components/generate-report-dialog/generate-report-dialog';

/** Generates, lists, filters and downloads environmental reports (US-27 to US-30). */
@Component({
  selector: 'app-reports-page',
  imports: [
    DatePipe,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatTableModule,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage implements OnInit {
  protected readonly store = inject(AnalyticsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly allPeriods = ALL_PERIODS;
  protected readonly displayedColumns = [
    'report',
    'period',
    'generatedAt',
    'total',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.store.load();
  }

  protected openGenerate(): void {
    const data: GenerateReportDialogData = {
      periods: this.store.periods(),
      defaultPeriodId: this.store.selectedPeriodId(),
    };
    this.dialog
      .open(GenerateReportDialog, { data, width: '520px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((request?: GenerateReportRequest) => {
        if (!request) return;
        const result = this.store.generateReport(request.type, request.periodId);
        if (result === 'generated') {
          this.notify('analytics.reports.messages.generated');
        } else {
          const period =
            request.type === 'consolidated'
              ? String(this.translate.instant('analytics.filters.allPeriods'))
              : this.store.periodLabel(request.periodId);
          this.notify('analytics.reports.messages.insufficientData', { period });
        }
      });
  }

  protected download(report: Report): void {
    const result = this.store.downloadReport(report);
    this.notify(
      result === 'downloaded'
        ? 'analytics.reports.messages.downloaded'
        : 'analytics.reports.messages.unavailable',
    );
  }

  protected resetDemoData(): void {
    this.store.resetDemoData();
    this.notify('analytics.reports.messages.reset');
  }

  private notify(key: string, params?: Record<string, string>): void {
    this.snackBar.open(
      this.translate.instant(key, params),
      this.translate.instant('analytics.reports.actions.close'),
      { duration: 4000 },
    );
  }
}
