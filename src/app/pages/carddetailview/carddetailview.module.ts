import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarddetailviewPageRoutingModule } from './carddetailview-routing.module';

import { CarddetailviewPage } from './carddetailview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarddetailviewPageRoutingModule
  ],
  declarations: [CarddetailviewPage]
})
export class CarddetailviewPageModule {}
