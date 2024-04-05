import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AuthGuard } from '../auth/auth.guard';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  // { path: '', redirectTo: '/home', pathMatch: 'full' },

  
  // { path: '', redirectTo: '/home', pathMatch: 'full'}

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
