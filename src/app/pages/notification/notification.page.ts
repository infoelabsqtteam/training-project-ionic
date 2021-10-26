import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { NotificationViewComponent } from 'src/app/component/notification-view/notification-view.component';
import { AuthService, StorageService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
  notificationList: any[];
  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;


  constructor(
    
    private authService: AuthService,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private coreUtilService:CoreUtilityService
  ) { }

  ngOnInit() {

  }
  async ionViewWillEnter() {
    this.notificationList = await this.storageService.getObject('notification');
  }

  async viewNotification(data) {
    //alert(data.callHistory.length);
    const modal = await this.modalCtrl.create({
      component: NotificationViewComponent,
      cssClass: 'my-custom-modal-css',
      showBackdrop: true,
      backdropDismiss: false,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }

    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }

}
