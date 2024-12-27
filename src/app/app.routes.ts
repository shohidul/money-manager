import { Routes } from '@angular/router';
import { pinGuard } from './guards/pin.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [pinGuard],
    children: [
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
        path: 'add-category',
        loadComponent: () => 
          import('./pages/add-category/add-category.component').then(m => m.AddCategoryComponent)
      },
      {
        path: 'charts',
        loadComponent: () => 
          import('./pages/charts/charts.component').then(m => m.ChartsComponent)
      },
      {
        path: 'fuel',
        loadComponent: () => 
          import('./pages/fuel/fuel.component').then(m => m.FuelComponent)
      },
      {
        path: 'loans',
        loadComponent: () => 
          import('./pages/loans/loans.component').then(m => m.LoansComponent)
      },
      {
        path: 'assets',
        loadComponent: () => 
          import('./pages/assets/assets.component').then(m => m.AssetsComponent)
      },
      {
        path: 'export',
        loadComponent: () => 
          import('./pages/export/export.component').then(m => m.ExportComponent)
      },
      {
        path: 'categories',
        loadComponent: () => 
          import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => 
          import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'tutorial',
        loadComponent: () => 
          import('./pages/tutorial/tutorial.component').then(m => m.TutorialComponent)
      },
      {
        path: 'about',
        loadComponent: () => 
          import('./pages/about/about.component').then(m => m.AboutComponent)
      },
    ]
  },
  {
    path: 'pin',
    loadComponent: () => 
      import('./pages/pin/pin.component').then(m => m.PinComponent)
  },
    // Fallback route for undefined paths, redirects to the home page
  {
    path: '**',
    redirectTo: ''  // Redirecting to the home page (index)
  }
];