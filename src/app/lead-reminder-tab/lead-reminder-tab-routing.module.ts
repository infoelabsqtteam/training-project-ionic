import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadReminderTabPage } from './lead-reminder-tab.page';

const routes: Routes = [
  {
    path: '',
    component: LeadReminderTabPage,
    children: [
      {
        path: 'ld',
        children: [
          {
            path: '',
            loadChildren: () => import('../leads/leads.module').then(m => m.LeadsPageModule)
          },
        ]

      },
      {
        path: 'lr',
        children: [
          {
            path: '',
            loadChildren: () => import('../leads/lead-reminder/lead-reminder.module').then(m => m.LeadReminderPageModule)
          },
        ]
      }, {
        path: '',
        redirectTo: 'lrtab/ld',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'lrtab/ld',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadReminderTabPageRoutingModule { }
