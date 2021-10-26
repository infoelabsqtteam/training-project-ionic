import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadSmsPage } from './lead-sms.page';

const routes: Routes = [
  {
    path: '',
    component: LeadSmsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadSmsPageRoutingModule {}
