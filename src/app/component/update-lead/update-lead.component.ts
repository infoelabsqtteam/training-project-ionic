import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { AuthService, StorageService, LoaderService, CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-update-lead',
  templateUrl: './update-lead.component.html',
  styleUrls: ['./update-lead.component.scss'],
})
export class UpdateLeadComponent implements OnInit {
  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;
  time: string;
  subject: string;

  myForm: FormGroup;
  submitted = false;

  constructor(public formBuilder: FormBuilder,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);

    this.myForm = this.formBuilder.group({
      time: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    });

  }
  ionViewWillEnter() {

  }
  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }

  // @HostListener('window:popstate', ['$event'])
  // dismissModal() {
  //   this.modal.dismiss();
  // }

  _dismiss() {
    this.modal.dismiss();
  }

  async searchCity() {
    const crList = [{ fName: "altname", fValue: "", operator: "stwic" }]
    const modal = await this.modalController.create({
      component: SearchModalComponent,
      componentProps: {
        "modalData": { crList: crList, key1: "MCLR01", key2: "CRM", log: { userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01" }, pageNo: 0, pageSize: 100, value: "city" },
        "headerVaue": "Search City"
      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        if (data['data'] != undefined)
          this.modalData.city = data['data'];
        console.log(data); // Here's your selected user!
      });
    return await modal.present();
  }

  onSubmit() {

    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);

        this.storageService.getUserLog().then((val) => {
          this.modalData['log'] = val;

          let api = `${this.coreUtilService.baseUrl('SAVE_FORM_DATA')}/leads_master`;
          this.http.post(api, this.modalData, header).subscribe(
            respData => {
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
