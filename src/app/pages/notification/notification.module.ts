import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { NotificationPageRoutingModule } from './notification-routing.module';
import { NotificationPage } from './notification.page';
import { NotificationViewComponent } from 'src/app/component/notification-view/notification-view.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NotificationPageRoutingModule
  ],
  declarations: [NotificationPage, NotificationViewComponent]
})
export class NotificationPageModule { }
