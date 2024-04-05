import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackLocationPage } from './track-location.page';

const routes: Routes = [
  {
    path: '',
    component: TrackLocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackLocationPageRoutingModule {}
