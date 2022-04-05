import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardViewPage } from './card-view.page';

const routes: Routes = [
  {
    path: '',
    component: CardViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CardViewPageRoutingModule {}
