import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuState = new BehaviorSubject<boolean>(false);
  menuState$ = this.menuState.asObservable();

  toggleMenu() {
    this.menuState.next(!this.menuState.value);
  }

  closeMenu() {
    this.menuState.next(false);
  }
}