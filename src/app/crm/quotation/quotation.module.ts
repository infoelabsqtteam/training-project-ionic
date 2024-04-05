import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPageRoutingModule } from './quotation-routing.module';

import { QuotationPage } from './quotation.page';
import { CommonComponentModule } from 'src/app/m-core/common-component/common-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    QuotationPageRoutingModule,
    CommonComponentModule
  ],
  declarations: [
    QuotationPage,
  ]
})
export class QuotationPageModule {}
