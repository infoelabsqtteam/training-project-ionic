import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardViewPageRoutingModule } from './card-view-routing.module';

import { CardViewPage } from './card-view.page';
import { CommonComponentModule } from '../../common-component/common-component.module';
import { HideHeaderDirective } from 'src/app/directives/hide-header.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonComponentModule,
    CardViewPageRoutingModule,
  ],
  declarations: [CardViewPage, HideHeaderDirective]
})
export class CardViewPageModule {}
