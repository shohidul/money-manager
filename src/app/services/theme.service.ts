import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Meta } from '@angular/platform-browser';

type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _currentMode = new BehaviorSubject<ThemeMode>('system');
  private _currentColor = new BehaviorSubject<string>('#2196F3');

  currentMode$ = this._currentMode.asObservable();
  currentColor$ = this._currentColor.asObservable();

  constructor(private meta: Meta) {    
    // Load saved preferences on service initialization
    this.loadSavedPreferences();
    this.applyTheme();
  }

  private loadSavedPreferences() {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    const savedColor = localStorage.getItem('themeColor');

    if (savedMode) {
      this._currentMode.next(savedMode);
    }

    if (savedColor) {
      this._currentColor.next(savedColor);
    }
  }

  setThemeMode(mode: ThemeMode) {
    this._currentMode.next(mode);
    localStorage.setItem('themeMode', mode);
    this.applyTheme();
  }

  setThemeColor(color: string) {
    this._currentColor.next(color);
    localStorage.setItem('themeColor', color);
    this.applyTheme();
  }

  private applyTheme() {
    const mode = this._currentMode.value;
    const color = this._currentColor.value;

    // Apply theme mode
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }

    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', color);

    // Update PWA theme-color dynamically
    this.meta.updateTag({ name: 'theme-color', content: color });

    // Setup system theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (this._currentMode.value === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    // Remove previous listeners to prevent multiple attachments
    mediaQuery.removeEventListener('change', handleThemeChange);
    mediaQuery.addEventListener('change', handleThemeChange);
  }

  getCurrentMode(): ThemeMode {
    return this._currentMode.value;
  }

  getCurrentColor(): string {
    return this._currentColor.value;
  }
}
