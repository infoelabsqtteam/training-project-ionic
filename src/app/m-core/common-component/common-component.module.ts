import { CommonModule } from '@angular/common';  
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from './form/form.component';
import { CardsLayoutComponent } from './cards-layout/cards-layout.component';
import { ModalDetailCardComponent } from './modal-detail-card/modal-detail-card.component';
import { NgSelectModule } from '@ng-select/ng-select';

const components = [
    FormComponent,
    CardsLayoutComponent,
    ModalDetailCardComponent
  ];

@NgModule({
    declarations: components,
    exports:components,
    entryComponents: [],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule, 
        ReactiveFormsModule, 
        HttpClientModule,
        IonicModule.forRoot(),
        NgSelectModule
    ],
    providers: [],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
})
export class CommonComponentModule { }