import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MatButtonToggle,
  MatButtonToggleGroup
} from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  private translate = inject(TranslateService);

  currentLang = this.translate.currentLang() || 'en';
  languages = ['en', 'es'];

  useLanguage(language: string): void {
    this.translate.use(language);
    this.currentLang = language;
  }
}
