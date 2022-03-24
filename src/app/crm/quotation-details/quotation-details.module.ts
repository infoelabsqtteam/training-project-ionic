import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationDetailsPageRoutingModule } from './quotation-details-routing.module';

import { QuotationDetailsPage } from './quotation-details.page';
import { CommonComponentModule } from 'src/app/m-core/common-component/common-component.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationDetailsPageRoutingModule,
    CommonComponentModule
  ],
  declarations: [QuotationDetailsPage]
})
export class QuotationDetailsPageModule {}
