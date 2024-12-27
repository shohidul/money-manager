import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DbService } from '../../services/db.service';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { CategoriesCardComponent } from './components/categories-card.component';
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { CategoryService } from '../../services/category.service';
import { FeatureFlagService } from '../../services/feature-flag.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent,
    CategoriesCardComponent,
    TranslatePipe
  ],
  template: `
    <div class="categories">
      <app-mobile-header
        [title]="'categories.title' | translate"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-categories-card
          [categoriesExpnse]="categoriesExpnse"
          [categoriesIncome]="categoriesIncome"
          (categoryDrop)="onCategoryDrop($event)"
          (deleteCategory)="deleteCategory($event)"
          (resetOrder)="resetCategoryOrder($event)"
          (reloadCategories)="reloadCategories()"
        />
      </div>
    </div>
  `,
  styles: [
    `
    .categories {
      max-width: 800px;
      margin: 0 auto;
    }
    .content {
      padding: 1rem;
    }
  `,
  ],
})

export class CategoriesComponent implements OnInit {
  categoriesExpnse: any[] = [];
  categoriesIncome: any[] = [];
  isAdvancedMode = false;

  constructor(
    private router: Router,
    private dbService: DbService,
    private categoryService: CategoryService,
    private translate: TranslatePipe,
    private featureFlagService: FeatureFlagService
  ) {}

  async ngOnInit() {
    // Initialize default categories first
    await this.categoryService.initializeDefaultCategories();

    // Load the categories after initialization
    await this.loadCategoriesExpense();
    await this.loadCategoriesIncome();

    this.featureFlagService.getAppMode().subscribe(
      isAdvanced => this.isAdvancedMode = isAdvanced
    );
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
  
  reloadCategories() {
    this.categoryService.clearCategoriesCache();
    this.loadCategoriesExpense();
    this.loadCategoriesIncome();
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

  toggleAppMode(event: any) {
    this.featureFlagService.setAppMode(event.target.checked);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
