import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CoreUtilityService, RestService, StorageService,  } from '@core/ionic-core';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {
  stores: any[];
  constructor(
    private coreUtilService: CoreUtilityService,
    private restService: RestService, 
    private storageService: StorageService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.getStore();
  }

  goToHome() {
    this.coreUtilService.gotoPage('tab/home2');
  }

  async getStore() {
    let log = await this.storageService.getUserLog();
    let obj = {
      crList: [],
      key1: "MCLR01",
      key2: "CRM",
      log: log,
      pageNo: 0,
      pageSize: 100,
      value: "store_locator"
    }
    let api = `${this.coreUtilService.baseUrl('GET_GRID_DATA')}/null`;
    this.restService.postApiMethod(api, obj).subscribe((resp) => {
      if (resp['data'] && resp['data'].length > 0) {
        this.stores = resp['data'];
      }
    }, (err: HttpErrorResponse) => {
      //this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })
  }
}
