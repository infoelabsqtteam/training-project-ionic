import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEnquiryPage } from './add-enquiry.page';

const routes: Routes = [
  {
    path: '',
    component: AddEnquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddEnquiryPageRoutingModule {}
