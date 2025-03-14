import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  isLoading = true;

  constructor(private loadingService: LoadingService) {
    this.loadingService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

}
