import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translateDate',
  standalone: true
})
export class TranslateDatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: Date, format: string = 'short'): string {
    if (!value) return '';

    const currentLang = this.translationService.getCurrentLanguage();
    
    try {
      switch (format) {
        case 'short':
          return new Intl.DateTimeFormat(currentLang, {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(value);
        case 'MM/dd E':
          // Custom formatting to match exact requirements
          const parts = new Intl.DateTimeFormat(currentLang, {
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
          }).formatToParts(value);

          const month = parts.find(p => p.type === 'month')?.value || '';
          const day = parts.find(p => p.type === 'day')?.value || '';
          const weekday = parts.find(p => p.type === 'weekday')?.value || '';

          // Ensure two-digit month and day
          return `${month}/${day} ${weekday}`;
        case 'shortTime':
          return new Intl.DateTimeFormat(currentLang, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(value);
        default:
          return value.toLocaleDateString(currentLang);
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return value.toLocaleString();
    }
  }
}