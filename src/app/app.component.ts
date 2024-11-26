import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DbService } from './services/db.service';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideMenuComponent],
  template: `
    <div class="app-container">
      <app-side-menu />
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
    }
    
    main {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.dbService.initializeDB();
  }
}