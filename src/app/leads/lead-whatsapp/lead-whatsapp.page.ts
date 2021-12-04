import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ToastController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-lead-whatsapp',
  templateUrl: './lead-whatsapp.page.html',
  styleUrls: ['./lead-whatsapp.page.scss'],
})
export class LeadWhatsappPage implements OnInit {
  message: string = "";
  msgs = [];
  lead: any = {};
  chatHistory:any= [];
  constructor(
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private coreUtilService: CoreUtilityService,
    private http: HttpClient,
    private callNumber: CallNumber,
    private storageService: StorageService,
    private envService:EnvService
    ) {
    this.msgs = [{
      side: 'left',
      msg: 'Hello'
    },
    {
      side: 'right',
      msg: 'Hii'
    },
    {
      side: 'left',
      msg: 'Are you nearby ?'
    },
    {
      side: 'right',
      msg: 'I will be there in few mins'
    },
    {
      side: 'left',
      msg: 'Ok, I am waiting at vinmark Store'
    },
    {
      side: 'right',
      msg: 'Sorry I am stuck in traffic. Please give me a moment.'
    }
    ];
  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    //this.lead.callHistory = [{ "duration": 12, "name": "bhanu", "date": Date.now() }, { "duration": 12, "name": "Rahul", "date": Date.now() }]
    this.storageService.getObject('lead').then((val) => {
      this.lead = val;
      this.getChatHistory();
    })

  }

  getChatHistory() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [{ "fName": "fromMobileNo", "fValue": this.lead.phone, "operator": "eqic" }],
          key1: "MCLR01",
          key2: "CRM_FOR_ECOM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "whatsap"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            this.chatHistory = respData['data'];
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

  sendWhatsAppMsg() {
    if (this.message.length > 0) {
      this.storageService.getObject('authData').then((val) => {
        if (val && val.idToken != null) {
          var header = {
            headers: new HttpHeaders()
              .set('Authorization', 'Bearer ' + val.idToken)
          }
          this.loaderService.showLoader(null);
          let data = { "messageBody": this.message, "phone": this.lead.phone }
          this.storageService.getUserLog().then((val) => {
            data['log'] = val;

            let api = this.envService.baseUrl('SAVE_FORM_DATA')
            this.http.post(api + '/' + 'whatsap', data, header).subscribe(
              respData => {
                this.loaderService.hideLoader();
                this.message = "";
                this.storageService.presentToast('Saved Successfully!!!');
                this.getChatHistory();
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

  doRefresh(event) {
    console.log('Begin async operation');
    this.getChatHistory();
    event.target.complete();
  }

}
