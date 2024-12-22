import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private static translationCache: { [lang: string]: { [key: string]: any } } = {};
  private loading = false;
  private currentLang = '';

  constructor(private translationService: TranslationService) {
    this.currentLang = this.translationService.getCurrentLanguage();
    
    // Load initial translations
    if (!TranslatePipe.translationCache[this.currentLang]) {
      this.loadTranslations();
    }

    // Subscribe to language changes
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      if (!TranslatePipe.translationCache[lang]) {
        this.loadTranslations();
      }
    });
  }

  private async loadTranslations() {
    if (this.loading) return;
    this.loading = true;

    try {
      const response = await fetch(`/assets/i18n/${this.currentLang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      TranslatePipe.translationCache[this.currentLang] = await response.json();
      
      // Pre-load alternate language in background
      const altLang = this.currentLang === 'en' ? 'bn' : 'en';
      if (!TranslatePipe.translationCache[altLang]) {
        const altResponse = await fetch(`/assets/i18n/${altLang}.json`);
        if (altResponse.ok) {
          TranslatePipe.translationCache[altLang] = await altResponse.json();
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if not already using it
      if (this.currentLang !== 'en') {
        try {
          if (!TranslatePipe.translationCache['en']) {
            const fallbackResponse = await fetch('/assets/i18n/en.json');
            if (fallbackResponse.ok) {
              TranslatePipe.translationCache['en'] = await fallbackResponse.json();
            }
          }
        } catch (fallbackError) {
          console.error('Error loading fallback translations:', fallbackError);
        }
      }
    } finally {
      this.loading = false;
    }
  }

  transform(key: string, params?: any[] | any): string {
    if (!key) return '';
    
    const translations = TranslatePipe.translationCache[this.currentLang];
    if (!translations) {
      // If translations aren't loaded yet, try English cache or return key
      const fallback = TranslatePipe.translationCache['en'];
      if (fallback) {
        return this.getTranslation(key, fallback, params) || key;
      }
      return key;
    }
    
    return this.getTranslation(key, translations, params) || key;
  }

  private getTranslation(key: string, translations: any, params?: any[] | any): string {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return '';
      }
    }

    if (typeof value !== 'string') return '';

    // Normalize params to an array
    const paramArray = Array.isArray(params) ? params : [params];

    // Support parameter interpolation with specific index matching
    if (paramArray.length > 0) {
      value = value.replace(/\{(\d+)\}/g, (match, index) => {
        const paramIndex = parseInt(index);
        return paramIndex < paramArray.length && paramArray[paramIndex] !== undefined 
          ? paramArray[paramIndex] 
          : match;
      });
    }

    return value;
  }
}
