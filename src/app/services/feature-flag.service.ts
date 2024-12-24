import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Feature {
  id: string;
  name: string;
  isAdvanced: boolean;
  isBeta: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private features: Feature[] = [
    { id: 'loans', name: 'Loans', isAdvanced: true, isBeta: true },
    { id: 'assets', name: 'Assets', isAdvanced: true, isBeta: true },
    { id: 'fuel', name: 'Fuel Tracking', isAdvanced: true, isBeta: true }
  ];

  private isAdvancedMode = new BehaviorSubject<boolean>(false);

  constructor() {
    // Load mode from localStorage
    const savedMode = localStorage.getItem('appMode');
    if (savedMode) {
      this.isAdvancedMode.next(savedMode === 'advanced');
    }
  }

  getFeatures(): Feature[] {
    return this.features;
  }

  isFeatureEnabled(featureId: string): boolean {
    const feature = this.features.find(f => f.id === featureId);
    if (!feature) return true; // If feature not found in list, assume it's a basic feature
    
    if (feature.isAdvanced) {
      return this.isAdvancedMode.value;
    }
    return true;
  }

  isFeatureBeta(featureId: string): boolean {
    const feature = this.features.find(f => f.id === featureId);
    return feature?.isBeta || false;
  }

  getAppMode(): Observable<boolean> {
    return this.isAdvancedMode.asObservable();
  }

  setAppMode(isAdvanced: boolean) {
    localStorage.setItem('appMode', isAdvanced ? 'advanced' : 'basic');
    this.isAdvancedMode.next(isAdvanced);
  }
}
