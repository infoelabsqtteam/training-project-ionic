import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardviewPage } from './cardview.page';

const routes: Routes = [
  {
    path: '',
    component: CardviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CardviewPageRoutingModule {}
