import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadTabsPage } from './lead-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: LeadTabsPage,
    children: [
      {
        path: 'lead-calls',
        children: [
          {
            path: '',
            loadChildren: () => import('../lead-calls/lead-calls.module').then(m => m.LeadCallsPageModule)
          },
        ]

      },
      {
        path: 'lead-whatsapp',
        children: [
          {
            path: '',
            loadChildren: () => import('../lead-whatsapp/lead-whatsapp.module').then(m => m.LeadWhatsappPageModule)
          },
        ]
      },
      {
        path: 'lead-sms',
        children: [
          {
            path: '',
            loadChildren: () => import('../lead-sms/lead-sms.module').then(m => m.LeadSmsPageModule)
            // },
          },
        ]
      },
      {
        path: 'lead-reminder',
        children: [
          {
            path: '',
            loadChildren: () => import('../lead-reminder/lead-reminder.module').then(m => m.LeadReminderPageModule)
            // },
          },
        ]
      },
      {
        path: '',
        redirectTo: 'tabs/lead-calls',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/lead-calls',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadTabsPageRoutingModule { }
