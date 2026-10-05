import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FootprintStore } from '../../../application/footprint.store';
import { FootprintRepository } from '../../../domain/repository/footprint.repository';
import { MockFootprintRepository } from '../../../infrastructure/mock-footprint.repository';
import { FootprintPage } from './footprint-page';

describe('FootprintPage', () => {
  let fixture: ComponentFixture<FootprintPage>;
  let element: HTMLElement;
  let store: FootprintStore;

  /** Lets the asynchronous mock repository finish and renders the result. */
  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  function button(labelKey: string): HTMLButtonElement {
    const found = Array.from(element.querySelectorAll('button')).find((item) =>
      item.textContent?.includes(labelKey),
    );
    if (!found) throw new Error(`Button not found: ${labelKey}`);
    return found;
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FootprintPage],
      providers: [
        provideTranslateService(),
        FootprintStore,
        { provide: FootprintRepository, useClass: MockFootprintRepository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FootprintPage);
    element = fixture.nativeElement;
    store = TestBed.inject(FootprintStore);
    fixture.detectChanges();
    await settle();
  });

  it('shows the activity data of the latest period with its calculation status', () => {
    const rows = element.querySelectorAll('app-activity-factors-table tr.mat-mdc-row');

    expect(rows).toHaveLength(2);
    expect(element.textContent).toContain('Natural gas boiler');
    expect(element.textContent).toContain('carbonFootprint.status.MISSING_FACTOR');
    expect(element.textContent).toContain('carbonFootprint.status.READY');
  });

  it('warns which records are pending when the calculation cannot be completed (US-34)', async () => {
    button('carbonFootprint.actions.calculate').click();
    await settle();

    const alert = element.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain('Natural gas boiler');
    expect(alert?.textContent).toContain('carbonFootprint.pending.MISSING_FACTOR');
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('shows the total in CO2e and the results by scope once the period is calculated (US-34, US-35)', async () => {
    store.selectPeriod('2026-08');
    fixture.detectChanges();

    button('carbonFootprint.actions.calculate').click();
    await settle();

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('8,215.5 kgCO₂e');

    const cards = element.querySelectorAll('app-scope-results .result-card');
    expect(cards).toHaveLength(4);
    expect(cards[1].textContent).toContain('2,278');
    expect(cards[2].textContent).toContain('3,125');
    expect(cards[3].textContent).toContain('2,812.5');
  });

  it('says there are no results for a scope without data (US-35)', () => {
    store.selectPeriod('2026-06');
    fixture.detectChanges();

    const scope3 = element.querySelectorAll('app-scope-results .result-card')[3];
    expect(scope3.textContent).toContain('carbonFootprint.results.noScopeResults');
  });

  it('says there are no results for a period that was not calculated (US-36)', () => {
    store.selectPeriod('2026-08');
    fixture.detectChanges();

    const total = element.querySelector('app-scope-results .result-card.total');
    expect(total?.textContent).toContain('carbonFootprint.results.noResults');
  });

  it('lists the previous calculations and shows an empty message when there are none (US-37)', async () => {
    expect(element.querySelector('app-calculation-history')?.textContent).toContain('2026-06');

    button('carbonFootprint.actions.clearResults').click();
    await settle();

    expect(element.querySelector('app-calculation-history')?.textContent).toContain(
      'carbonFootprint.history.empty',
    );
  });

  it('only offers compatible emission factors for a record (US-46)', async () => {
    const select = element.querySelectorAll<HTMLElement>(
      'app-activity-factors-table mat-select',
    )[0];
    select.click();
    fixture.detectChanges();
    await settle();

    const options = Array.from(document.querySelectorAll('mat-option')).map(
      (option) => option.textContent ?? '',
    );
    expect(options.some((text) => text.includes('Natural gas combustion'))).toBe(true);
    expect(options.some((text) => text.includes('Diesel combustion'))).toBe(false);
  });
});
