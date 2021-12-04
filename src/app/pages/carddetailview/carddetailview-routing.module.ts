import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarddetailviewPage } from './carddetailview.page';

const routes: Routes = [
  {
    path: '',
    component: CarddetailviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarddetailviewPageRoutingModule {}
