import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'translateNumber',
  standalone: true
})
export class TranslateNumberPipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: number, format: string = '1.0-2', useGrouping: boolean = false): string {
    if (value == null) return '';

    const currentLang = this.translationService.getCurrentLanguage();

    try {
      // Parse the format string
      const [integerPart, fractionPart] = format.split('.');
      const minIntegerDigits = parseInt(integerPart, 10) || 1;
      const minFractionDigits = fractionPart ? parseInt(fractionPart.split('-')[0], 10) : 0;
      const maxFractionDigits = fractionPart ? parseInt(fractionPart.split('-')[1], 10) : 2;

      // If the value has no decimal part or fewer decimal places than min, pad with zeros
      const roundedValue = this.roundToMaxDecimals(value, maxFractionDigits);

      return new Intl.NumberFormat(currentLang, {
        minimumIntegerDigits: minIntegerDigits,
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
        useGrouping: useGrouping  // Allow configurable grouping
      }).format(roundedValue);
    } catch (error) {
      console.error('Number formatting error:', error);
      return useGrouping ? value.toLocaleString() : value.toString();
    }
  }

  private roundToMaxDecimals(value: number, maxDecimals: number): number {
    const factor = Math.pow(10, maxDecimals);
    return Math.round(value * factor) / factor;
  }
}
