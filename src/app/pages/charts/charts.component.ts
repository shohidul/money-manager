import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Category, DbService } from '../../services/db.service';
import { ChartService } from '../../services/chart.service';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { ChangeDetectorRef } from '@angular/core';
import {
  Transaction,
  isFuelTransaction,
  isLoanTransaction,
  isAssetTransaction,
  FuelTransaction,
  isRepaidTransaction,
} from '../../models/transaction-types';
import { calculateMileage } from '../../utils/fuel.utils';
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { TranslateDatePipe } from "../../components/shared/translate-date.pipe";
import { TranslateNumberPipe } from "../../components/shared/translate-number.pipe";
import { FeatureFlagService } from '../../services/feature-flag.service';
import { TranslationService } from '../../services/translation.service';
import { LoanTransaction } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';

type ChartType = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-charts',
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
      <app-mobile-header
        [title]="'charts.title' | translate"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="filters">
          <app-month-picker
            [currentMonth]="currentMonth"
            (monthChange)="onMonthChange($event)"
          />
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

        
          <div class="chart-container card">
            <div class="chart-wrapper">
              <canvas #donutChart></canvas>
            </div>
            <div class="legend">
            @for (stat of categoryStats.slice(0, 5); track stat.categoryId) {
              <div class="legend-item">
                <div class="legend-color" [style.background-color]="stat.color"></div>
                <div class="legend-info">
                  <span class="category-name">
                    <span class="material-symbols-rounded">{{ getCategoryIcon(stat.categoryId) }}</span>
                    {{ stat.category  | translate }}
                  </span>
                </div>
                <span class="percentage">{{ stat.percentage | translateNumber:'1.1-1' }}%</span>
              </div>
            }
          </div>
        </div>
        <div class="transactions-by-category card">
        <span>{{ 'charts.types.' + selectedType | translate }} {{ 'charts.list' | translate }}</span>
          @for (stat of categoryStats; track stat.categoryId) {
            <div class="category-details">
              <div class="category-header" (click)="toggleCategory(stat.categoryId)">
                <div class="category-info">
                  <span class="material-symbols-rounded" [class]="stat.type">{{ getCategoryIcon(stat.categoryId) }}</span>
                  <span>
                    {{ stat.category | translate  }} 
                    <span class="percentage text-sm ml-4 text-muted">{{ stat.percentage | translateNumber:'1.1-1' }}% {{stat.totalAmount}}</span>
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
                      <span *ngIf="!isTypeIncomeOrAsset(stat.categoryId)">{{(is75Percent(stat.categoryId) ? 'charts.nearBudget' : is100Percent(stat.categoryId) ? 'charts.budgetReached' : is100PercentOver(stat.categoryId) ? 'charts.overBudget' : 'charts.inBudget') | translate}}</span>
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
                          @if (isAdvancedMode) {
                            @if (isAssetTransaction(tx)) {
                              <span class="small-text">
                                {{ tx.assetName || ('common.noName' | translate) }} 
                                {{ tx.quantity | translateNumber:'1.0-3' }} {{ tx.measurementUnit | translate }} |
                                {{ tx.memo || ('common.noMemo' | translate) }} 
                              </span>
                            }

                            @else if (isLoanTransaction(tx)) {
                              <span class="small-text">
                                {{ tx.personName || ('common.noName' | translate) }} | 
                                {{ tx.memo || ('common.noMemo' | translate) }} 
                                {{ 'charts.dueDate' | translate }}: {{ tx.dueDate ? (tx.dueDate | translateDate) : 'N/A' }} |
                                {{ 'loan.status.'+(tx.status || 'remaining')  | translate  }} 
                              </span>
                            }

                            @else if (isRepaidTransaction(tx)) {
                              <span class="small-text">
                                <ng-container *ngIf="getParentLoan(tx.parentId) as parentLoan">
                                  {{ (tx.type === 'income' ? 'loan.lentTo' : 'loan.borrowedFrom') | translate }} {{ parentLoan?.personName ?? ('common.noName' | translate) }} | 
                                  {{ tx.memo || ('common.noMemo' | translate) }} |
                                  {{ parentLoan?.amount ?? 0 | translateNumber }} | 
                                  {{ 'loan.dueDate' | translate }}: 
                                  {{
                                    parentLoan.dueDate 
                                      ? (parentLoan.dueDate | translateDate) 
                                      : 'N/A'
                                  }} |
                                  {{ 'loan.status.'+(parentLoan.status || 'remaining') | translate }}
                                </ng-container>
                              </span>
                            }

                            @else if (isFuelTransaction(tx)) {
                              <span class="small-text">
                                {{ tx.fuelType === undefined
                                  ? ('categories.subTypes.fuel' | translate)
                                  : ('fuel.types.' + tx.fuelType | lowercase | translate) }}
                                {{ tx.fuelQuantity || 0 | translateNumber:'1.1-1' }} {{ 'fuel.L' | translate }} | 
                                {{ tx.odometerReading || 0 | translateNumber:'1.0-0' }} {{ 'fuel.km' | translate }} | 
                                {{ getMileage(tx) || 0 | translateNumber:'1.1-1' }} {{ 'fuel.kmPerLiter' | translate }} |
                                {{ tx.fuelQuantity ? (tx.amount / tx.fuelQuantity) : 0 | translateNumber:'1.1-1' }}/- |
                                {{ tx.memo || ('common.noMemo' | translate) }}
                              </span>
                            }
                            @else {
                              @if(tx.memo) {
                                <span class="small-text">
                                  {{ tx.memo || ('common.noMemo' | translate) }}
                                </span>
                              }
                            }
                          }
                          @else {
                            @if(tx.memo) {
                              <span class="small-text">
                                {{ tx.memo || ('common.noMemo' | translate) }}
                              </span>
                            }
                          }
                        </div>
                        <span class="amount">
                          {{ tx.amount | translateNumber:'1.0-2' }}
                          <span class="small-text" *ngIf="getLoanCharges(tx) && getLoanCharges(tx) > 0">
                            {{ 'loan.loanCharges' | translate }}: {{stat.type === 'expense' ? '+' : '-'}}{{ getLoanCharges(tx) | translateNumber:'1.0-2' }}
                          </span>
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

  .filters {
    margin-bottom: 1rem;
  }

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    background-color: var(--surface-color);
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--box-shadow-color-light);
  }

  .filter-buttons button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    background: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-buttons button.active {
    background-color: var(--primary-color);
    color: white;
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
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart', { static: false })
  private donutChartRef!: ElementRef;

  isFuelTransaction = isFuelTransaction;
  isLoanTransaction = isLoanTransaction;
  isRepaidTransaction = isRepaidTransaction;
  isAssetTransaction = isAssetTransaction;
  calculateMileage = calculateMileage;
  parentLoanTransactions: LoanTransaction[] = [];

  currentMonth = format(new Date(), 'yyyy-MM');
  selectedType: ChartType = 'all';
  chartTypes: ChartType[] = ['all', 'income', 'expense'];
  transactions: Transaction[] = [];
  categories: any[] = [];
  categoryStats: any[] = [];
  expandedCategories: number[] = [];
  chartColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#36A2EB',
  ];
  
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
    private cdr: ChangeDetectorRef,
    private loanService: LoanService, 
    private featureFlagService: FeatureFlagService,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    this.featureFlagService.getAppMode().subscribe(
      isAdvanced => this.isAdvancedMode = isAdvanced
    );

    await this.loadData();
    await this.loadCategoryBudgets();

    this.parentLoanTransactions = await this.loanService.getLoanTransactions();
  }

  ngAfterViewInit() {
    this.createDonutChart();
  }

  getParentLoan(id: number | undefined): LoanTransaction | null {
    try {
      const transactions = this.parentLoanTransactions;
      const parentLoan = transactions.find(tx => tx.id === id);
      
      if (!parentLoan) {
        return null;
      }
      
      return parentLoan;
    } catch (error) {
      console.error('Error fetching parent loan:', error);
      throw error;
    }
  }

  async loadData() {
    const date = new Date(this.currentMonth);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    this.transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    this.categories = await this.dbService.getCategories();
    this.calculateStats();
    this.createDonutChart();
  }

  setType(type: ChartType) {
    this.selectedType = type;
    this.calculateStats();

    // Wait for the DOM update before creating the chart
    this.cdr.detectChanges();
    this.createDonutChart();
  }

  async onMonthChange(month: string) {
    this.currentMonth = month;
    this.loadData();
    await this.loadCategoryBudgets();

  }

  isLoanChargeable(transaction: Transaction): boolean {
    return isLoanTransaction(transaction) && transaction.type === 'income' || 
    isRepaidTransaction(transaction) && transaction.type === 'expense';
  }

  getLoanCharges(transaction: Transaction): number {
    if (this.isLoanChargeable(transaction)) {
      const tx = transaction as LoanTransaction;
      return tx.loanCharges || 0;
    }
    return 0;
  }

  calculateStats() {
    const stats = new Map<number, any>();
    let totalAmount = 0;

    const filteredTransactions = this.transactions.filter(
      (tx) => this.selectedType === 'all' || tx.type === this.selectedType
    );

    filteredTransactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          type: category.type,
          amount: 0,
          loanCharges: 0,
          totalAmount: 0,
          color: this.chartColors[stats.size % this.chartColors.length],
        });
      }

      const stat = stats.get(tx.categoryId);
      stat.amount += tx.amount;
      stat.loanCharges += this.getLoanCharges(tx);
      totalAmount += tx.amount + (tx.type === 'expense' ? this.getLoanCharges(tx) : (-this.getLoanCharges(tx)));
      stat.totalAmount += tx.amount + (tx.type === 'expense' ? this.getLoanCharges(tx) : (-this.getLoanCharges(tx)));
    });

    this.categoryStats = Array.from(stats.values())
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
      this.categoryStats.slice(0, 5),
      this.categoryStats.map((stat) => stat.color)
    );
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getTransactionsByCategory(categoryId: number) {
    return this.transactions
      .filter((tx) => tx.categoryId === categoryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
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
      this.categoryStats.find((stat) => stat.categoryId === categoryId)?.color
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getMileage(tx: FuelTransaction): number | undefined {
    const previousTransaction = this.getPreviousFuelTransaction(tx);
    if (!previousTransaction) return undefined;
    return calculateMileage(tx, previousTransaction);
  }

  getPreviousFuelTransaction(tx: FuelTransaction): FuelTransaction | undefined {
    const fuelTransactions = this.transactions.filter(isFuelTransaction);
    const index = fuelTransactions.findIndex((t) => t.id === tx.id);
    if (index === 0) return undefined;
    return fuelTransactions[index - 1];
  }

  isTypeIncomeOrAsset(categoryId: number): boolean{
    const category = this.getBudgetForCategory(categoryId)?.category;
    return category?.subType === 'asset' || category?.type === 'income';
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
