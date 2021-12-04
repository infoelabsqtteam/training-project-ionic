import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { OrdermodalComponent } from '../ordermodal/ordermodal.component';
import { from } from 'rxjs';
import { AuthService, LoaderService, CoreUtilityService, StorageService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  gridData: any;
  inValue = 0;
  dataReturned: any;
  myInput:string='';


  constructor(
    private authService: AuthService, 
    private http: HttpClient, 
    private modalController: ModalController, 
    private loaderService: LoaderService, 
    private coreUtilService:CoreUtilityService,
    private storageService:StorageService,
    private envService:EnvService
  ) { }

  ngOnInit() {
    this.commonFunction();
  }

  async openModal(data) {
    const modal = await this.modalController.create({
      component: OrdermodalComponent,
      componentProps: {
        "modalData": data,
        "paramID": 123,
        "paramTitle": "Test Title"
      }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
        //alert('Modal Sent Data :'+ dataReturned);
      }
    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }

  commonFunction() {
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
          key2: "CRM",
          log: { userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01" },
          pageNo: 0,
          pageSize: 50,
          value: "orders"
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            this.gridData = respData['data'];
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
          }
        )
      }
    })
  }
  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.commonFunction();
    }
  }

  onClose(myInput) {
    this.commonFunction();
  }

  search(myInput) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        let searchObj = {
          crList: [{
            fName: "billing_company",
            fValue: myInput,
            operator: "stwic"
          }],
          key1: "MCLR01",
          key2: "CRM",
          log: { userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01" },
          pageNo: 0,
          pageSize: 50,
          value: "orders",
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/null', searchObj, header).subscribe(
          respData => {
            this.gridData = respData['data'];
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
          }
        );
      }
    })
  }

}
