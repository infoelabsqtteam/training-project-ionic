import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartItemsPage } from './cart-items.page';

const routes: Routes = [
  {
    path: '',
    component: CartItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartItemsPageRoutingModule {}
