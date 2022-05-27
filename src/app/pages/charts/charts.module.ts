import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChartsPageRoutingModule } from './charts-routing.module';

import { ChartsPage } from './charts.page';

import { NgChartsModule } from 'ng2-charts';
import { CommonComponentModule } from 'src/app/m-core/common-component/common-component.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartsPageRoutingModule,
    NgChartsModule,
    CommonComponentModule
  ],
  declarations: [ChartsPage],
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ]
})
export class ChartsPageModule {}
