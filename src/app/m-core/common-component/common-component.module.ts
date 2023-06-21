import { CommonModule } from '@angular/common';  
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from './form/form.component';
import { CardsLayoutComponent } from './cards-layout/cards-layout.component';
import { ModalDetailCardComponent } from './modal-detail-card/modal-detail-card.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartComponent } from './chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { GoogleChartsModule } from 'angular-google-charts';
import { GridSelectionComponent } from './grid-selection/grid-selection.component';
import { PopoverComponent } from './popover/popover.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { GmapViewComponent } from './gmap-view/gmap-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MongodbChartComponent } from './mongodb-chart/mongodb-chart.component';
const components = [
    FormComponent,
    CardsLayoutComponent,
    ModalDetailCardComponent,
    ChartComponent,
    GridSelectionComponent,
    PopoverComponent,
    GmapViewComponent,
    MongodbChartComponent
  ];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        AngularEditorModule,
        ReactiveFormsModule,
        HttpClientModule,
        IonicModule.forRoot(),
        NgSelectModule,
        NgChartsModule,
        GoogleChartsModule,
        GoogleMapsModule
    ],
    providers: [],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ]
})
export class CommonComponentModule { }