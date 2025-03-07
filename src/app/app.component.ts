import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public title = 'wedding-app-3d';
  public isMobile: boolean = false;
  public isNavActive = false;

  constructor(private BreakpointObserver: BreakpointObserver) {}


  ngOnInit(): void {
    this.BreakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    })
  }

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }
}
