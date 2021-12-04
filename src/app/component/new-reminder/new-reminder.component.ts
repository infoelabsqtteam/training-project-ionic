import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { DatePipe } from '@angular/common';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { now } from '@ionic/core/dist/types/utils/helpers';
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-new-reminder',
  templateUrl: './new-reminder.component.html',
  styleUrls: ['./new-reminder.component.scss'],
})
export class NewReminderComponent implements OnInit {
  @Input() modalData: any;
  @Input() lastName: string;
  @Input() modal: any;
  time: string;
  subject: string;
  defaultDate:string = new Date().toISOString();

  myForm: FormGroup;
  submitted = false;

  constructor(private modalCtrl: ModalController, public formBuilder: FormBuilder,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private envService: EnvService
    ) { }

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

  fetchDate(e) {
    let date = e.target.value;
    this.myForm.get('date').patchValue(date, {
      onlyself: true
    })

  }
  // fetchTime(e) {
  //   let time = this.dateFormat.transform(new Date(e.target.value), 'h:mm A');

  //   this.myForm.get('lead_time').patchValue(time, {
  //     onlyself: true
  //   })
  // }
  get errorCtr() {
    return this.myForm.controls;
  }

  onSubmit() {
    const value = this.myForm.value;
    this.modalData.time = value.time;
    this.modalData.date = value.date
    this.modalData.subject = value.subject;
    this.saveReminder(this.modalData);
    this.myForm.reset();
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

          let api = this.envService.baseUrl('SAVE_FORM_DATA')
          this.http.post(api + '/' + 'leads_reminder', data, header).subscribe(
            respData => {
              this.loaderService.hideLoader();
              this.storageService.presentToast('Saved Successfully!!!');
              //alert('success' + respData);
            },
            (err: HttpErrorResponse) => {
              this.loaderService.hideLoader();
              this.storageService.presentToast('Error occurred while save...');
              alert(err.error);
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
