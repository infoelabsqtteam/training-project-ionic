import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormModalComponent } from './form-modal/form-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridSelectionModelComponent } from './grid-selection-model/grid-selection-model/grid-selection-model.component';

const modal =[
  FormModalComponent,
  GridSelectionModelComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: modal,
  exports:modal
})
export class ModalModule { }
