import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService, LoaderService, StorageService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-support-topic',
  templateUrl: './support-topic.component.html',
  styleUrls: ['./support-topic.component.scss'],
})
export class SupportTopicComponent implements OnInit {
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  topics: any = [];
  description: string;
  showDescription: boolean = false;
  topic: any = {};
  constructor(private modalCtrl: ModalController,
    private authService: AuthService,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
    this.getTopics(this.modalData.support_topic._id);
  }

  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }

  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }

  getTopics(id: string) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [{ fName: "parent._id", fValue: id, operator: "eq" }],
          key1: "MCLR01",
          key2: "CRM_FOR_ECOM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "support_topic"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.coreUtilService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            if (respData['data'])
              this.topics = respData['data'];
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);

          }
        )
      }
    })
  }
  getTopicByParent(data) {
    if (data && data.child) {
      this.getTopics(data._id);
    } else {
      this.showDescription = true;
      this.topic = data;
    }

  }
  cancel() {
    this.showDescription = false;
    //this._dismiss();
  }
  saveRequest() {
    console.log(this.description)
    let data: any = {};
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        data.summary = this.topic.name;
        data.description = this.description;
        data.type = "Support";
        data.task_status = "NEW";
        this.loaderService.showLoader(null);

        this.storageService.getUserLog().then((val) => {
          data['log'] = val;
          let api = `${this.coreUtilService.baseUrl('SAVE_FORM_DATA')}/task_management`;
          this.http.post(api, data, header).subscribe(
            respData => {
              this.loaderService.hideLoader();
              if (respData.hasOwnProperty("success")) {
                this.storageService.presentToast('Saved Successfully!!!');
                this._dismiss();
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

}
