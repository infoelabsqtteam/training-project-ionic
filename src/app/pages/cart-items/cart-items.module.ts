import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartItemsPageRoutingModule } from './cart-items-routing.module';

import { CartItemsPage } from './cart-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartItemsPageRoutingModule
  ],
  declarations: [CartItemsPage]
})
export class CartItemsPageModule {}
