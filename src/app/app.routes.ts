import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'add-transaction',
    loadComponent: () => 
      import('./pages/add-transaction/add-transaction.component').then(m => m.AddTransactionComponent)
  },
  {
    path: 'charts',
    loadComponent: () => 
      import('./pages/charts/charts.component').then(m => m.ChartsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => 
      import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  }
];