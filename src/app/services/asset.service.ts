import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { AssetTransaction, isAssetTransaction } from '../models/transaction-types';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private assetNamesCache: string[] = [];
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private dbService: DbService) {}

  async getAssetSuggestions(query: string): Promise<string[]> {
    await this.updateAssetNamesCache();
    query = query.toLowerCase();
    return this.assetNamesCache
      .filter(name => name.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 suggestions
  }

  private async updateAssetNamesCache() {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.CACHE_DURATION && this.assetNamesCache.length > 0) {
      return;
    }

    // Get transactions from the last year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    const transactions = await this.dbService.getTransactions(startDate, endDate);
    
    // Extract unique asset names
    this.assetNamesCache = Array.from(new Set(
      transactions
        .filter(isAssetTransaction)
        .map(tx => tx.assetName)
        .filter(name => name && name.trim() !== '')
    )).sort();

    this.lastUpdateTime = now;
  }

  async getParentAssets(): Promise<AssetTransaction[]> {
    try {
      let start: Date;
      let end: Date;

      start = new Date(0);
      end = new Date();

      const transactions = await this.dbService.getTransactions(start, end);
      
      // Filter using the type guard and ensure all required fields are present
      const parentAssets = transactions
      .filter(isAssetTransaction)
      .filter(tx => tx.type === 'expense');
      
      return parentAssets;
    } catch (error) {
      console.error('Error fetching parent assets:', error);
      throw error;
    }
  }
}
