import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../services/db.service';
import { PinService } from '../../services/pin.service';
import { PinDialogComponent } from '../../components/pin-dialog/pin-dialog.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PinDialogComponent, MobileHeaderComponent],
  template: `
    <div class="settings">
      <app-mobile-header
        title="Settings"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="card">
          <h3>Security</h3>
          <div class="settings-group">
            <div class="setting-item">
              <div class="setting-info">
                <span>PIN Lock</span>
                <small>Protect your data with a 4-digit PIN</small>
              </div>
              <button 
                class="pin-button"
                (click)="togglePinDialog()"
              >
                {{ pinService.hasPin() ? 'Change PIN' : 'Set PIN' }}
              </button>
            </div>
            @if (pinService.hasPin()) {
              <div class="setting-item">
                <div class="setting-info">
                  <span>Auto-lock</span>
                  <small>Lock app when switching to background</small>
                </div>
                <div class="switch-button">
                  <input 
                    type="checkbox" 
                    [checked]="pinService.isLocked()"
                    (change)="toggleAutoLock()"
                    id="autoLock"
                  >
                  <label for="autoLock"></label>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <div class="section-header">
            <h3>Categories</h3>
            <div class="category-filters">
              <button 
                [class.active]="categoryFilter === 'all'"
                (click)="categoryFilter = 'all'"
              >
                All
              </button>
              <button 
                [class.active]="categoryFilter === 'income'"
                (click)="categoryFilter = 'income'"
              >
                Income
              </button>
              <button 
                [class.active]="categoryFilter === 'expense'"
                (click)="categoryFilter = 'expense'"
              >
                Expense
              </button>
            </div>
          </div>
          <div class="category-list">
            @for (category of filteredCategories; track category.id) {
              <div class="category-item" cdkDrag>
                <div class="category-info">
                  <span class="material-symbols-rounded">{{ category.icon }}</span>
                  <span>{{ category.name }}</span>
                  <span class="category-type">{{ category.type }}</span>
                </div>
                @if (category.isCustom) {
                  <button 
                    class="delete-button"
                    (click)="deleteCategory(category)"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <div class="card">
          <h3>Data Management</h3>
          <div class="settings-group data-mgt-group">
            <button class="backup-button" (click)="backupData()">
              <span class="material-icons">download</span>
              Backup Data
            </button>
            <button class="clear-button" (click)="clearData()">
              <span class="material-icons">delete_forever</span>
              Clear All Data
            </button>
            <button class="restore-button" (click)="restoreData()">
              <span class="material-icons">restore</span>
              Restore Data
            </button>
          </div>
        </div>
      </div>

      @if (showPinDialog) {
        <div class="pin-overlay">
          <app-pin-dialog
            mode="set"
            (pinEntered)="onPinSet($event)"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .settings {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .settings-group {
      margin-top: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
    }

    .setting-info small {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .pin-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .category-filters {
      display: flex;
      gap: 0.5rem;
    }

    .category-filters button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .category-filters button.active {
      background: var(--primary-color);
      color: white;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.04);
      cursor: move;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-type {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .delete-button {
      background: none;
      border: none;
      color: var(--secondary-color);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }

    .delete-button:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    .data-mgt-group{
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

    .backup-button:hover {
      background-color: #1976d2;
    }

    .clear-button, .restore-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #f44336; /* Red for clear button */
      color: white;
      cursor: pointer;
      flex-grow: 1;
    }

    .clear-button:hover {
      background-color: #d32f2f;
    }

    .restore-button {
      background-color: #4caf50; /* Green for restore button */
    }

    .restore-button:hover {
      background-color: #388e3c;
    }

    .pin-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .pin-overlay app-pin-dialog {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .switch-button {
      position: relative;
      width: 50px;
      height: 24px;
    }

    .switch-button input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-button label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .switch-button label:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    .switch-button input:checked + label {
      background-color: var(--primary-color);
    }

    .switch-button input:checked + label:before {
      transform: translateX(26px);
    }
  `]
})
export class SettingsComponent implements OnInit {
  categories: any[] = [];
  showPinDialog = false;
  categoryFilter: 'all' | 'income' | 'expense' = 'all';

  constructor(
    private dbService: DbService,
    private router: Router,
    public pinService: PinService
  ) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  get filteredCategories() {
    return this.categories.filter(category => 
      this.categoryFilter === 'all' || category.type === this.categoryFilter
    );
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async deleteCategory(category: any) {
    const confirm = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`
    );
    if (!confirm) return;

    await this.dbService.deleteCategory(category.id);
    await this.loadCategories();
  }

  async backupData() {
    const startDate = new Date(0); // Beginning of time
    const endDate = new Date(); // Current date

    const transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    const categories = await this.dbService.getCategories();

    const data = {
      transactions,
      categories,
    };

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
    const confirm = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone.'
    );
    if (!confirm) return;

    await this.dbService.clearAllData();
    await this.loadCategories();
    alert('All data has been cleared.');
  }

  async restoreData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const text = await file.text();
      try {
        const data = JSON.parse(text);

        if (data.categories && data.transactions) {
          await this.dbService.restoreData(data);
          await this.loadCategories();
          alert('Data has been restored.');
        } else {
          alert('Invalid data format.');
        }
      } catch (error) {
        alert('Failed to parse the file.');
      }
    };
    fileInput.click();
  }

  togglePinDialog() {
    this.showPinDialog = !this.showPinDialog;
  }

  toggleAutoLock() {
    this.pinService.setLocked(!this.pinService.isLocked());
  }

  onPinSet(pin: string) {
    this.pinService.setPin(pin);
    this.showPinDialog = false;
    alert('PIN has been set successfully');
  }

  goBack() {
    this.router.navigate(['/']);
  }
}