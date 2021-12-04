import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { UpdateLeadComponent } from '../update-lead/update-lead.component';
import { PickerController } from "@ionic/angular";
import { PickerOptions } from "@ionic/core";
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-call-feedback',
  templateUrl: './call-feedback.component.html',
  styleUrls: ['./call-feedback.component.scss'],
})
export class CallFeedbackComponent implements OnInit {

  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;
  time: string;
  status: any = "";
  deposition: any = "";
  statusList: any = [];
  depositionList: any = [];
  myForm: FormGroup;
  submitted = false;
  minDate: any;
  maxDate: any;
  minTime: string;
  maxTime: string;
  btnDisable: boolean = true;

  constructor(private modalCtrl: ModalController, public formBuilder: FormBuilder,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private pickerController: PickerController,
    private envService: EnvService
  ) {
    this.minDate = new Date().toJSON().split('T')[0];
    this.maxDate = new Date(new Date().setFullYear(2050)).toJSON().split('T')[0];
    let date = new Date().getHours()
    this.minTime = this.formatTime(new Date());
  }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
    this.modalData.start_datetime = new Date();
  }

  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }
  ionViewWillEnter() {
    this.modalData.deposition_text = "";
    //this.getLeadsStatus();
    this.getDepositinText();
    this.modalData.comment = "";
  }
  formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes;
    return strTime;
  }
  // @HostListener('window:popstate', ['$event'])
  // dismissModal() {
  //   //this.modalController.dismiss();
  // }

  _dismiss() {
    this.modal.dismiss();
  }

  fetchDate(e) {
    this.modalData.date = new Date(e.target.value);
    //console.log(this.modalData.date);
    this.checkButtonDisable(this.modalData);
  }

  onSubmit() {
    this.saveReminder(this.modalData);
  }

  getLeadsStatus() {
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
          value: "leads_status_master"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            //this.loaderService.hideLoader();
            this.statusList = respData['data'];

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
  getDepositinText() {
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
          value: "deposition_predefine_message"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            //this.loaderService.hideLoader();
            this.depositionList = respData['data']
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
  statusChange(event) {
    if (event.detail.value) {
      this.modalData.lead_status = {
        _id: event.detail.value._id,
        name: event.detail.value.lead_status,
        code: event.detail.value.serialId
      }
    }
  }
  depositionChange(event) {
    if (event.detail.value) {
      this.modalData.deposition_text = event.detail.value.name
      if (event.detail.value['lead_status'] && event.detail.value['lead_status'] != null) {
        this.modalData.lead_status = event.detail.value['lead_status'];
      }
      if (this.modalData.deposition_text.toLowerCase() === "not interested" || this.modalData.deposition_text.toLowerCase() === "busy") {
        this.modalData.hours = null;
        this.modalData.days = null;
      }
      this.checkButtonDisable(this.modalData);
    }
  }
  timePicker(event) {
    //console.log(new Date(event.detail.value).toLocaleTimeString());
    this.modalData.time = new Date(event.detail.value).toLocaleTimeString();
    this.checkButtonDisable(this.modalData);
  }

  saveReminder(data) {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);

        this.storageService.getUserLog().then((val) => {
          data['log'] = val;

          let api = `${this.envService.baseUrl('SAVE_FORM_DATA')}/call_feedback`;
          this.http.post(api, data, header).subscribe(
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
  async updateLead(modalData: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateLeadComponent,
      componentProps: {
        "modalData": modalData,
        "lastName": "Welcome"
      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {

      });

    return await modal.present();
  }
  checkButtonDisable(data: any) {
    if (this.modalData.deposition_text.toLowerCase() === "insufficient data" || this.modalData.deposition_text.toLowerCase() === "onboarded" || this.modalData.deposition_text.toLowerCase() === "wrong no") {
      this.btnDisable = false;
    } else if (this.modalData.deposition_text && (this.modalData.deposition_text.toLowerCase() === "not interested" || this.modalData.deposition_text.toLowerCase() === "busy") && (this.modalData.comment && this.modalData.comment.length === 0)) {
      this.btnDisable = true;
    } else if (this.modalData.deposition_text && (this.modalData.deposition_text.toLowerCase() === "not interested" || this.modalData.deposition_text.toLowerCase() === "busy") && (this.modalData.comment && this.modalData.comment.length > 1)) {
      this.btnDisable = false;
    } else if (this.modalData.deposition_text && this.modalData.hours && this.modalData.days) {
      this.btnDisable = false;
    } else {
      this.btnDisable = true;
    }
  }

  async showDaysPicker() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            this.modalData.days = value.Days.text;
            this.checkButtonDisable(this.modalData)
            console.log(value);
          }
        }
      ],
      columns: [{
        name: 'Days',
        options: this.getColumnOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }
  async showHourPicker() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            console.log(value);
            this.modalData.hours = value.Hrs.text;
            this.checkButtonDisable(this.modalData)
          }
        }
      ],
      columns: [{
        name: 'Hrs',
        options: this.getHourOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }
  async showMinutesPicker() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            console.log(value);
            this.modalData.minutes = value.mins.text;
            this.checkButtonDisable(this.modalData)
          }
        }
      ],
      columns: [{
        name: 'mins',
        options: this.getMinsOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }
  showOnTopChange(showOnTop) {
    if (showOnTop) {
      this.btnDisable = false;
    } else {
      this.btnDisable = true;
    }
  }

  getColumnOptions() {
    let options = [];
    for (let i = 0; i <= 30; i++) {
      options.push({ value: "Day", text: String(i) });
    }

    return options;
  }
  getHourOptions() {
    let options = [];
    for (let i = 1; i <= 24; i++) {
      options.push({ value: "Day", text: String(i) });
    }
    return options;

  }
  getMinsOptions() {
    let options = [];
    for (let i = 1; i <= 60; i++) {
      options.push({ value: "mins", text: String(i) });
    }
    return options;
  }
  sendMessage(ph) {
    window.open('https://api.whatsapp.com/send?phone=' + ph);
  }

}
