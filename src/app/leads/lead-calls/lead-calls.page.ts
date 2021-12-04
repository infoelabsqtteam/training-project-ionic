import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ToastController } from '@ionic/angular';
import { NewReminderComponent } from 'src/app/component/new-reminder/new-reminder.component';
import { ModalController } from '@ionic/angular';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';
import { CoreEnvironment } from '@angular/compiler/src/compiler_facade_interface';



@Component({
  selector: 'app-lead-calls',
  templateUrl: './lead-calls.page.html',
  styleUrls: ['./lead-calls.page.scss'],
})
export class LeadCallsPage implements OnInit {
  lead: any = {};
  callLogs: any = [];
  constructor(
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private callNumber: CallNumber,
    private storageService: StorageService,
    private envService: EnvService

  ) {

    // this.storageService.getObject('lead').then((val) => {
    //   console.log(val);
    // }, (err) => {
    //   console.log(err)
    // })
  }

  ngOnInit() {


  }
  ionViewWillEnter() {
    //this.lead.callHistory = [{ "duration": 12, "name": "bhanu", "date": Date.now() }, { "duration": 12, "name": "Rahul", "date": Date.now() }]
    this.storageService.getObject('lead').then((val) => {
      this.lead = val;
      console.log(val);
      this.getCallLogs();
      // let filters: CallLogObject[] = [{
      //   "name": "number",
      //   "value": this.lead.phone,
      //   "operator": "like",
      // }];
      // this.callLog.getCallLog(filters).then((callData) => {
      //   this.lead.callHistory = callData;
      //   // alert(callData.length);
      //   // alert(JSON.stringify(data.callHistory));

      // },
      //   (err) => {
      //     //alert('error while get call logs' + err);
      //   })
    })
  }

  async openModal(data) {
    //alert(data.callHistory.length);
    const modal = await this.modalController.create({
      component: NewReminderComponent,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }
    });
    modal.componentProps.modal = modal;

    return await modal.present();
  }
  getCallLogs() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [{ fName: "typeList", fValue: "CALL", operator: "in" }, { fName: "phoneList", fValue: this.lead.phone, operator: "in" }],
          key1: "MCLR01",
          key2: "CRM_FOR_ECOM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "notification"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            console.log(respData);
            this.callLogs = respData['data'];
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })
  }
  saveCallLogs(data) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);

        this.storageService.getUserLog().then((val) => {
          data['log'] = val;

          let api = this.envService.baseUrl('SAVE_FORM_DATA')
          this.http.post(api + '/' + 'lead_call_history', data, header).subscribe(
            respData => {
              this.loaderService.hideLoader();
              this.storageService.presentToast('Saved Successfully!!!');
              //alert('success' + respData);
            },
            (err: HttpErrorResponse) => {
              this.loaderService.hideLoader();
              this.storageService.presentToast('Error occurred while save...');
              //alert(err.error);
              // console.log(err.name);
              // console.log(err.message);
              // console.log(err.status);
            }
          )
        })
      }
    })

  }

}
