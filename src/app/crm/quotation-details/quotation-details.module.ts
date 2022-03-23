import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationDetailsPageRoutingModule } from './quotation-details-routing.module';

import { QuotationDetailsPage } from './quotation-details.page';
// import { CardsLayoutComponent } from 'src/app/component/cards-layout/cards-layout.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationDetailsPageRoutingModule,
  ],
  declarations: [
    QuotationDetailsPage
  ]
})
export class QuotationDetailsPageModule {}
