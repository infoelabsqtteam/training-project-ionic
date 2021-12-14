import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddquotationPageRoutingModule } from './addquotation-routing.module';

import { AddquotationPage } from './addquotation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddquotationPageRoutingModule
  ],
  declarations: [AddquotationPage]
})
export class AddquotationPageModule {}
