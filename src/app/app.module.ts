import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TranslatePipe } from './components/shared/translate.pipe';
import { TranslateDatePipe } from './components/shared/translate-date.pipe';
import { ThemeService } from './services/theme.service';
import { TranslateNumberPipe } from './components/shared/translate-number.pipe';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
  ],
  providers: [
    TranslatePipe, 
    TranslateDatePipe,
    TranslateNumberPipe,
    ThemeService
  ]
})
export class AppModule { }
