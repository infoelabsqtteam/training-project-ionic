import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadsPage } from './leads.page';

const routes: Routes = [
  {
    path: '',
    component: LeadsPage
  },
  {
    path: 'tabs',
    loadChildren: () => import('./lead-tabs/lead-tabs.module').then(m => m.LeadTabsPageModule)
  },
  {
    path: 'lead-reminder',
    loadChildren: () => import('./lead-reminder/lead-reminder.module').then(m => m.LeadReminderPageModule)
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsPageRoutingModule { }
