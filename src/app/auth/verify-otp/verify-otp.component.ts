import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppAuthService, AppEnvService } from '@core/ionic-core';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit {

  OtpVarify: FormGroup;
  isVerify:boolean = false;


  constructor(
    private routers: ActivatedRoute,
    private authService:AppAuthService,
    private envService:AppEnvService,
    private formBuilder: FormBuilder,
  ) { }

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
    const payload = {data:data, redirection:'/auth/signine'};
    this.authService.userVarify(payload);
  }

  get f() { return this.OtpVarify.controls; }
  resendCode() {
    // this.resetPwd = true;
    // this.authService.forgetPass(this.username);
  }

}
