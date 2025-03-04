import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StarrySkyComponent } from './starry-sky/starry-sky.component';

const routes: Routes = [
  { path: 'starry-sky', component: StarrySkyComponent },
  { path: '**', redirectTo: '' } // Wildcard route for 404 pages
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
