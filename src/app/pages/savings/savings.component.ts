import { Component } from "@angular/core";
import { MobileHeaderComponent } from "../../components/mobile-header/mobile-header.component";
import { Router } from "@angular/router";

@Component({
    selector: 'app-savings',
    standalone: true,
    imports: [
        MobileHeaderComponent
    ],
    template: `
      <app-mobile-header
        title="Saving Goals"
        [showBackButton]="true"
        (back)="goBack()"
      />
        
        
        `,
  styles: [``]
})

export class SavingsComponent {
    
    constructor(private router: Router) {}

    goBack() {
      this.router.navigate(['/']);
    }
}