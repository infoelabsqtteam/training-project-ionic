import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadTabsPageRoutingModule } from './lead-tabs-routing.module';
import { NewReminderComponent } from '../../component/new-reminder/new-reminder.component';
import { LeadTabsPage } from './lead-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LeadTabsPageRoutingModule
  ],
  declarations: [LeadTabsPage, NewReminderComponent]
})
export class LeadTabsPageModule { }
