import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translateNumber',
  standalone: true
})
export class TranslateNumberPipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: string | number | null | undefined, format: string = '1.0-2', useGrouping: boolean = true): string {
    return this.transformByLocale(value, null, format, useGrouping);
  }

  transformByLocale(value: string | number | null | undefined, lang: string | null = null, format: string = '1.0-2', useGrouping: boolean = true): string {
    if (value == null || value === '') return ''; // Handle null or undefined

    const currentLang = lang || this.translationService.getCurrentLanguage();

    try {
      if (typeof value === 'number') {
        // If the value is a number, format it directly
        return this.formatNumber(value, currentLang, format, useGrouping);
      }

      if (typeof value === 'string') {
        // Define a map to translate Bengali digits to English
        const bengaliToEnglishMap: { [key: string]: string } = {
          '০': '0',
          '১': '1',
          '২': '2',
          '৩': '3',
          '৪': '4',
          '৫': '5',
          '৬': '6',
          '৭': '7',
          '৮': '8',
          '৯': '9',
        };

        // Replace Bengali digits with English digits
        const translatedValue = value.replace(/[০-৯]/g, (bengaliDigit) => bengaliToEnglishMap[bengaliDigit]);

        // Split the translated string into numeric and non-numeric parts
        const parts = translatedValue.match(/\d+|\D+/g); // Match numbers and non-numbers separately
        if (!parts) return value;
      
        // Map each part to either format numbers or leave non-numeric parts as-is
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

    // Format the number with grouping (comma separation)
    return new Intl.NumberFormat(lang, {
      minimumIntegerDigits: minIntegerDigits,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits,
      useGrouping: useGrouping // Ensure comma grouping is applied
    }).format(value);
  }
}
