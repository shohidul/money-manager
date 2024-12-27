import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translateDate',
  standalone: true
})
export class TranslateDatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: Date | string | number, format: string = ''): string {
    if (!value) return '';

    // Ensure value is a Date object
    const dateValue = value instanceof Date 
      ? value 
      : new Date(value);

    if (isNaN(dateValue.getTime())) return '';

    let currentLang = this.translationService.getCurrentLanguage();
    currentLang = currentLang === 'en' ? 'en-GB' : 'bn-BD';

    try {
      let formattedDate: string;

      switch (format) {
        case 'short':
          formattedDate = new Intl.DateTimeFormat(currentLang, {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(dateValue);
          break;
        case 'MM/dd E':
          const parts = new Intl.DateTimeFormat(currentLang, {
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
          }).formatToParts(dateValue);

          const month = parts.find(p => p.type === 'month')?.value || '';
          const day = parts.find(p => p.type === 'day')?.value || '';
          const weekday = parts.find(p => p.type === 'weekday')?.value || '';

          formattedDate = `${month}/${day} ${weekday}`;
          break;
        case 'MMM d':
          const parts2 = new Intl.DateTimeFormat(currentLang, {
            month: currentLang === 'en-GB' ? 'short' : 'long',
            day: 'numeric'
          }).formatToParts(dateValue);
          const month2 = parts2.find(p => p.type === 'month')?.value || '';
          const day2 = parts2.find(p => p.type === 'day')?.value || '';

          formattedDate = `${month2} ${day2}`;
          break;
        case 'shortTime':
          formattedDate = new Intl.DateTimeFormat(currentLang, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(dateValue);
          break;
        default:
          formattedDate = new Intl.DateTimeFormat(currentLang).format(dateValue);
      }

      // Ensure AM/PM is uppercase
      return formattedDate.replace(/\b(am|pm)\b/g, match => match.toUpperCase());
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateValue.toLocaleString();
    }
  }
}
