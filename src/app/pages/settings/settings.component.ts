import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DbService } from '../../services/db.service';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { SecurityCardComponent } from './components/security-card.component';
import { CategoriesCardComponent } from './components/categories-card.component';
import { DataManagementCardComponent } from './components/data-management-card.component';
import { LanguageCardComponent } from './components/language-card.component';
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { format } from 'date-fns';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent,
    SecurityCardComponent,
    CategoriesCardComponent,
    DataManagementCardComponent,
    LanguageCardComponent,
    TranslatePipe,
  ],
  template: `
    <div class="settings">
      <app-mobile-header
        [title]="'settings.title' | translate"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-language-card />
        
        <app-security-card />
        
        <app-categories-card
          [categoriesExpnse]="categoriesExpnse"
          [categoriesIncome]="categoriesIncome"
          (categoryDrop)="onCategoryDrop($event)"
          (deleteCategory)="deleteCategory($event)"
          (resetOrder)="resetCategoryOrder($event)"
        />

        <app-data-management-card
          (backup)="backupData()"
          (clear)="clearData()"
          (restore)="restoreData()"
        />
      </div>
    </div>
  `,
  styles: [
    `
    .settings {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }
  `,
  ],
})

export class SettingsComponent implements OnInit {
  categoriesExpnse: any[] = [];
  categoriesIncome: any[] = [];

  constructor(
    private dbService: DbService,
    private categoryService: CategoryService,
    private router: Router,
    private translate: TranslatePipe
  ) {}

  async ngOnInit() {
    // Initialize default categories first
    await this.categoryService.initializeDefaultCategories();

    // Load the categories after initialization
    await this.loadCategoriesExpense();
    await this.loadCategoriesIncome();
  }

  async loadCategoriesExpense() {
    this.categoriesExpnse = await this.categoryService.getCategoriesByType(
      'expense'
    );
  }
  async loadCategoriesIncome() {
    this.categoriesIncome = await this.categoryService.getCategoriesByType(
      'income'
    );
  }

  async deleteCategory(category: any) {
    const confirm = window.confirm(
      this.translate.transform('settings.deleteCategory', [category.name])
    );
    if (!confirm) return;

    // Delete the category from the database
    await this.dbService.deleteCategory(category.id);

    if (category.type === 'expense') {
      // Remove the category from the local list
      this.categoriesExpnse = this.categoriesExpnse.filter(
        (cat) => cat.id !== category.id
      );
      // Reorder the remaining categories
      this.categoriesExpnse.forEach((cat, index) => {
        cat.order = index + 1;
      });
  
      // Update the order in the database
      await this.dbService.updateCategoryOrder(this.categoriesExpnse);

      // Reload the categories (if needed)
      await this.loadCategoriesExpense();

    }else if(category.type === 'income') {
      // Remove the category from the local list
      this.categoriesIncome = this.categoriesIncome.filter(
        (cat) => cat.id !== category.id
      );
      // Reorder the remaining categories
      this.categoriesIncome.forEach((cat, index) => {
        cat.order = index + 1;
      });
  
      // Update the order in the database
      await this.dbService.updateCategoryOrder(this.categoriesIncome);

      // Reload the categories (if needed)
      await this.loadCategoriesIncome();
    }
  }

  async onCategoryDrop(event: CdkDragDrop<any[]>) {
    // Get the category type from the modified event
    const currentType = (event as any).categoryType;

    // Select the appropriate categories based on type
    const typedCategories = currentType === 'expense' 
      ? this.categoriesExpnse 
      : this.categoriesIncome;

    // Get the `order` of the dragged item
    const oldOrderNum =
      Number(event.item.element.nativeElement.children[0].textContent) - 1;

    // Calculate the difference and new order
    const difference = event.previousIndex - event.currentIndex;
    const newOrderNum = oldOrderNum - difference;

    // Use `moveItemInArray` to rearrange the categories array
    moveItemInArray(typedCategories, oldOrderNum, newOrderNum);

    // Update the `order` property for all categories
    typedCategories.forEach((category, index) => {
      category.order = index + 1;
    });

    // Save the updated order to the database
    await this.dbService.updateCategoryOrder(typedCategories);
  }

  async backupData() {
    const startDate = new Date(0);
    const endDate = new Date();

    const transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    const categories = await this.dbService.getCategories();

    const data = { transactions, categories };
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
      this.translate.transform('settings.clearData')
    );
    if (!confirm) return;

    await this.dbService.clearAllData();
    await this.categoryService.initializeDefaultCategories();
    await this.loadCategoriesExpense();
    await this.loadCategoriesIncome();
    alert(this.translate.transform('settings.dataCleared'));
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
          await this.dbService.clearAllData();
          await this.dbService.restoreData(data);
          await this.loadCategoriesExpense();
          await this.loadCategoriesIncome();
          alert(this.translate.transform('settings.dataRestored'));
        } else {
          alert(this.translate.transform('settings.invalidDataFormat'));
        }
      } catch (error) {
        alert(this.translate.transform('settings.failedToParseFile'));
      }
    };
    fileInput.click();
  }

  async resetCategoryOrder(type: 'expense' | 'income') {
    // Reset the order for the specified type
    const updatedCategories = await this.dbService.resetCategoryOrder(type);

    // Update the corresponding category list
    if (type === 'expense') {
      this.categoriesExpnse = updatedCategories;
    } else {
      this.categoriesIncome = updatedCategories;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
