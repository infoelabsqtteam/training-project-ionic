import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactQuotationPageRoutingModule } from './contact-quotation-routing.module';

import { ContactQuotationPage } from './contact-quotation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactQuotationPageRoutingModule
  ],
  declarations: [ContactQuotationPage]
})
export class ContactQuotationPageModule {}
