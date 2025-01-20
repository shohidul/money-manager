import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-voice-command-overlay',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="voice-overlay" [class.active]="isActive">
      <div class="voice-content">
        <div class="voice-icon">
          <span class="material-icons">{{ isListening ? 'mic' : 'hourglass_empty' }}</span>
        </div>
        <div class="voice-text">
          {{ transcript || (isListening ? ('voice.listening' | translate) : ('voice.processing' | translate)) }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .voice-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 9999;
    }

    .voice-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .voice-content {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      min-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .voice-icon {
      margin-bottom: 1rem;
    }

    .voice-icon .material-icons {
      font-size: 3rem;
      color: #1976d2;
    }

    .voice-text {
      font-size: 1.2rem;
      color: #333;
      margin-top: 1rem;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .voice-icon .material-icons {
      animation: pulse 1.5s infinite;
    }
  `]
})
export class VoiceCommandOverlayComponent {
  @Input() isActive = false;
  @Input() isListening = false;
  @Input() transcript = '';
}
