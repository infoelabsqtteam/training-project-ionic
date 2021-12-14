import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnquiryDetailsPage } from './enquiry-details.page';

const routes: Routes = [
  {
    path: '',
    component: EnquiryDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnquiryDetailsPageRoutingModule {}
