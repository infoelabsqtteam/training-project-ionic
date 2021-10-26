import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadWhatsappPage } from './lead-whatsapp.page';

const routes: Routes = [
  {
    path: '',
    component: LeadWhatsappPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadWhatsappPageRoutingModule {}
