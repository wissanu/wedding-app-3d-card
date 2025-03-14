import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public title = 'wedding-app-3d';
  public isMobile: boolean = false;
  public isNavActive = false;

  constructor(private router: Router, private loadingService: LoadingService) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Show loading screen when navigation starts
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        // Hide loading screen when navigation ends
        this.loadingService.hide();
      }
    });
  }
}
