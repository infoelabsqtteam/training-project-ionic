import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from './form/form.component';
import { CardsLayoutComponent } from './cards-layout/cards-layout.component';
import { ModalDetailCardComponent } from './modal-detail-card/modal-detail-card.component';

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
    ],
    providers: []
})
export class CommonComponentModule { }