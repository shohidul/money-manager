import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pin-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pin-dots">
      @for (dot of dots; track dot) {
        <div class="pin-dot" [class.filled]="dot"></div>
      }
    </div>
  `,
  styles: [`
    .pin-dots {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin: 2rem 0;
    }

    .pin-dot {
      width: 16px;
      height: 16px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .pin-dot.filled {
      background-color: var(--primary-color);
      transform: scale(1.1);
    }
  `]
})
export class PinDisplayComponent {
  @Input() dots: boolean[] = [false, false, false, false];
}