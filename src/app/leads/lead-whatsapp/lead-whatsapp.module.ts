import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadWhatsappPageRoutingModule } from './lead-whatsapp-routing.module';

import { LeadWhatsappPage } from './lead-whatsapp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadWhatsappPageRoutingModule
  ],
  declarations: [LeadWhatsappPage]
})
export class LeadWhatsappPageModule {}
