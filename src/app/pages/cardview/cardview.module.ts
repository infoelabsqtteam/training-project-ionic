import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CardviewPageRoutingModule } from './cardview-routing.module';
import { CardviewPage } from './cardview.page';
import { Modalh4Component } from '../../component/modalh4/modalh4.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CardviewPageRoutingModule
  ],
  declarations: [
    CardviewPage, 
    Modalh4Component
  ]
})
export class CardviewPageModule {}
