import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // public isLoading$: Observable<boolean>;

  // constructor(private loadingService: LoadingService) {
  //   this.isLoading$ = this.loadingService.isLoading$;
  // }
  constructor(private router: Router, private loadingService: LoadingService) {}

  ngOnInit() {
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     // Simulate loading delay (replace with actual logic)
    //     this.loadingService.show();
    //     setTimeout(() => {
    //       this.loadingService.hide();
    //     }, 2000); // Hide after 2 seconds (adjust as needed)
    //   }
    // });
  }
}
