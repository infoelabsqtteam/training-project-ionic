import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CallLog, CallLogObject } from '@ionic-native/call-log/ngx';
import { ModalController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService, StorageService,LoaderService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss'],
})
export class CallLogsComponent implements OnInit {
  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;

  callHistory: any = [];

  constructor(private modalCtrl: ModalController,
    private callLog: CallLog, private authService: AuthService,
    private http: HttpClient, private router: Router, private storageService: StorageService,
    public toastController: ToastController, private loaderService: LoaderService,private coreUtilService:CoreUtilityService) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
    if (this.modalData.callHistory && this.modalData.callHistory.length > 0) {
      this.callHistory = this.modalData.callHistory;
    } else {
      this.callHistory = [];
    }

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

          let api = this.coreUtilService.baseUrl('SAVE_FORM_DATA')
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
