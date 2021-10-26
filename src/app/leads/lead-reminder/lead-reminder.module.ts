import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadReminderPageRoutingModule } from './lead-reminder-routing.module';

import { LeadReminderPage } from './lead-reminder.page';
import { NewReminderComponent } from '../../component/new-reminder/new-reminder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadReminderPageRoutingModule
  ],
  declarations: [LeadReminderPage]
})
export class LeadReminderPageModule { }
