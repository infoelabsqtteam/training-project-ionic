import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadReminderTabPageRoutingModule } from './lead-reminder-tab-routing.module';

import { LeadReminderTabPage } from './lead-reminder-tab.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadReminderTabPageRoutingModule
  ],
  declarations: [LeadReminderTabPage]
})
export class LeadReminderTabPageModule {}
