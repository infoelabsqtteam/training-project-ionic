import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@core/ionic-core';
import { StorageService, AuthService, AuthDataShareService, CoreFunctionService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit {

  OtpVarify: UntypedFormGroup;
  isVerify:boolean = false;
  logoPath:string = '';
  imageTitle:string = '';
  appTitle:string = '';
  OtpErrorSubscribe: Subscription;


  constructor(
    private routers: ActivatedRoute,
    private authService:AuthService,
    private formBuilder: UntypedFormBuilder,
    private storageService: StorageService,
    private coreFunctionService: CoreFunctionService,
    private authDataShareService: AuthDataShareService,
    private notificationService: NotificationService
  ) { 
    this.OtpErrorSubscribe = this.authDataShareService.otpResponse.subscribe(data =>{
      this.otpResponse(data);
    });
  }
  
  // Angular LifeCycle Function Handling Start--------------------
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
  // Angular LifeCycle Function Handling End--------------------

  // Subscribed Variable Function Handling Start-------------------
  otpResponse(data){
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
  }
  // Subscribed Variable Function Handling End-------------------

  // Form Creation Function Handling Start--------------
  initForm(){
    this.OtpVarify = this.formBuilder.group({
      username: ['', [Validators.required]],
      verifyCode: ['', [Validators.required]]
    });
    if(this.storageService.getVerifyType() == "mobile"){
      this.isVerify = true;
    }else{
      this.isVerify = false;
    }
  }
  // Form Creation Function Handling End--------------

  // Click Function Handling Start-------------------------
  onVerifyAccWithOtp() { 
    const value  = this.OtpVarify.getRawValue(); 
    const user = value['username'];
    const code = value['verifyCode'];
    const data = {"user":user,"code":code}
    const payload = {data:data, redirection:'/signin', autologin:false};
    this.authService.userVarify(payload);
  }
  // Click Function Handling End----------------

  // Dependancy Function Handling Start-------------------
  get f() { return this.OtpVarify.controls; }
   
  async getLogoPath(){
    if(this.coreFunctionService.isNotBlank(this.storageService.getApplicationSetting())){
      this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
      this.imageTitle = this.storageService.getPageTitle();
      this.appTitle = this.storageService.getPageTitle();
    }
  }
  // Dependancy Function Handling End-------------------

  // NOt In use but call in html, need to use this function  
  resendCode() {
  //   // this.resetPwd = true;
  //   // this.authService.forgetPass(this.username);
  } 

}
