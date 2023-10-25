import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyScannerComponent } from './scanner.component';
import { DataModalComponent } from './data-modal/data-modal.component';

const componet =[
  MyScannerComponent,
  DataModalComponent
]

@NgModule({
  declarations: componet,
  imports: [
    CommonModule
  ],
  exports:componet,
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ]
})
export class MyScannerModule { }
