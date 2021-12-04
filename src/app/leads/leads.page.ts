import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { from } from 'rxjs';
import { ModalComponent } from '../component/modal/modal.component';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallLogsComponent } from '../call-logs/call-logs.component';
import { CallFeedbackComponent } from '../component/call-feedback/call-feedback.component';
import { AuthService, StorageService, CoreUtilityService, LoaderService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
})

export class LeadsPage implements OnInit {
  myInput: string;
  leads: any = [];
  statusList: any = [];
  statusFilter: any = "";
  myInputs: any = [];
  showIcon: boolean = false;
  crList = [{ fName: "lead_status.name", fValue: "new", operator: "eqic" }];

  constructor(
    private authService: AuthService,
    private http: HttpClient, 
    private router: Router, 
    private storageService: StorageService,
    public toastController: ToastController, 
    public modalController: ModalController,
    private loaderService: LoaderService, 
    private alertController: AlertController,
    private callNumber: CallNumber,
    private coreUtilService:CoreUtilityService,
    private envService:EnvService
  ) { }

  ngOnInit() {

  }
  ionViewWillEnter() {

    this.getLeads(this.crList);
    this.getStatusList();
  }

  getLeads(crList) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        if (crList === null)
          this.loaderService.showLoader(null);
        let obj = {
          crList: crList != null ? crList : [],
          key1: "MCLR01",
          key2: "CRM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "updated_leads"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = `${this.envService.baseUrl('GET_GRID_DATA')}/-show_on_top,updateDate`;
        this.http.post(api, obj, header).subscribe(
          respData => {
            if (crList === null) this.loaderService.hideLoader();
            this.leads = respData['data'];
          },
          (err: HttpErrorResponse) => {
            if (crList === null) this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })

  }
  getStatusList() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        //this.loaderService.showLoader(null);
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "app_filter_status"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            // this.loaderService.hideLoader();
            this.statusList = respData['data'];
            this.myInputs = this.createInputs();
          },
          (err: HttpErrorResponse) => {
            // this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })

  }
  call(param: any) {
    param.start_datetime = new Date();
    this.callNumber.callNumber(param.phone, true)
      .then(res => {
        this.openCallFeedback(param);
      })
      .catch(err => {
        //this.openCallFeedback(param);
        console.log('Error launching dialer' + err);
      });
  }

  getCallLogs(data) {
    this.storageService.setObject("lead", JSON.stringify(data));
    this.coreUtilService.gotoPage('/leads/tabs/lead-calls');
    // data.callHistory = [{ "duration": 0, "name": "bhanu" }];
    // let filters: CallLogObject[] = [{
    //   "name": "number",
    //   "value": data.phone,
    //   "operator": "like",
    // }];
    // this.callLog.getCallLog(filters).then((callData) => {
    //   data.callHistory = callData;
    //   // alert(callData.length);
    //   // alert(JSON.stringify(data.callHistory));
    //   this.openModal(data);
    // },
    //   (err) => {
    //     //alert('error while get call logs' + err);
    //     this.openModal(data);
    //   })

  }
  async openModal(data) {
    //alert(data.callHistory.length);
    const modal = await this.modalController.create({
      component: CallLogsComponent,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }
    });
    modal.componentProps.modal = modal;

    return await modal.present();
  }
  async openCallFeedback(data) {
    //alert(data.callHistory.length);
    const modal = await this.modalController.create({
      component: CallFeedbackComponent,
      cssClass: 'my-custom-modal-css',
      showBackdrop: true,
      backdropDismiss: false,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }

    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        this.getLeads(this.crList);
        console.log('close callfeed' + data); // Here's your selected user!
      });

    return await modal.present();
  }

  compareWith(o1: any, o2: any) {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (Array.isArray(o2)) {
      return o2.some((u: any) => u.id === o1.id);
    }

    return o1.id === o2.id;
  }

  statusChange(event) {
    console.log(this.statusFilter);
    this.getLeads(null);
  }
  search(param: string) {
    if (param != null && param.length > 2) {
      this.showIcon = true;
      const crList = [{ fName: "name", fValue: param, operator: "stwic" }]
      this.getLeads(crList);
    } else if (param != null && param.length === 0) {
      this.getLeads(null);
      this.showIcon = false;
    }
  }
  clearText() {
    this.myInput = "";
    this.showIcon = false;
    this.getLeads(null);
  }
  async showStatusAlert() {

    const alert = await this.alertController.create({
      header: 'Status',
      inputs: this.myInputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            let fValue = "";
            if (data && data.length > 1) {
              data.forEach((element, i) => {
                fValue = `${fValue}:${element}`;
              });
            } else if (data && data.length === 1) {
              fValue = data[0];
            }
            if (fValue != "") {
              const crList = [{ fName: "lead_status._id", fValue: fValue, operator: "in" }]
              this.getLeads(crList);
            } else {
              this.getLeads(null);
            }
          }
        }
      ]
    });

    await alert.present();
  }
  createInputs() {
    const theNewInputs = [];
    if (this.statusList && this.statusList.length > 0) {
      for (let i = 0; i < this.statusList.length; i++) {
        theNewInputs.push(
          {
            type: 'checkbox',
            label: this.statusList[i].lead_status,
            value: this.statusList[i]._id,
            checked: false
          }
        );
      }
    }
    return theNewInputs;

  }


}
