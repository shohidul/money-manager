import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../services/db.service';
import { utils, write } from 'xlsx';
import { format, parse } from 'date-fns';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileHeaderComponent],
  template: `
    <div class="export">
      <app-mobile-header
        title="Export"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="card">
          <h3>Transactions</h3>
          <div class="date-range">
            <div class="form-group">
              <label for="startDate">Start Date</label>
              <input 
                type="date" 
                id="startDate"
                [(ngModel)]="startDate"
                [max]="today"
              >
            </div>
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input 
                type="date" 
                id="endDate"
                [(ngModel)]="endDate"
                [max]="today"
              >
            </div>
          </div>

          <div class="format-selection">
            <label>Export Format:</label>
            <div class="format-buttons">
              <button 
                [class.active]="format === 'xlsx'"
                (click)="format = 'xlsx'"
              >
                Excel (XLSX)
              </button>
              <button 
                [class.active]="format === 'csv'"
                (click)="format = 'csv'"
              >
                CSV
              </button>
            </div>
          </div>

          <button class="export-button" (click)="exportData()">
            <span class="material-icons">download</span>
            Export Data
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .export {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .date-range {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group input {
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }

    .format-selection {
      margin-bottom: 1.5rem;
    }

    .format-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .format-buttons button {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      background: none;
      cursor: pointer;
    }

    .format-buttons button.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .export-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }

    .export-button:hover {
      opacity: 0.9;
    }
  `]
})
export class ExportComponent {
  startDate = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
  endDate = format(new Date(), 'yyyy-MM-dd');
  today = format(new Date(), 'yyyy-MM-dd');
  format: 'xlsx' | 'csv' = 'xlsx';

  constructor(
    private dbService: DbService,
    private router: Router
  ) {}

  async exportData() {
    const start = parse(this.startDate, 'yyyy-MM-dd', new Date());
    const end = parse(this.endDate, 'yyyy-MM-dd', new Date());

    if (start > end) {
      alert('Start date cannot be after end date');
      return;
    }

    const transactions = await this.dbService.getTransactions(start, end);
    const categories = await this.dbService.getCategories();

    const data = transactions.map(tx => ({
      Date: format(tx.date, 'yyyy-MM-dd'),
      Time: format(tx.date, 'HH:mm'),
      Type: tx.type,
      Category: categories.find(c => c.id === tx.categoryId)?.name || 'Unknown',
      Amount: tx.amount,
      Memo: tx.memo
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Transactions');

    const fileName = `money-manager-export-${format(new Date(), 'yyyy-MM-dd')}`;

    if (this.format === 'xlsx') {
      const buffer = write(wb, { bookType: 'xlsx', type: 'array' });
      this.downloadFile(buffer, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      const csv = utils.sheet_to_csv(ws);
      this.downloadFile(csv, `${fileName}.csv`, 'text/csv');
    }
  }

  private downloadFile(content: any, fileName: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}