import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormModalComponent } from './form-modal/form-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridSelectionModalComponent } from './grid-selection-modal/grid-selection-modal.component';
import { GridSelectionDetailModalComponent } from './grid-selection-detail-modal/grid-selection-detail-modal.component';
import { BrowserModule } from '@angular/platform-browser';

const modal =[
  FormModalComponent,
  GridSelectionModalComponent,
  GridSelectionDetailModalComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule
  ],
  declarations: modal,
  exports:modal
})
export class ModalModule { }
