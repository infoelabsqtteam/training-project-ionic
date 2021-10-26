import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { SupportTopicComponent } from 'src/app/component/support-topic/support-topic.component';
import { AuthService, StorageService, RestService, LoaderService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {
  supportOptions: any = [];
  constructor(private modalController: ModalController,
    
    private authService: AuthService,
    private storageService: StorageService,
    private http: HttpClient,
    private restService: RestService,
    private loaderService: LoaderService,
    private coreUtilService:CoreUtilityService
  ) { }

  ngOnInit() {
    this.getSupportOptions();
  }

  getSupportOptions() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM_FOR_ECOM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "support_group"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.coreUtilService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            if (respData['data'])
              this.supportOptions = respData['data'];
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);

          }
        )
      }
    })
  }
  async showTopics(data) {
    const modal = await this.modalController.create({
      component: SupportTopicComponent,
      componentProps: {
        "modalData": data,
        "headerVaue": ""
      }
    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }



}
