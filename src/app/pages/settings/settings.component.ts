import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Category } from '../../services/db.service';
import { format } from 'date-fns';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings">
      <header class="top-bar">
        <button class="back-button" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2>Settings</h2>
      </header>

      <div class="card">
        <h3>Category Management</h3>
        <div class="category-list">
          <div *ngFor="let category of categories" class="category-item">
            <div class="category-info">
              <span class="material-icons">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
              <span class="category-type">{{ category.type }}</span>
            </div>
            <button 
              *ngIf="category.isCustom"
              class="delete-button"
              (click)="deleteCategory(category)"
            >
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Data Management</h3>
        <div class="settings-group">
          <button class="export-button" (click)="exportData()">
            <span class="material-icons">download</span>
            Export Data
          </button>
          <button class="clear-button" (click)="clearData()">
            <span class="material-icons">delete</span>
            Clear Data
          </button>
          <button class="restore-button" (click)="restoreData()">
            <span class="material-icons">restore</span>
            Restore Data
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .top-bar {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      background-color: var(--surface-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }

    .settings {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .top-bar {
      margin-bottom: 1rem;
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

    .settings-group {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .export-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }

    .export-button:hover {
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

  `,
  ],
})
export class SettingsComponent implements OnInit {
  categories: Category[] = [];

  constructor(private dbService: DbService, private router: Router) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async deleteCategory(category: Category) {
    if (!category.id) return;

    const confirm = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`
    );
    if (!confirm) return;

    await this.dbService.deleteCategory(category.id);
    await this.loadCategories();
  }

  async exportData() {
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
    a.download = `money-manager-export-${format(
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

  goBack() {
    this.router.navigate(['/']);
  }
}
