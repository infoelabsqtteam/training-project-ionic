import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { AuthService, StorageService, CoreUtilityService, EnvService } from '@core/ionic-core';


@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnInit {
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  name: any;
  searchData: any = [];
  constructor(private modalCtrl: ModalController,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private coreUtilService:CoreUtilityService,
    private storageService: StorageService,
    private http: HttpClient,
    private envService: EnvService
    ) { }

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

  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }
  onChangeValue(param) {
    if (param.length > 2) {
      let data = this.modalData;
      this.storageService.getObject('authData').then((val) => {
        if (val && val.idToken != null) {
          var header = {
            headers: new HttpHeaders()
              .set('Authorization', 'Bearer ' + val.idToken)
          }
          // this.loaderService.showLoader(null);

          this.storageService.getUserLog().then((val) => {
            data['log'] = val;
          })
          let api = this.envService.baseUrl('GET_STATIC_DATA')
          data.crList[0].fValue = param;
          let param_list = [data];
          this.http.post(api, param_list, header).subscribe(
            respData => {
              //this.loaderService.hideLoader();
              if (respData['success'] && respData['success'].length > 0) {
                let success = respData['success'];
                success.forEach(element => {
                  this.searchData = element.data;
                });
              } else
                this.searchData = [];
            },
            (err: HttpErrorResponse) => {
              //this.loaderService.hideLoader();
              console.log(err.error);
              // console.log(err.name);
              // console.log(err.message);
              // console.log(err.status);
            }
          )
        }
      })
    }

  }
  onClose(param) {
    param = "";
    this.searchData = [];
  }
  selectData(data) {
    this.modal.dismiss(data);
  }

}
