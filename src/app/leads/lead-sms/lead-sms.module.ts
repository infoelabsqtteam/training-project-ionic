import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadSmsPageRoutingModule } from './lead-sms-routing.module';

import { LeadSmsPage } from './lead-sms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadSmsPageRoutingModule
  ],
  declarations: [LeadSmsPage]
})
export class LeadSmsPageModule {}
