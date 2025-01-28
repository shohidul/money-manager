import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, DbService } from '../../../services/db.service';
import { ChartService } from '../../../services/chart.service';
import { MonthPickerComponent } from '../../../components/month-picker/month-picker.component';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { MobileHeaderComponent } from '../../../components/mobile-header/mobile-header.component';
import { ChangeDetectorRef } from '@angular/core';
import {
  Transaction,
  isFuelTransaction,
  isLoanTransaction,
  isAssetTransaction,
  FuelTransaction,
  isRepaidTransaction,
} from '../../../models/transaction-types';
import { calculateMileage } from '../../../utils/fuel.utils';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateDatePipe } from "../../../components/shared/translate-date.pipe";
import { TranslateNumberPipe } from "../../../components/shared/translate-number.pipe";
import { FeatureFlagService } from '../../../services/feature-flag.service';
import { TranslationService } from '../../../services/translation.service';
import { LoanTransaction } from '../../../models/loan.model';
import { LoanService } from '../../../services/loan.service';
import { AssetGroup } from './asset-list.component';

type ChartType = 'income' | 'expense';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MobileHeaderComponent,
    MonthPickerComponent,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
],
  template: `
    <div class="charts">
      <!-- <app-mobile-header
        [title]="'charts.title' | translate"
        [showBackButton]="true"
        (back)="goBack()"
      /> -->

      <div class="content">
          <div class="asset-group">
            <button class="back-button" (click)="goBack()">
              <span class="material-icons">arrow_back_ios</span>
            </button>
            <div class="asset-header">
              <span class="material-symbols-rounded" [class]="assetGroup!.type">{{ getCategoryIcon(assetGroup!.categoryId) }}</span>
              <div class="asset-details">
                <span class="asset-name">{{ getCategoryName(assetGroup!.categoryId) | translate }}</span>
                <span class="small-text">
                  {{ assetGroup!.assetName | translate }} | 
                  {{ assetGroup!.quantity | translateNumber:'1.0-2' }} {{ assetGroup!.measurementUnit | translate }} | 
                  {{ 'asset.value' | translate }}: {{ assetGroup!.value | translateNumber:'1.0-2' }}
                </span>
              </div>
            </div>
          </div>
          <div class="chart-container card">
            <div class="chart-wrapper">
              <canvas #donutChart></canvas>
            </div>
            <div class="legend">
            @for (stat of categoryTypeStats; track stat.type) {
              <div class="legend-item">
                <div class="legend-color" [style.background-color]="stat.color"></div>
                <div class="legend-info">
                  <span class="category-name">
                    {{ 'charts.types.' + stat.type  | translate }} <span class="percentage text-muted text-sm">{{ stat.percentage | translateNumber:'1.1-1' }}%</span>
                  </span>
                </div>
                <span class="percentage">{{ stat.amount | translateNumber:'1.0-2' }}</span>
              </div>
            }
          </div>
        </div>
        <div class="filters">
          <!-- <app-month-picker
            [currentMonth]="currentMonth"
            (monthChange)="onMonthChange($event)"
          /> -->
          <div class="filter-buttons">
            <button 
              *ngFor="let type of chartTypes"
              [class.active]="selectedType === type"
              (click)="setType(type)"
            >
              {{ 'charts.types.' + type | translate }}
            </button>
          </div>
        </div>
        <div *ngFor="let group of transactionGroups"  class="transactions-by-category card">
        <!-- <span>{{ 'charts.types.' + selectedType | translate }} {{ 'charts.list' | translate }}</span> -->
          <div class="date-header">
            <span>{{ group.month }} {{ group.year }}</span>
            <span class="total">
              <span *ngIf="group.totalIncome > 0">{{ 'dashboard.income' | translate }}: {{ group.totalIncome | translateNumber:'1.0-2' }}</span>
              <span *ngIf="group.totalExpense > 0">{{ 'dashboard.expense' | translate }}: {{ (group.totalExpense) | translateNumber:'1.0-2' }}</span>
            </span>
          </div>
          <!-- @for (tx of group.transactions; track tx.id) {
              <div class="transaction-item">
                  <span class="material-symbols-rounded" [class]="tx.type">{{ getCategoryIcon(tx.categoryId) }}</span>
                  <div class="transaction-details">
                    <span class="small-text">
                        {{ tx.date | translateDate: 'short' }}
                      </span>                      
                    <span>
                      {{ getCategoryName(tx.categoryId) | translate  }} 
                      <span class="percentage text-sm ml-4 text-muted">{{ getTxPercentage(tx) | translateNumber:'1.1-1' }}%</span>
                    </span> 
                    <span class="small-text">
                        {{ tx.memo || ('common.noMemo' | translate) }} 
                      </span>                          
                  </div>
                <span class="amount">
                  {{ tx.amount | translateNumber:'1.0-2' }}
                </span>
            </div>
            } -->
            @for (stat of categoryStats(group.transactions); track stat.categoryId) {
            <div class="category-details">
              <div class="category-header" (click)="toggleCategory(stat.categoryId)">
                <div class="category-info">
                  <span class="material-symbols-rounded" [class]="stat.type">{{ getCategoryIcon(stat.categoryId) }}</span>
                  <span>
                    {{ stat.category | translate  }} 
                    <span class="percentage text-sm ml-4 text-muted">{{ stat.percentage | translateNumber:'1.1-1' }}%</span>
                  </span> 
                </div>
                <span class="amount">
                  {{ stat.amount | translateNumber:'1.0-0' }}
                  <span class="small-text" *ngIf="stat.loanCharges > 0">
                    {{ 'loan.loanCharges' | translate }}: {{stat.type === 'expense' ? '+' : '-'}}{{ stat.loanCharges | translateNumber:'1.0-2' }}
                  </span>
                </span>
              </div>
              @if (categoryBudgets.length > 0) {
                @if (getBudgetForCategory(stat.categoryId)?.budget) {
                  <div class="budget-progress">
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar" 
                        [class.danger]="is100PercentOver(stat.categoryId) && !isTypeIncomeOrAsset(stat.categoryId)"
                        [style.width.%]="calculateBudgetPercentage(stat.categoryId)"
                      ></div>
                    </div>
                    <span class="budget-text">
                      <span *ngIf="isTypeIncomeOrAsset(stat.categoryId)">{{(
                        is25Percent(stat.categoryId) ? 'charts.goal25Percent' : 
                        is50Percent(stat.categoryId) ? 'charts.goal50Percent': 
                        is75Percent(stat.categoryId) ? 'charts.goal75Percent' : 
                        is100Percent(stat.categoryId) ? 'charts.goal100Percent' : 'charts.goalKeepItUp') | translate}}</span>
                      <!-- <span *ngIf="!isTypeIncomeOrAsset(stat.categoryId)">{{(is75Percent(stat.categoryId) ? 'charts.nearBudget' : is100Percent(stat.categoryId) ? 'charts.budgetReached' : is100PercentOver(stat.categoryId) ? 'charts.overBudget' : 'charts.inBudget') | translate}}</span> -->
                      <span>{{ getBudgetForCategory(stat.categoryId)?.spent | translateNumber:'1.0-2'}} / {{ getBudgetForCategory(stat.categoryId)?.budget  | translateNumber:'1.0-2'}}</span>
                    </span>
                  </div>
                }
              }
              @if (expandedCategories.includes(stat.categoryId)) {
                <div class="category-transactions">
                  <canvas [id]="'chart-' + stat.categoryId"></canvas>
                  <div class="transaction-list">
                    @for (tx of getTransactionsByCategory(stat.categoryId); let i = $index; track tx.id) {
                      <div class="transaction-item">
                        <span class="material-symbols-rounded" [class]="tx.type">
                          {{ getCategoryIcon(tx.categoryId) }}
                        </span>
                        <div class="transaction-details">
                          <span class="small-text">{{ tx.date | translateDate: 'short' }}</span>
                          <span class="memo">
                            {{ (stat.category | translate) }}
                            <span class="percentage text-sm ml-4 text-muted">{{ (tx.amount / stat.amount) * 100 | translateNumber:'1.1-1' }}%</span>
                          </span>
                              <span class="small-text">
                                {{ tx.memo || ('common.noMemo' | translate) }} 
                              </span>
                        </div>
                        <span class="amount">
                          {{ tx.amount | translateNumber:'1.0-2' }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
          </div>        
      </div>
    </div>
  `,

  styles: [
    `
  .charts {
    max-width: 800px;
    margin: 0 auto;
  }

  .content {
    padding: 1rem;
  }

  .back-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
  }

  .back-button:hover{
    background-color: var(--background-color-hover);
  }

  .date-header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    border-bottom: 1px solid var(--background-color);
  }

  .asset-group {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-color);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 4px var(--box-shadow-color-light);
    cursor: pointer;
  }

  .asset-header {
    display: flex;
    align-items: center;
  }

  .asset-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .asset-name {
    font-weight: 500;
  }

  .small-text {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .filters {
    margin-bottom: 1rem;
  }

  .filter-buttons {
    display: flex;
    background-color: var(--surface-color);
    box-shadow: 0 2px 4px var(--box-shadow-color-light);
  }

  .filter-buttons button {
    flex: 1;
    padding: 1rem;
    border-bottom: 5px solid var(--background-color-hover);
    background: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-buttons button.active {
    border-bottom: 5px solid var(--primary-color);
  }

  .chart-container {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .chart-wrapper {
    flex: 1;
    max-width: 35%;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .chart-container {
      flex-direction: row;
      align-items: normal;
    }

    .chart-wrapper {
      max-width: 35%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
    }
  }

  .legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 280px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .legend-item:hover {
    background-color: var(--background-color-hover);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .category-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .percentage {
    min-width: 48px;
    text-align: right;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .legend {
      justify-content: center;
      min-width: 175px;
    }

    .legend-item {
      padding: 0;
    }

    .legend-color {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }

    .category-name,
    .percentage {
      font-size: 0.675rem;
    }

    .category-name .material-symbols-rounded {
      display: none;
    }
  }

  .category-details {
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-transactions {
    padding: 1rem;
  }

  .transaction-list {
    margin-top: 1rem;
  }

  .transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.1rem 0.5rem 0.8rem 0.5rem;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f5f5f5;
    font-size: 0.875rem;
  }

  .transaction-details {
    flex: 1;
  }

  .transaction-details .small-text {
    display: block;
    font-size: 0.65rem;
    color: #999;
    margin-top: 0.25rem;
  }

  .amount {
    text-align: right;
    font-weight: 500;
  }

  .amount .small-text {
    display: block;
    font-size: 0.65rem;
    color: #999;
  }
  
  .budget-progress {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  
  .progress-bar-container {
    background: var(--background-color);
    overflow: hidden;
    position: relative;
    flex: 3;
    height: 3px;
    border-radius: 3px;
  }

  .progress-bar {
    height: 100%;
    background: var(--text-success);
    transition: width 0.3s ease;
  }
  
  .progress-bar.warning {
    background: var(--warning-color);
  }
  
  .progress-bar.danger {
    background: var(--danger-color);
  }

  .budget-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
    display: contents;
    flex: 1;
  }
  
`,
  ],
})
export class AssetDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart', { static: false })
  private donutChartRef!: ElementRef;

  assetGroup: AssetGroup | null = null;

  isFuelTransaction = isFuelTransaction;
  isLoanTransaction = isLoanTransaction;
  isRepaidTransaction = isRepaidTransaction;
  isAssetTransaction = isAssetTransaction;
  calculateMileage = calculateMileage;
  parentLoanTransactions: LoanTransaction[] = [];

  currentMonth = format(new Date(), 'yyyy-MM');
  selectedType: ChartType = 'expense';
  chartTypes: ChartType[] = ['expense', 'income'];
  transactions: Transaction[] = [];
  categories: any[] = [];
  categoryTypeStats: any[] = [];
  expandedCategories: number[] = [];
  chartColors = [
    '#f44336',
    '#4CAF50'
  ];

  transactionGroups: any[] = [];
  
  isAdvancedMode: boolean = false;
  categoryBudgets: Array<{
    category: Category;
    spent: number;
    budget: number;
  }> = [];

  chart: any;

  constructor(
    private dbService: DbService,
    private chartService: ChartService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private loanService: LoanService, 
    private featureFlagService: FeatureFlagService,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    this.featureFlagService.getAppMode().subscribe(
      isAdvanced => this.isAdvancedMode = isAdvanced
    );

    const params = this.activatedRoute.snapshot.queryParams;
    if (params['group']) {
       this.assetGroup = JSON.parse(params['group']);
      console.log(this.assetGroup);
    }

    await this.loadData();
    await this.loadCategoryBudgets();
  }

  ngAfterViewInit() {
    this.createDonutChart();
  }


  async loadData() {
    // const date = new Date(this.currentMonth);
    // const startDate = startOfMonth(date);
    // const endDate = endOfMonth(date);
    // this.transactions = await this.dbService.getTransactions(
    //   startDate,
    //   endDate
    // );

    this.transactions = this.assetGroup?.transactions || [];

    this.categories = await this.dbService.getCategories();
    this.groupTransactions();
    this.calculateTypeStats();
    this.createDonutChart();
  }

  getTransactions(){
    return this.assetGroup?.transactions.filter(tx => tx.type === this.selectedType) || [];
  }

  groupTransactions() {
    const groups = new Map();

    this.getTransactions().forEach((transaction) => {
      const date = new Date(transaction.date);
      const yearMonthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM

      if (!groups.has(yearMonthKey)) {
        groups.set(yearMonthKey, {
          month: date.toLocaleString('default', { month: 'short' }), // Get the month name
          year: date.getFullYear(),
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
        });
      }

      console.log(transaction);
      const group = groups.get(yearMonthKey);
      group.transactions.push(transaction);

      if (transaction.type === 'income') {
        group.totalIncome += transaction.amount;
      } else {
        group.totalExpense += transaction.amount;
      }
    });

    this.transactionGroups =  Array.from(groups.values()).sort((a, b) => {
      if (a.year === b.year) {
        return a.month.localeCompare(b.month); // Sort by month if years are the same
      }
      return b.year - a.year; // Sort by year
    });
  }

  setType(type: ChartType) {
    this.selectedType = type;
    this.groupTransactions();
    
    this.expandedCategories.forEach(id => this.toggleCategory(id));
    // this.calculateStats();

    // Wait for the DOM update before creating the chart
    // this.cdr.detectChanges();
    // this.createDonutChart();
  }

  async onMonthChange(month: string) {
    this.currentMonth = month;
    this.loadData();
  }

  calculateTypeStats() {
    const stats = new Map<ChartType, any>();
    let totalAmount = 0;

    // const filteredTransactions = this.transactions.filter(
    //   (tx) => tx.type === this.selectedType
    // );

    this.transactions.forEach((tx) => {
      if (!stats.has(tx.type)) {
        const type = tx.type;
        stats.set(type, {
          type: type,
          amount: 0,
          totalAmount: 0,
          color: this.chartColors[stats.size % this.chartColors.length],
        });
      }

      const stat = stats.get(tx.type);
      stat.amount += tx.amount;
      totalAmount += tx.amount;
      stat.totalAmount += tx.amount ;
    });

    this.categoryTypeStats = Array.from(stats.values())
      .map((stat) => ({
        ...stat,
        percentage: (stat.amount / totalAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private createDonutChart() {
    if (!this.donutChartRef) return;

    const canvas = this.donutChartRef.nativeElement as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartService.createDonutChart(
      ctx,
      this.categoryTypeStats,
      this.categoryTypeStats.map((stat) => stat.color)
    );
  }

  getTxPercentage(tx: Transaction): number {
    return tx.amount / this.categoryTypeStats.find((stat) => stat.type === tx.type)?.amount * 100;
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  getTransactionsByCategory(categoryId: number) {
    return this.getTransactions()
      .filter((tx) => tx.categoryId === categoryId)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
  }

  toggleCategory(categoryId: number) {
    const index = this.expandedCategories.indexOf(categoryId);
    if (index === -1) {
      this.expandedCategories.push(categoryId);
      setTimeout(() => this.createCategoryChart(categoryId), 0);
    } else {
      this.expandedCategories.splice(index, 1);
      this.chartService.destroyChart(`chart-${categoryId}`);
    }
  }

  createCategoryChart(categoryId: number) {
    const canvas = document.getElementById(
      `chart-${categoryId}`
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const transactions = this.getTransactionsByCategory(categoryId);
    const tdp = new TranslateDatePipe(this.translationService);
    
    const chartData = {
      labels: transactions.map((tx) => tdp.transform(tx.date, 'MMM d')),
      values: transactions.map((tx) => tx.amount),
    };

    this.chartService.createLineChart(
      canvas,
      chartData,
      this.categoryStats(transactions).find((stat) => stat.categoryId === categoryId)?.color
    );
  }

  goBack() {
    this.router.navigate(['/assets']);
  }


  categoryStats(transactions: Transaction[]): any[] {
    const stats = new Map<number, any>();
    let totalAmount = 0;

    // const filteredTransactions = this.transactions.filter(
    //   (tx) => this.selectedType === 'all' || tx.type === this.selectedType
    // );

    transactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          type: category.type,
          amount: 0,
          totalAmount: 0,
          color: this.chartColors[stats.size % this.chartColors.length],
        });
      }

      const stat = stats.get(tx.categoryId);
      stat.amount += tx.amount;
      totalAmount += tx.amount;
      stat.totalAmount += tx.amount;
    });

    return Array.from(stats.values())
      .map((stat) => ({
        ...stat,
        percentage: (stat.amount / totalAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  isTypeIncomeOrAsset(categoryId: number): boolean{
    const category = this.getBudgetForCategory(categoryId)?.category;
    return category?.subType.includes('asset') || category?.type === 'income';
  }

  getBudgetAndSpent(categoryId: number) {
    const budgetInfo = this.categoryBudgets.find(b => b.category.id === categoryId);
    return {
      spent: budgetInfo?.spent || 0,
      budget: budgetInfo?.budget || 0
    };
  }
  
  is25Percent(categoryId: number): boolean {
    const { spent, budget } = this.getBudgetAndSpent(categoryId);
    return spent >= budget * 0.25 && spent < budget * 0.50;
  }
  
  is50Percent(categoryId: number): boolean {
    const { spent, budget } = this.getBudgetAndSpent(categoryId);
    return spent >= budget * 0.50 && spent < budget * 0.75;
  }
  
  is75Percent(categoryId: number): boolean {
    const { spent, budget } = this.getBudgetAndSpent(categoryId);
    return spent >= budget * 0.75 && spent < budget;
  }
  
  is100Percent(categoryId: number): boolean {
    const { spent, budget } = this.getBudgetAndSpent(categoryId);
    return spent == budget;
  }  
  
  is100PercentOver(categoryId: number): boolean {
    const { spent, budget } = this.getBudgetAndSpent(categoryId);
    return spent > budget;
  }  

  getBudgetForCategory(categoryId: number) {
    const budget = this.categoryBudgets.find((budget) => budget.category.id === categoryId);
    return budget;
  }

  calculateBudgetPercentage(categoryId: number) {
    const budget = this.getBudgetForCategory(categoryId);
    if (!budget || !budget.category || budget.budget == null) {
      return 0;
    }
    const percentage = (budget.spent / budget.budget) * 100;
    return percentage;
  }

  async loadCategoryBudgets() {
    const startDate = startOfMonth(new Date(this.currentMonth));
    const endDate = endOfMonth(startDate);
    const transactions = await this.dbService.getTransactions(startDate, endDate);
    const categories = await this.dbService.getCategories();
    
    // Calculate spent amount for each category
    const spentByCategory = transactions.reduce((acc, tx) => {
      if (tx.type === 'expense' || tx.type === 'income') {
        acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
      }
      return acc;
    }, {} as { [key: number]: number });

    // Get budgets for each category
    const budgetCategories = categories.filter(c => c.type === 'expense' || c.type === 'income');
    this.categoryBudgets = await Promise.all(
      budgetCategories.map(async category => {
        const budget = await this.dbService.getBudgetForDate(category.id!, startDate);
        return {
          category,
          spent: spentByCategory[category.id!] || 0,
          budget
        };
      })
    );
  }
}
