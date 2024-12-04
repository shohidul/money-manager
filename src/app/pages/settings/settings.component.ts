import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DbService } from '../../services/db.service';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { SecurityCardComponent } from './components/security-card.component';
import { CategoriesCardComponent } from './components/categories-card.component';
import { DataManagementCardComponent } from './components/data-management-card.component';
import { categoryGroups } from '../../data/category-icons';
import { format } from 'date-fns';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent,
    SecurityCardComponent,
    CategoriesCardComponent,
    DataManagementCardComponent
  ],
  template: `
    <div class="settings">
      <app-mobile-header
        title="Settings"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-security-card />
        
        <app-categories-card
          [categories]="categories"
          (categoryDrop)="onCategoryDrop($event)"
          (deleteCategory)="deleteCategory($event)"
        />

        <app-data-management-card
          (backup)="backupData()"
          (clear)="clearData()"
          (restore)="restoreData()"
        />
      </div>
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
  `]
})
export class SettingsComponent implements OnInit {
  categories: any[] = [];

  constructor(
    private dbService: DbService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.initializeDefaultCategories();
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();
    
    for (const group of categoryGroups) {
      for (const icon of group.icons) {
        const exists = existingCategories.some(
          c => c.icon === icon.icon && c.type === icon.type
        );
        
        if (!exists) {
          await this.dbService.addCategory({
            name: icon.name,
            icon: icon.icon,
            type: icon.type,
            isCustom: false
          });
        }
      }
    }
    
    await this.loadCategories();
  }

  async deleteCategory(category: any) {
    const confirm = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`
    );
    if (!confirm) return;

    await this.dbService.deleteCategory(category.id);
    await this.loadCategories();
  }

  async onCategoryDrop(event: CdkDragDrop<any[]>) {
    const categories = [...this.categories];
    const [removed] = categories.splice(event.previousIndex, 1);
    categories.splice(event.currentIndex, 0, removed);
    
    // Update order numbers
    categories.forEach((category, index) => {
      category.order = index + 1;
    });
    
    await this.dbService.updateCategoryOrder(categories);
    await this.loadCategories();
  }

  async backupData() {
    const startDate = new Date(0);
    const endDate = new Date();

    const transactions = await this.dbService.getTransactions(startDate, endDate);
    const categories = await this.dbService.getCategories();

    const data = { transactions, categories };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `money-manager-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
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