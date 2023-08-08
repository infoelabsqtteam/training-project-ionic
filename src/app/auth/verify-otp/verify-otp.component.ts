import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEnvService, CoreFunctionService, NotificationService } from '@core/ionic-core';
import { StorageService, AuthService, AuthDataShareService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit {

  OtpVarify: FormGroup;
  isVerify:boolean = false;
  logoPath:string = '';
  imageTitle:string = '';
  appTitle:string = '';
  OtpErrorSubscribe: Subscription;


  constructor(
    private routers: ActivatedRoute,
    private authService:AuthService,
    private envService:AppEnvService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private coreFunctionService: CoreFunctionService,
    private authDataShareService: AuthDataShareService,
    private notificationService: NotificationService
  ) { 
    this.OtpErrorSubscribe = this.authDataShareService.otpResponse.subscribe(data =>{
      let color = "danger";
      let msg = data.msg;
      if(data && data.status == 'success'){
        color = 'success';
        msg = data.msg;
        this.notificationService.presentToastOnTop(msg,color);
        if(data && data.appAutologin){
          this.authService.Signin(this.authDataShareService.getOtpAutoLogin());
        }else{
          this.authService.redirectToSignPage();
        }
      }else{
        this.notificationService.presentToastOnTop(data.msg, color);
      }
    });
  }

  ngOnInit() {
    this.initForm();
    this.routers.paramMap.subscribe(params => {
      let username = '';
      username = params.get('username'); 
      if(username != undefined && username != ''){
        this.OtpVarify.get('username').setValue(username);
        if(!this.OtpVarify.get('username').disabled){
          this.OtpVarify.get('username').disable()
        } 
      }    
    });
  }

  initForm(){
    this.OtpVarify = this.formBuilder.group({
      username: ['', [Validators.required]],
      verifyCode: ['', [Validators.required]]
    });
    if(this.envService.getVerifyType() == "mobile"){
      this.isVerify = true;
    }else{
      this.isVerify = false;
    }
  }

  onVerifyAccWithOtp() { 
    const value  = this.OtpVarify.getRawValue(); 
    const user = value['username'];
    const code = value['verifyCode'];
    const data = {"user":user,"code":code}
    const payload = {data:data, redirection:'/signin', autologin:false};
    this.authService.userVarify(payload);
  }

  get f() { return this.OtpVarify.controls; }
  resendCode() {
    // this.resetPwd = true;
    // this.authService.forgetPass(this.username);
  }  
  async getLogoPath(){
    if(this.coreFunctionService.isNotBlank(this.storageService.getApplicationSetting())){
      this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
      this.imageTitle = this.storageService.getPageTitle();
      this.appTitle = this.storageService.getPageTitle();
    }
  }

}
