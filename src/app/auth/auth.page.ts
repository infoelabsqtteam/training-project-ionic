import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';


import * as appConstants from '../shared/app.constants';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { logging } from 'selenium-webdriver';
import { CoreUtilityService,StorageService,EndPoint, AuthService, AuthResponseData } from '@core/ionic-core';



@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  isForget = false;
  isResetPass = false;
  isSavePass = false;
  private username: string;
  cognitoIdToken;
  loginObj: any = {};
  otpSent: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService
  ) { }

  ngOnInit() { }


  sendOtp() {
    const api = appConstants.otpApi + this.loginObj.mobileNo + appConstants.autoGen;
    this.http.get(api).subscribe(resp => {
      if (resp.hasOwnProperty("Status") && resp['Status'] == "Success") {
        this.otpSent = true;
        this.loginObj.sessionId = resp['Details'];
        this.storageService.presentToast('Otp Sent !!');
      } else {

      }
    },
      (err: HttpErrorResponse) => {
        console.log(err.error);
      }
    )

  }
  verifyOtp() {
    const api = appConstants.verifyOtpApi + this.loginObj.sessionId + "/" + this.loginObj.otp_input;
    this.http.get(api).subscribe(resp => {
      if (resp.hasOwnProperty("Status") && resp['Status'] == "Success") {
        this.otpSent = true;
        this.loginObj.sessionId = resp['Details'];
        this.storageService.presentToast('Otp Matched !!');
        const obj = JSON.stringify({ authenticated: true, mobileNo: this.loginObj.mobileNo });
        this.storageService.setObject('userData', obj);
        this.coreUtilService.gotoPage('/home');
      } else {

      }
    },
      (err: HttpErrorResponse) => {
        console.log(err.error);

      }
    )

  }

  authenticate(email: string, password: string, name: string, mobile: string) {
    this.isLoading = true;
    
    // this.loadingCtrl
    //   .create({ keyboardClose: true, message: 'Logging in...' })
    //   .then(loadingEl => {
    //     loadingEl.present();
         let authObs: Observable<AuthResponseData>;
    if (this.isLogin) {
      //  authObs = this.authService.login(email, password);
       this.authService.login(email, password,'/home');
     } else {
      //  authObs = this.authService.signup(email, password,name,mobile);
      //  this.authService.signup(email, password, name, mobile);
     }

      //   authObs.subscribe(
      //     resData => {
      //       console.log(resData);
      //       this.isLoading = false;
      //       loadingEl.dismiss();
      //       this.router.navigateByUrl('/places/tabs/discover');
      //     },
      //     errRes => {
      //       loadingEl.dismiss();
      //       const code = errRes.error.error.message;
      //       let message = 'Could not sign you up, please try again.';
      //       if (code === 'EMAIL_EXISTS') {
      //         message = 'This email address exists already!';
      //       } else if (code === 'EMAIL_NOT_FOUND') {
      //         message = 'E-Mail address could not be found.';
      //       } else if (code === 'INVALID_PASSWORD') {
      //         message = 'This password is not correct.';
      //       }
      //       this.showAlert(message);
      //     }
      //   );
      // });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
  isForgeted(){
    this.isForget = true;
    this.isResetPass = true;
  }
  onLog(){
    this.isForget = false;
    this.isResetPass = false;
  }
  onResetPassword(form: NgForm){
    this.username = form.value.email;
    this.isSavePass = true;
     this.isResetPass = false;
     let email = form.value.email;
   
       this.authService.forgetPass(email);   
  }
  onSavePassword(form: NgForm){
    let otp = form.value.veriCode;
    let password = form.value.newPassword;
    // this.authService.saveNewPassword(this.username, otp, password)
    
  }
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    let email = form.value.email;
    let password = form.value.password;
    let name = form.value.fullname;
    let mobile = '+91'+form.value.mobile;
      // this.authService.login(email, password)
    this.authenticate(email, password, name, mobile);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
