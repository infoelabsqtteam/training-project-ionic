import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnquiryDetailsPageRoutingModule } from './enquiry-details-routing.module';

import { EnquiryDetailsPage } from './enquiry-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnquiryDetailsPageRoutingModule
  ],
  declarations: [EnquiryDetailsPage]
})
export class EnquiryDetailsPageModule {}
