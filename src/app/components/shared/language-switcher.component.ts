import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

type Language = 'en' | 'bn';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-switcher">
      <button 
        *ngFor="let lang of languages"
        (click)="switchLanguage(lang)"
        [class.active]="currentLang === lang"
        class="lang-btn"
      >
        {{ 'settings.languages.' + lang | translate }}
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 8px;
    }

    .lang-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: var(--surface-color);
      cursor: pointer;
      transition: all 0.2s;
    }

    .lang-btn:hover {
      background-color: var(--background-color);
    }

    .lang-btn.active {
      background-color: #e0e0e0;
      border-color: #bbb;
    }

    @media (max-width: 768px) {
      .lang-btn {
        padding: 6px 12px;
        font-size: 0.9em;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  languages: Language[] = ['en', 'bn'];
  currentLang: Language;

  constructor(private translationService: TranslationService) {
    this.currentLang = this.translationService.getCurrentLanguage() as Language;
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang as Language;
    });
  }

  switchLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
  }
}
