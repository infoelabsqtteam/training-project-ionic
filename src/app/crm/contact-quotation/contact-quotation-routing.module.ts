import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactQuotationPage } from './contact-quotation.page';

const routes: Routes = [
  {
    path: '',
    component: ContactQuotationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactQuotationPageRoutingModule {}
