import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService, StorageService, LoaderService, CoreUtilityService, GallaryService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  styleUrls: ['./update-task.component.scss'],
})
export class UpdateTaskComponent implements OnInit {
  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;
  time: string;
  status: any = "";
  statusList: any = [];
  submitted = false;
  statusFilter: any = {};
  uploadList: any = [];
  log: any = {};
  constructor(private modalCtrl: ModalController, public formBuilder: FormBuilder,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private galleryService:GallaryService,
    private http: HttpClient,
    private envService: EnvService
    ) {

  }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);

  }

  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }
  ionViewWillEnter() {
    this.getStatusList();
    this.storageService.getUserLog().then((val) => {
      this.log = val;
    })
  }
  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }
  statusChange(event) {
    console.log(this.modalData.task_status);
  }
  compareWith(o1: any, o2: any) {
    return o1 && o2 ? o1._id === o2._id : o1 === o2;
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
          value: "task_status_master"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_STATIC_DATA')
        this.http.post(api, [obj], header).subscribe(
          respData => {
            // this.loaderService.hideLoader();
            if (respData['success'] && respData['success'].length > 0) {
              let success = respData['success'];
              success.forEach(element => {
                this.statusList = element.data;
              });
            } else
              this.statusList = [];

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
  async uploadDocument() {
    let result:any = await this.galleryService.getImageFromGallery();
    if (result && result['base64String']) {
      let fileName = `${new Date().getTime().toString()}.${result['format']}`;
      const uploadObj = {
        fileData: result['base64String'],
        fileExtn: result['format'],
        fileName: fileName,
        innerBucketPath: fileName,
        log: this.log
      }
      this.uploadList.push(uploadObj);
    }
    console.log(result);
  }
  updateTask() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);

        this.modalData['log'] = this.log;
        if (this.uploadList && this.uploadList.length > 0) {
          this.modalData.attachment = [{ uploadData: this.uploadList }];
        }
        let api = `${this.envService.baseUrl('SAVE_FORM_DATA')}/task_master`;
        this.http.post(api, this.modalData, header).subscribe(
          respData => {
            console.log(respData);
            this.loaderService.hideLoader();
            this._dismiss();
            if (respData.hasOwnProperty("success")) {
              this.storageService.presentToast('Saved Successfully!!!');
            }
            //alert('success' + respData);
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            this.storageService.presentToast('Error occurred while save...');
            //alert(err.error);
            console.log(err);
            // console.log(err.message);
            // console.log(err.status);
          }
        )

      }
    })

  }

}
