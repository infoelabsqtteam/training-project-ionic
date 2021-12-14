import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddEnquiryPageRoutingModule } from './add-enquiry-routing.module';

import { AddEnquiryPage } from './add-enquiry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddEnquiryPageRoutingModule
  ],
  declarations: [AddEnquiryPage]
})
export class AddEnquiryPageModule {}
