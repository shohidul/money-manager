import { Injectable } from '@angular/core';
import { Category, DbService } from './db.service';
import { defaultCategories, CATEGORIES_VERSION} from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesCache: Category[] | null = null;

  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

      // Migration: Convert subType from string to array if necessary
    for (const category of existingCategories) {
      if (typeof category.subType === 'string') {
        category.subType = [category.subType];
        await this.dbService.updateCategory(category);
      }
    }
  
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
  
    let isNewAddedOrDeleted = false;
    const operations = [];
  
    // Add or update categories
    for (const category of defaultCategoriesWithDetails) {
      const existingCategory = existingCategories.find(c => c.id === category.id);
  
      if (!existingCategory) {
        // Add new category if not found
        operations.push(this.dbService.addCategory(category));
        isNewAddedOrDeleted = true;
      } else {
        // Check for changes in category properties
        const hasChanged =
          existingCategory.name !== category.name ||
          existingCategory.icon !== category.icon ||
          existingCategory.type !== category.type ||
          existingCategory.subType.length !== category.subType.length ||
          !existingCategory.subType.every((value, index) => value === category.subType[index]);
  
        if (hasChanged) {
          console.log('Updating category', category);
          operations.push(this.dbService.updateCategory(category));
          isNewAddedOrDeleted = true;
        }
      }
    }
  
    // Delete categories that are not in default list
    for (const category of existingCategories.filter(c => !c.isCustom)) {
      const exists = defaultCategoriesWithDetails.some(c => c.id === category.id);
  
      if (!exists) {
        console.log('Deleting category', category);
        const children = await this.getTransactionsByCategory(category.id!);
  
        if (children.length > 0) {
          console.log('Category has children, not deleting');
          continue;
        }
        operations.push(this.dbService.deleteCategory(category.id!));
        isNewAddedOrDeleted = true;
      }
    }
  
    // Execute all database operations in parallel
    await Promise.all(operations);
  
    // Clear cache to force reload
    this.clearCategoriesCache();
  
    if (isNewAddedOrDeleted) {
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
    return allCategories.filter(category => category.subType.includes(subType));
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

  async getTransactionsByCategory(categoryId: number) {
    return this.dbService.getTransactionsByCategory(categoryId);
  }

  // Add a method to explicitly clear the cache
  clearCategoriesCache() {
    this.categoriesCache = null;
  }

  async updateCategoryOrder(categories: Category[]) {
    return this.dbService.updateCategoryOrder(categories);
  }
}