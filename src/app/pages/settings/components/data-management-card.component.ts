import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { DbService } from '../../../services/db.service';
import { CategoryService } from '../../../services/category.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-data-management-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <h3>{{ 'dataManagement.title' | translate }}</h3>
      <div class="settings-group data-mgt-group">
        <button class="backup-button" (click)="backupData()">
          <span class="material-icons">download</span>
          {{ 'dataManagement.buttons.backup' | translate }}
        </button>
        <button class="clear-button" (click)="clearData()">
          <span class="material-icons">delete_forever</span>
          {{ 'dataManagement.buttons.clear' | translate }}
        </button>
        <button class="restore-button" (click)="restoreData()">
          <span class="material-icons">restore</span>
          {{ 'dataManagement.buttons.restore' | translate }}
        </button>
        <button class="restore-button" (click)="restoreDemoData()">
          <span class="material-icons">restore</span>
          {{ 'dataManagement.buttons.demo' | translate }}
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
  constructor(
    private dbService: DbService,
    private categoryService: CategoryService,
    private translate: TranslatePipe
  ) {}
  
  async backupData() {
    const startDate = new Date(0);
    const endDate = new Date();

    const transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    const categories = await this.dbService.getCategories();
    const budgetHistory = await this.dbService.getBudgetHistory();

    const data = { transactions, categories, budgetHistory };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `money-manager-backup-${format(
      new Date(),
      'yyyy-MM-dd'
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async clearData() {
    const shouldClear = window.confirm(
      this.translate.transform('settings.clearData')
    );
    if (!shouldClear) return;

    try {
      // Delete the entire database
      await this.dbService.deleteDatabase();

      // Reinitialize default categories
      await this.categoryService.initializeDefaultCategories();

      // Notify user
      alert(this.translate.transform('settings.dataCleared'));
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert(this.translate.transform('settings.failedToClearData'));
    }
  }

  async restoreData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate data structure
        if (!this.isValidBackupData(data)) {
          alert(this.translate.transform('settings.invalidDataFormat'));
          return;
        }

        // Confirm restore action
        const confirmRestore = confirm(this.translate.transform('settings.confirmRestore'));
        if (!confirmRestore) return;

        // Clear existing data and restore
        await this.dbService.clearAllData();
        await this.dbService.restoreData(data);

        // Clear categories cache
        this.categoryService.clearCategoriesCache();

        alert(this.translate.transform('settings.dataRestored'));
      } catch (error) {
        console.error('Restore failed:', error);
        alert(this.translate.transform('settings.failedToParseFile'));
      }
    };
    fileInput.click();
  }

  async restoreDemoData() {
    try {
      // Fetch demo data directly from the JSON file
      const response = await fetch('assets/demo_data.json');
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Validate data structure
      if (!this.isValidBackupData(data)) {
        alert(this.translate.transform('settings.invalidDataFormat'));
        return;
      }

      // Confirm restore action
      const confirmRestore = confirm(this.translate.transform('settings.confirmRestore'));
      if (!confirmRestore) return;

      // Clear existing data and restore
      await this.dbService.clearAllData();
      await this.dbService.restoreData(data);

      // Clear categories cache
      this.categoryService.clearCategoriesCache();

      alert(this.translate.transform('settings.dataRestored'));
    } catch (error) {
      console.error('Restore demo data failed:', error);
      alert(this.translate.transform('settings.failedToParseFile'));
    }
  }

  private isValidBackupData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.categories) &&
      Array.isArray(data.transactions) &&
      data.categories.length > 0 &&
      data.transactions.length >= 0
    )
  }

}
