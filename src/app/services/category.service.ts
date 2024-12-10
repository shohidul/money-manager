import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { defaultCategories } from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

    for (const category of defaultCategories) {
      const exists = existingCategories.some(
        c =>
          c.icon === category.icon &&
          c.type === category.type &&
          c.subType === category.subType &&
          c.isCustom === false
      );

      if (!exists) {
        await this.dbService.addCategory({
          name: category.name,
          icon: category.icon,
          type: category.type,
          subType: category.subType,
          isCustom: false
        });
      }
    }
  }

  async getAllCategories() {
    return await this.dbService.getCategories();
  }
}