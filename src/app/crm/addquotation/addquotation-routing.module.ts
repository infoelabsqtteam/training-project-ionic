import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddquotationPage } from './addquotation.page';

const routes: Routes = [
  {
    path: '',
    component: AddquotationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddquotationPageRoutingModule {}
