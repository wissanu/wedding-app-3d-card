import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
      if (event instanceof NavigationEnd) {
        // Simulate loading delay (replace with actual logic)
        this.loadingService.show();
        setTimeout(() => {
          this.loadingService.hide();
        }, 2000); // Hide after 2 seconds (adjust as needed)
      }
    });
  }
}
