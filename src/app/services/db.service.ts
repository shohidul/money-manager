import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MoneyManagerDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': Date };
  };
  categories: {
    key: number;
    value: Category;
  };
}

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  categoryId: number;
  memo: string;
  date: Date;
}

export interface Category {
  id?: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  isCustom: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db!: IDBPDatabase<MoneyManagerDB>;
  private readonly DB_NAME = 'money-manager-db';
  private readonly VERSION = 1;

  async initializeDB() {
    this.db = await openDB<MoneyManagerDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        const txStore = db.createObjectStore('transactions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        txStore.createIndex('by-date', 'date');

        const categoryStore = db.createObjectStore('categories', {
          keyPath: 'id',
          autoIncrement: true,
        });

        // Add default categories
        const defaultCategories: Omit<Category, 'id'>[] = [
          { name: 'Salary', icon: 'payments', type: 'income', isCustom: false },
          {
            name: 'Food',
            icon: 'restaurant',
            type: 'expense',
            isCustom: false,
          },
          {
            name: 'Transport',
            icon: 'directions_car',
            type: 'expense',
            isCustom: false,
          },
          {
            name: 'Shopping',
            icon: 'shopping_cart',
            type: 'expense',
            isCustom: false,
          },
          {
            name: 'Entertainment',
            icon: 'movie',
            type: 'expense',
            isCustom: false,
          },
        ];

        defaultCategories.forEach((category) => {
          categoryStore.add(category);
        });
      },
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    return this.db.add('transactions', transaction);
  }

  async getTransactions(startDate: Date, endDate: Date) {
    const index = this.db.transaction('transactions').store.index('by-date');
    return index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  async addCategory(category: Omit<Category, 'id'>) {
    return this.db.add('categories', category);
  }

  async getCategories() {
    return this.db.getAll('categories');
  }

  async updateTransaction(transaction: Transaction) {
    return this.db.put('transactions', transaction);
  }

  async deleteTransaction(id: number) {
    return this.db.delete('transactions', id);
  }

  async updateCategory(category: Category) {
    return this.db.put('categories', category);
  }

  async deleteCategory(id: number) {
    return this.db.delete('categories', id);
  }
}
