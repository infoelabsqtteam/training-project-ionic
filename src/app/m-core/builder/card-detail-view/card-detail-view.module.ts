import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardDetailViewPageRoutingModule } from './card-detail-view-routing.module';

import { CardDetailViewPage } from './card-detail-view.page';
import { CommonComponentModule } from '../../common-component/common-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponentModule,
    CardDetailViewPageRoutingModule,
  ],
  declarations: [CardDetailViewPage]
})
export class CardDetailViewPageModule {}
