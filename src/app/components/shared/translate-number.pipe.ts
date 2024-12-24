import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translateNumber',
  standalone: true
})
export class TranslateNumberPipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: string | number | null | undefined, format: string = '1.0-2', useGrouping: boolean = false): string {
    if (value == null || value === '') return ''; // Handle null or undefined

    const currentLang = this.translationService.getCurrentLanguage();

    try {
      if (typeof value === 'number') {
        // If the value is a number, format it directly
        return this.formatNumber(value, currentLang, format, useGrouping);
      }

      if (typeof value === 'string') {
        // Split the string into numeric and non-numeric parts
        const parts = value.match(/\d+|\D+/g); // Match numbers and non-numbers separately
        if (!parts) return value;

        return parts
          .map(part => {
            if (/\d+/.test(part)) {
              // If part is numeric, format it
              return this.formatNumber(parseInt(part, 10), currentLang, format, useGrouping);
            }
            return part; // Preserve non-numeric parts as-is
          })
          .join('');
      }

      return String(value); // Convert unknown types safely to string
    } catch (error) {
      console.error('Number formatting error:', error);
      return String(value); // Handle fallback case
    }
  }

  private formatNumber(
    value: number,
    lang: string,
    format: string,
    useGrouping: boolean
  ): string {
    // Parse the format string
    const [integerPart, fractionPart] = format.split('.');
    const minIntegerDigits = parseInt(integerPart, 10) || 1;
    const minFractionDigits = fractionPart ? parseInt(fractionPart.split('-')[0], 10) : 0;
    const maxFractionDigits = fractionPart ? parseInt(fractionPart.split('-')[1], 10) : 2;

    // Format the number
    return new Intl.NumberFormat(lang, {
      minimumIntegerDigits: minIntegerDigits,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits,
      useGrouping: useGrouping
    }).format(value);
  }
}
