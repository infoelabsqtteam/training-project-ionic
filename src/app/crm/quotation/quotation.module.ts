import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPageRoutingModule } from './quotation-routing.module';

import { QuotationPage } from './quotation.page';
import { CardsLayoutComponent } from 'src/app/component/cards-layout/cards-layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    QuotationPageRoutingModule
  ],
  declarations: [
    QuotationPage,
    CardsLayoutComponent
  ]
})
export class QuotationPageModule {}
