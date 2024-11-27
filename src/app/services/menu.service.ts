import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuState = new BehaviorSubject<boolean>(false);
  menuState$ = this.menuState.asObservable();

  toggleMenu() {
    if (this.isMobileView()) {
      this.menuState.next(!this.menuState.value);
    }
  }

  closeMenu() {
    this.menuState.next(false);
  }

  private isMobileView(): boolean {
    return window.innerWidth <= 768; // Define mobile breakpoint
  }
}
