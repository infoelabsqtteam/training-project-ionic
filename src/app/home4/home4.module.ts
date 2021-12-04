import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Home4PageRoutingModule } from './home4-routing.module';

import { Home4Page } from './home4.page';
// import { Modalh4Component } from '../component/modalh4/modalh4.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Home4PageRoutingModule
  ],
  declarations: [Home4Page]
})
export class Home4PageModule {}
