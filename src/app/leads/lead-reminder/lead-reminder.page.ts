import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { NewReminderComponent } from 'src/app/component/new-reminder/new-reminder.component';
import { ModalController } from '@ionic/angular';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { AuthService, StorageService, LoaderService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-lead-reminder',
  templateUrl: './lead-reminder.page.html',
  styleUrls: ['./lead-reminder.page.scss'],
})
export class LeadReminderPage implements OnInit {
  lead: any = {};
  reminders: any = [];
  reminder: any = {};
  constructor(
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private callNumber: CallNumber,
    private storageService: StorageService,
    private alertController: AlertController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //this.lead.callHistory = [{ "duration": 12, "name": "bhanu", "date": Date.now() }, { "duration": 12, "name": "Rahul", "date": Date.now() }]
    this.storageService.getObject('lead').then((val) => {
      this.lead = val;
      this.getReminders();
    })

  }


  getReminders() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [{ fName: "status", fValue: "active", operator: "eqic" }],
          key1: "MCLR01",
          key2: "CRM_FOR_ECOM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "reminders"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.coreUtilService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            this.reminders = respData['data'];
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
  call(param: any) {
    this.callNumber.callNumber(param.phone, true)
      .then(res => {
        console.log('Launched dialer!' + res);
        //this.reminder = param;
        this.presentAlertPrompt(param);
      }
      )
      .catch(err => {
        console.log('Error launching dialer' + err)
        this.presentAlertPrompt(param);
      });
  }

  updateReminder(data) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);

        this.storageService.getUserLog().then((val) => {
          data['log'] = val;
          data.status = "InActive";
          let api = `${this.coreUtilService.baseUrl('SAVE_FORM_DATA')}/reminders`;
          this.http.post(api, data, header).subscribe(
            respData => {
              this.loaderService.hideLoader();
              if (respData.hasOwnProperty("success")) {
                this.storageService.presentToast('Removed Successfully!!!');
                this.getReminders();
              }
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

  async presentAlertPrompt(param) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Comment',
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Comment',
          attributes: {
            minlength: 2,
          }
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Save',
          handler: (data) => {
            console.log('Confirm Ok');
            if (data && data.comment) {
              param.comment = data.comment;
              this.saveReminderComment(param);
            }
          }
        }
      ]
    });
    await alert.present();
  }
  saveReminderComment(data) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        this.storageService.getUserLog().then((val) => {
          data['log'] = val;
          let api = `${this.coreUtilService.baseUrl('SAVE_FORM_DATA')}/reminder_comment`;
          this.http.post(api, data, header).subscribe(
            respData => {
              this.loaderService.hideLoader();
              if (respData.hasOwnProperty("success")) {
                this.storageService.presentToast('Saved Successfully!!!');
              }
              //alert('success' + respData);
            },
            (err: HttpErrorResponse) => {
              this.loaderService.hideLoader();
              this.storageService.presentToast('Error occurred while save...');

            }
          )
        })
      }
    })
  }

}
