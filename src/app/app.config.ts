import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CategoryService } from './services/category.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    CategoryService, // Ensure the service is provided globally
  ]
};
