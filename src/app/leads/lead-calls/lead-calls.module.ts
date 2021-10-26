import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadCallsPageRoutingModule } from './lead-calls-routing.module';

import { LeadCallsPage } from './lead-calls.page';
import { NewReminderComponent } from '../../component/new-reminder/new-reminder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LeadCallsPageRoutingModule
  ],
  declarations: [LeadCallsPage]
})
export class LeadCallsPageModule { }
