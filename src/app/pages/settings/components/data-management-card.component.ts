import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../components/shared/translate.pipe';

@Component({
  selector: 'app-data-management-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <h3>{{ 'dataManagement.title' | translate }}</h3>
      <div class="settings-group data-mgt-group">
        <button class="backup-button" (click)="backup.emit()">
          <span class="material-icons">download</span>
          {{ 'dataManagement.buttons.backup' | translate }}
        </button>
        <button class="clear-button" (click)="clear.emit()">
          <span class="material-icons">delete_forever</span>
          {{ 'dataManagement.buttons.clear' | translate }}
        </button>
        <button class="restore-button" (click)="restore.emit()">
          <span class="material-icons">restore</span>
          {{ 'dataManagement.buttons.restore' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .data-mgt-group {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .backup-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
      flex-grow: 1;
    }

    .clear-button, .restore-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #f44336;
      color: white;
      cursor: pointer;
      flex-grow: 1;
    }

    .restore-button {
      background-color: #4caf50;
    }
  `,
  ],
})
export class DataManagementCardComponent {
  @Output() backup = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() restore = new EventEmitter<void>();
}
