import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackLocationPageRoutingModule } from './track-location-routing.module';

import { TrackLocationPage } from './track-location.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackLocationPageRoutingModule
  ],
  declarations: [TrackLocationPage]
})
export class TrackLocationPageModule {}
