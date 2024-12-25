import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
type Language = 'en' | 'bn';

@Component({
  selector: 'app-language-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <h3>{{ 'settings.language' | translate }}</h3>
      <div class="settings-group">
        @for (lang of languages; track lang) {
          <div class="setting-item">
            <div class="setting-info">
              <span>{{ 'settings.languages.' + lang | translate }}</span>
              <small>{{ getLangDescription(lang) }}</small>
            </div>
            <div class="switch-button">
              <input 
                type="checkbox" 
                [id]="'lang_' + lang"
                [checked]="currentLang === lang"
                (change)="setLanguage(lang)"
              >
              <label [for]="'lang_' + lang"></label>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .settings-group {
      margin-top: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color-light);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
    }

    .setting-info small {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .switch-button {
      position: relative;
      width: 50px;
      height: 24px;
    }

    .switch-button input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-button label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--dashed-border);
      transition: .4s;
      border-radius: 34px;
    }

    .switch-button label:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: var(--surface-color);
      transition: .4s;
      border-radius: 50%;
    }

    .switch-button input:checked + label {
      background-color: var(--primary-color);
    }

    .switch-button input:checked + label:before {
      transform: translateX(26px);
    }
  `]
})
export class LanguageCardComponent {
  languages: Language[] = ['en', 'bn'];
  currentLang: Language;

  constructor(private translationService: TranslationService) {
    this.currentLang = this.translationService.getCurrentLanguage() as Language;
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang as Language;
    });
  }

  setLanguage(lang: Language) {
    // If trying to uncheck the current language
    if (lang === this.currentLang) {
      // If only two languages, switch to the other
      if (this.languages.length === 2) {
        const otherLang = this.languages.find(l => l !== lang);
        if (otherLang) {
          this.translationService.setLanguage(otherLang);
        }
        return;
      }
      
      // If more than two languages, revert to default (first language)
      if (this.languages.length > 2) {
        const defaultLang = this.languages[0];
        this.translationService.setLanguage(defaultLang);
        return;
      }
    }

    // Normal language selection
    if (lang !== this.currentLang) {
      this.translationService.setLanguage(lang);
    }
  }

  getLangDescription(lang: Language): string {
    switch (lang) {
      case 'en':
        return 'English - Default language';
      case 'bn':
        return 'বাংলা - Bengali language';
      default:
        return '';
    }
  }
}
