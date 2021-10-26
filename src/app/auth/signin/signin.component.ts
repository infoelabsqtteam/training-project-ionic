import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService, StorageService,LoaderService, CoreUtilityService, NotificationService } from '@core/ionic-core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  time: BehaviorSubject<String> = new BehaviorSubject("00:00");
  timer: number;
  interval;
  isLoading = false;
  isLogin = true;
  isForget = false;
  isResetPass = false;
  isSavePass = false;
  private username: string;
  cognitoIdToken;
  loginObj: any = {};
  otpSent: boolean = false;
  otpForm: FormGroup;
  otpVerifyForm: FormGroup;
  backbutton: any;
  subscription: Subscription;
  resendOtp: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
    private coreUtilService: CoreUtilityService,
    private notificationService:NotificationService,
    private platform: Platform
  ) {

  }

  ngOnInit() {
    this.otpForm = this.formBuilder.group({
      mobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
    });
    this.otpVerifyForm = this.formBuilder.group({
      otp_input: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  ionViewWillEnter() {
    this.otpSent = false;
  }


  get f() { return this.otpForm.controls; }
  get v() { return this.otpVerifyForm.controls; }

  sendOtp() {
    let mobileNo = String(this.loginObj.mobileNo);
    if (mobileNo.startsWith("+91")) {
      this.loginObj.mobileNo = mobileNo;
    } else {
      this.loginObj.mobileNo = "+91" + mobileNo;
    }
    this.startWatching();    
    this.authService.signinOtp({ username: this.loginObj.mobileNo }).subscribe(resp => {
      this.loaderService.hideLoader();
      console.log(resp);
      if (resp.hasOwnProperty("success")) {
        this.authService._otpRresponse.next(resp['success'].session);
        this.otpSent = true;
        this.startTimer(3);
      } else if (resp.hasOwnProperty('error')) {
        this.notificationService.showAlert(resp['message'], 'Authentication Failed',['Okay']);
      }
    },
      (err: HttpErrorResponse) => {
        this.loaderService.hideLoader();
        // loadingEl.dismiss();
        this.notificationService.showAlert(err['message'], 'Authentication Failed',['Okay']);
        this.loginObj = {};
        console.log(err.error);
        console.log(err.name);
        console.log(err.message);
        console.log(err.status);
      });

  }
  onSubmit() {
    // stop here if form is invalid
    if (this.otpForm.invalid) {
      return;
    }
    let loginObj = this.otpForm.value;
    this.loginObj.mobileNo = loginObj.mobileNo;
    this.sendOtp();
    this.otpForm.reset();
  }
  verifyOtp() {
    if (this.otpVerifyForm.invalid) {
      return;
    }
    let obj = { username: this.loginObj.mobileNo, verif_code: this.otpVerifyForm.value.otp_input };
    this.authService.verifyOtp(obj);
    this.otpVerifyForm.reset();
  }
  goBackToOtp() {
    this.otpSent = false;
  }
  startTimer(duration: number) {
    clearInterval(this.interval);
    this.timer = duration * 60;
    this.interval = setInterval(() => {
      this.updateTimerValue();
    }, 1000)
  }

  updateTimerValue() {
    let minutes: any = this.timer / 60;
    let seconds: any = this.timer % 60;

    minutes = String('0' + Math.floor(minutes)).slice(-2);
    seconds = String('0' + Math.floor(seconds)).slice(-2);

    const text = `${minutes} : ${seconds}`;
    this.time.next(text);
    --this.timer;
    if (this.timer < 0) {
      this.resendOtp = true;
      clearInterval(this.interval);
    }

  }
  startWatching() {
    console.log("start watching");
    this.coreUtilService.startWatching()
      .then((res: any) => {
        const otp = String(res.Message).substr(4, 6);
        this.otpVerifyForm.controls['otp_input'].setValue(Number(otp));
      })
      .catch((error: any) => {
        //alert(JSON.stringify(error));
        console.log(error)
      });
  }
}
