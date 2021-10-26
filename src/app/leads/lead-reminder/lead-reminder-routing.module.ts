import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadReminderPage } from './lead-reminder.page';

const routes: Routes = [
  {
    path: '',
    component: LeadReminderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadReminderPageRoutingModule {}
