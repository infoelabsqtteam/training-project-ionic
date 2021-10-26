import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemSearchPageRoutingModule } from './item-search-routing.module';

import { ItemSearchPage } from './item-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemSearchPageRoutingModule
  ],
  declarations: [ItemSearchPage]
})
export class ItemSearchPageModule {}
