import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wedding-app-3d';

  isNavActive = false;

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }
}
