import { Injectable } from '@angular/core';
import { Category, DbService } from './db.service';
import { defaultCategories, CATEGORIES_VERSION} from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesCache: Category[] | null = null;

  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

    const defaultCategoriesWithDetails = defaultCategories
    .filter(category => category.version! <= CATEGORIES_VERSION)
    .map((category) => ({
      id: category.order,  // Use order as ID
      name: category.name,
      icon: category.icon,
      type: category.type,
      subType: category.subType,
      isCustom: false,
      order: category.order,
      version: category.version
    }));

    // Sort by order to maintain proper sequence
    defaultCategoriesWithDetails.sort((a, b) => (a.order || 0) - (b.order || 0));

    let isNewAdded = false;

    for (const category of defaultCategoriesWithDetails) {
      const exists = existingCategories.some(
        c => c.id === category.id
      );

      if (!exists) {
        await this.dbService.addCategory(category);
        isNewAdded = true;
      }
    }

    // Clear cache to force reload
    this.clearCategoriesCache();

    if (isNewAdded) {
      // Save the updated order to the database
      await this.updateCategoryOrder(defaultCategoriesWithDetails);
    }
  }

  async getAllCategories() {
    if (this.categoriesCache === null) {
      this.categoriesCache = await this.dbService.getCategories();
    }
    return this.categoriesCache;
  }

  async getCategoriesByType(type: 'expense' | 'income') {
    const allCategories = await this.getAllCategories();
    return allCategories.filter(category => category.type === type);
  }

  async getCategoriesBySubType(subType: 'fuel' | 'asset' | 'loan' | 'repaid' | 'none') {
    const allCategories = await this.getAllCategories();
    return allCategories.filter(category => category.subType === subType);
  }

  async addCategory(category: Omit<Category, 'id'>) {
    // Clear cache to force reload
    this.clearCategoriesCache();
    return this.dbService.addCategory(category);
  }

  async updateCategory(category: Category) {
    // Clear cache to force reload
    this.clearCategoriesCache();
    return this.dbService.updateCategory(category);
  }

  async deleteCategory(id: number) {
    // Clear cache to force reload
    this.clearCategoriesCache();
    return this.dbService.deleteCategory(id);
  }

  // Add a method to explicitly clear the cache
  clearCategoriesCache() {
    this.categoriesCache = null;
  }

  async updateCategoryOrder(categories: Category[]) {
    return this.dbService.updateCategoryOrder(categories);
  }
}