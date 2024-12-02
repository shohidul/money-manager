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
  order?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db!: IDBPDatabase<MoneyManagerDB>;
  private readonly DB_NAME = 'money-manager-db';
  private readonly VERSION = 2;

  async initializeDB() {
    this.db = await openDB<MoneyManagerDB>(this.DB_NAME, this.VERSION, {
      upgrade(db, oldVersion, newVersion) {
        if (oldVersion < 1) {
          const txStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          txStore.createIndex('by-date', 'date');

          const categoryStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
        
        if (oldVersion < 2) {
          const categoryStore = db.transaction('categories', 'readwrite').objectStore('categories');
          categoryStore.openCursor().then(function addOrder(cursor): Promise<void> | undefined {
            if (!cursor) return; // If no cursor, exit function
            const category = cursor.value;
            category.order = cursor.key;
            categoryStore.put(category);
            return cursor.continue().then(addOrder); // Continue to the next cursor
          });
        }

      },
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    return this.db.add('transactions', transaction);
  }

  async updateTransaction(transaction: Transaction) {
    return this.db.put('transactions', transaction);
  }

  async deleteTransaction(id: number) {
    return this.db.delete('transactions', id);
  }

  async getTransactions(startDate: Date, endDate: Date) {
    const index = this.db.transaction('transactions').store.index('by-date');
    return index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  async getTransaction(id: number) {
    return this.db.get('transactions', id);
  }

  async addCategory(category: Omit<Category, 'id'>) {
    const categories = await this.getCategories();
    const maxOrder = Math.max(...categories.map(c => c.order || 0), 0);
    return this.db.add('categories', { ...category, order: maxOrder + 1 });
  }

  async getCategories() {
    const categories = await this.db.getAll('categories');
    return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async updateCategory(category: Category) {
    return this.db.put('categories', category);
  }

  async updateCategoryOrder(categories: Category[]) {
    const tx = this.db.transaction('categories', 'readwrite');
    await Promise.all(
      categories.map((category, index) => 
        tx.store.put({ ...category, order: index })
      )
    );
    await tx.done;
  }

  async deleteCategory(id: number) {
    return this.db.delete('categories', id);
  }

  async clearAllData() {
    const transaction = this.db.transaction(
      ['categories', 'transactions'],
      'readwrite'
    );
    await transaction.objectStore('transactions').clear();
    const categoryStore = transaction.objectStore('categories');
    const allCategories = await categoryStore.getAll();
    const customCategories = allCategories.filter(
      (category) => category.isCustom
    );
    for (const customCategory of customCategories) {
      await categoryStore.delete(customCategory.id as number);
    }
    await transaction.done;
  }

  async restoreData(data: {
    transactions: Transaction[];
    categories: Category[];
  }) {
    const { transactions, categories } = data;
    const tx = this.db.transaction(['categories', 'transactions'], 'readwrite');
    
    try {
      for (const category of categories) {
        await tx.objectStore('categories').put(category);
      }

      for (const txn of transactions) {
        const newTransaction = { 
          ...txn,
          date: new Date(txn.date)
        };
        delete newTransaction.id;
        await tx.objectStore('transactions').add(newTransaction);
      }

      await tx.done;
    } catch (error) {
      console.error('Error during restore:', error);
      throw error;
    }
  }
}