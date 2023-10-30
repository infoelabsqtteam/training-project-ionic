import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyScannerComponent } from './scanner.component';
import { DataModalComponent } from './data-modal/data-modal.component';
import { CustomStaticFormComponent } from './custom-static-form/custom-static-form.component';
import { IonicModule } from '@ionic/angular';

const componet =[
  MyScannerComponent,
  DataModalComponent,
  CustomStaticFormComponent
]

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot()
  ],
  declarations: componet,
  exports:componet,
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ]
})
export class MyScannerModule { }
