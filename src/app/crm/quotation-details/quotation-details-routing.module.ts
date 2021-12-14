import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationDetailsPage } from './quotation-details.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationDetailsPageRoutingModule {}
