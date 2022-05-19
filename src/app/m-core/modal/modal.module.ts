import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormModalComponent } from './form-modal/form-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridSelectionModalComponent } from './grid-selection-modal/grid-selection-modal.component';
import { GridSelectionDetailModalComponent } from './grid-selection-detail-modal/grid-selection-detail-modal.component';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { CallDataRecordFormComponent } from './call-data-record-form/call-data-record-form.component';

const modal =[
  FormModalComponent,
  GridSelectionModalComponent,
  GridSelectionDetailModalComponent,
  CallDataRecordFormComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    IonicModule.forRoot(),
  ],
  declarations: modal,
  exports:modal,
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ]
})
export class ModalModule { }
