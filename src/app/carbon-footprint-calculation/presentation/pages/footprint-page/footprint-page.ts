import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FootprintStore } from '../../../application/footprint.store';
import { CO2E_UNIT } from '../../../domain/model/footprint-calculation.entity';
import {
  ActivityFactorsTable,
  FactorChange,
} from '../../components/activity-factors-table/activity-factors-table';
import { CalculationHistory } from '../../components/calculation-history/calculation-history';
import { ScopeResults } from '../../components/scope-results/scope-results';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-footprint-page',
  imports: [
    ActivityFactorsTable,
    CalculationHistory,
    DecimalPipe,
    MatButton,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatSelect,
    ScopeResults,
    TranslatePipe,
  ],
  templateUrl: './footprint-page.html',
  styleUrl: './footprint-page.css',
})
export class FootprintPage implements OnInit {
  protected readonly store = inject(FootprintStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly unit = CO2E_UNIT;

  ngOnInit(): void {
    void this.store.load();
  }

  protected onPeriodChange(period: string): void {
    this.store.selectPeriod(period);
  }

  protected onFactorChange(change: FactorChange): void {
    void this.store.assignFactor(change.activityDataId, change.factorId);
  }

  protected async calculate(): Promise<void> {
    const outcome = await this.store.calculate();
    if (outcome.status === 'COMPLETED') {
      this.notify('carbonFootprint.messages.calculated');
    }
  }

  protected async clearResults(): Promise<void> {
    await this.store.clearResults();
    this.notify('carbonFootprint.messages.cleared');
  }

  protected async resetDemoData(): Promise<void> {
    await this.store.resetDemoData();
    this.notify('carbonFootprint.messages.reset');
  }

  private notify(key: string): void {
    this.snackBar.open(
      this.translate.instant(key),
      this.translate.instant('carbonFootprint.actions.close'),
      { duration: 3000 },
    );
  }
}
