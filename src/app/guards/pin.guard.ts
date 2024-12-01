import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PinService } from '../services/pin.service';

export const pinGuard = () => {
  const pinService = inject(PinService);
  const router = inject(Router);

  if (pinService.hasPin() && pinService.isLocked()) {
    router.navigate(['/pin']);
    return false;
  }

  return true;
};