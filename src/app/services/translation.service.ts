import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANG_KEY = 'preferred_language';
  private currentLangSubject = new BehaviorSubject<string>(this.getSavedLanguage());
  currentLang$ = this.currentLangSubject.asObservable();

  private translations: { [key: string]: any } = {};

  constructor() {
    // Load initial translations on service creation
    this.loadTranslations(this.currentLangSubject.value);
  }

  private getSavedLanguage(): string {
    return localStorage.getItem(this.LANG_KEY) || 'en';
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  async setLanguage(lang: string) {
    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }
    localStorage.setItem(this.LANG_KEY, lang);
    this.currentLangSubject.next(lang);
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.getTranslationValue(key, this.translations[currentLang]) || key;
  }

  private async loadTranslations(lang: string) {
    try {
      const response = await fetch(`/assets/i18n/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.translations[lang] = await response.json();
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Load English as fallback
      if (lang !== 'en') {
        await this.loadTranslations('en');
      }
    }
  }

  private getTranslationValue(key: string, translations: any): string {
    if (!translations) return '';
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return '';
      }
    }

    return typeof value === 'string' ? value : '';
  }
}
