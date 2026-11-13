import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsStore } from '../../../application/analytics.store';
import { GoalsOverview } from '../../components/goals-overview/goals-overview';
import { PeriodComparisonCard } from '../../components/period-comparison-card/period-comparison-card';
import { ScopeDistribution } from '../../components/scope-distribution/scope-distribution';

/** Environmental dashboard: total, distribution by scope, comparison and goals (US-16, US-17, US-20, US-26). */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    DecimalPipe,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    TranslatePipe,
    ScopeDistribution,
    GoalsOverview,
    PeriodComparisonCard,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  protected readonly store = inject(AnalyticsStore);

  ngOnInit(): void {
    this.store.load();
  }
}
