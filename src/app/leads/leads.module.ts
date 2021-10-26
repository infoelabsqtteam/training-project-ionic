import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadsPageRoutingModule } from './leads-routing.module';
import { CallLogsComponent } from '../call-logs/call-logs.component';
import { LeadsPage } from './leads.page';
import { CallFeedbackComponent } from '../component/call-feedback/call-feedback.component';
import { UpdateLeadComponent } from '../component/update-lead/update-lead.component';
import { SearchModalComponent } from '../component/search-modal/search-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadsPageRoutingModule
  ],
  declarations: [
    LeadsPage, 
    CallFeedbackComponent, 
    UpdateLeadComponent, 
    SearchModalComponent,
    CallLogsComponent]
})
export class LeadsPageModule { }
