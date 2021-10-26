import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadCallsPage } from './lead-calls.page';

const routes: Routes = [
  {
    path: '',
    component: LeadCallsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadCallsPageRoutingModule {}
