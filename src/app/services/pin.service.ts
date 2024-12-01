import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinService {
  private readonly PIN_KEY = 'app_pin';
  private readonly LOCK_STATUS_KEY = 'app_locked';
  private isLockedSubject = new BehaviorSubject<boolean>(this.getInitialLockStatus());
  isLocked$ = this.isLockedSubject.asObservable();

  constructor() {
    if (!localStorage.getItem(this.LOCK_STATUS_KEY)) {
      this.setLocked(false);
    }

    // Auto-lock when app goes to background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.hasPin()) {
        this.setLocked(true);
      }
    });
  }

  private getInitialLockStatus(): boolean {
    return localStorage.getItem(this.LOCK_STATUS_KEY) === 'true';
  }

  setPin(pin: string): void {
    localStorage.setItem(this.PIN_KEY, pin);
    this.setLocked(true);
  }

  verifyPin(pin: string): boolean {
    return localStorage.getItem(this.PIN_KEY) === pin;
  }

  hasPin(): boolean {
    return !!localStorage.getItem(this.PIN_KEY);
  }

  removePin(): void {
    localStorage.removeItem(this.PIN_KEY);
    this.setLocked(false);
  }

  setLocked(locked: boolean): void {
    localStorage.setItem(this.LOCK_STATUS_KEY, locked.toString());
    this.isLockedSubject.next(locked);
  }

  isLocked(): boolean {
    return this.isLockedSubject.value;
  }
}