import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DbService } from './services/db.service';
import { MenuService } from './services/menu.service';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SideMenuComponent],
  template: `
    <div class="app-container">
      <app-side-menu 
        [isOpen]="isSideMenuOpen" 
        (menuClosed)="closeSideMenu()"
      />
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      position: relative;
    }
    
    main {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      min-width: 0;
      background: var(--background-color);
    }

    @media (max-width: 768px) {
      main {
        width: 100%;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isSideMenuOpen = false;
  private menuSubscription: Subscription;

  constructor(
    private dbService: DbService,
    private menuService: MenuService
  ) {
    this.menuSubscription = this.menuService.menuState$.subscribe(
      state => this.isSideMenuOpen = state
    );
  }

  async ngOnInit() {
    await this.dbService.initializeDB();
  }

  ngOnDestroy() {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }

  closeSideMenu() {
    this.menuService.closeMenu();
  }
}