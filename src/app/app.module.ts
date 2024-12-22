import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TranslatePipe } from './components/shared/translate.pipe';
import { TranslateDatePipe } from './components/shared/translate-date.pipe';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslatePipe, // Importing TranslatePipe as a standalone pipe
    TranslateDatePipe // Importing TranslateDatePipe as a standalone pipe
  ],
  providers: [TranslatePipe, TranslateDatePipe]
})
export class AppModule { }
