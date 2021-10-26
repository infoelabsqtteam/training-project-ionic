import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { OrderDetailComponent } from 'src/app/component/order-detail/order-detail.component';



import * as appConstants from '../../shared/app.constants';
import { StorageService, RestService, AuthService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
})
export class OrderHistoryPage implements OnInit {
  orderHistory: any = [];
  constructor( 
    private storageService: StorageService,
    private restService: RestService, 
    private authService: AuthService, 
    private modalController: ModalController,
    private coreUtilService:CoreUtilityService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.getOrderHistory();
  }
  goToHome() {
    this.coreUtilService.gotoPage('/tab/home2');
  }
  async getOrderHistory() {
    const user = await this.storageService.getObject('user');
    let log = await this.storageService.getUserLog();
    let obj = {
      crList: [{ fName: "phone", fValue: user.mobile1, operator: "eq" }],
      key1: "MCLR01",
      key2: "CRM",
      log: log,
      pageNo: 0,
      pageSize: 100,
      value: "order_mang",
    }
    let api = `${this.coreUtilService.baseUrl('GET_GRID_DATA')}/null`;
    this.restService.postApiMethod(api, obj).subscribe((resp) => {
      if (resp['data'] && resp['data'].length > 0) {
        this.orderHistory = resp['data'];
      }
    }, (err: HttpErrorResponse) => {
      //this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })
  }

  async viewOrderDetails(order) {
    const modal = await this.modalController.create({
      component: OrderDetailComponent,
      componentProps: {
        "modalData": order,
        "headerVaue": ""
      }
    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }

}
