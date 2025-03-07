import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StarrySkyComponent } from './starry-sky/starry-sky.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Home page with fragments
  { path: 'starry-sky', component: StarrySkyComponent }, // Separate page for starry sky
  { path: '**', redirectTo: '' } // Redirect to home for unknown routes
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
