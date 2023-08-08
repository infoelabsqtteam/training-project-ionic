import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {  AppEnvService, NotificationService, AppStorageService } from '@core/ionic-core';
// import { ErrorMessageComponent } from 'src/app/component/error-message/error-message.component';

@Component({
  selector: 'app-changepwd',
  templateUrl: './changepwd.component.html',
  styleUrls: ['./changepwd.component.scss'],
})
export class ChangepwdComponent implements OnInit {
  // Switch between two function change the below value.
  VerifyType: boolean = false;

  // for old and new pwd functianality---------------------
  changepwdform:FormGroup;
  oldpassword = false;
  confirmpwd: any;
  oldpwd: string;
  // newpassword = false;
  // confirmpassword = false;
  // newpwd: any;
  // passwordNotMatch:boolean;

  // for Mobile OTP functianality
  fForm: FormGroup;
  confirmpassword = false;
  newpassword = false;
  vForm: FormGroup;
  username: string;
  resetPwd: boolean = true;
  newpwd: any;
  passwordNotMatch: boolean;
  userInfo :any;

  constructor(
    private router: Router,
    private storageService:AppStorageService,
    // private authService: AppAuthService,
    private notificationService:NotificationService,
    private formBuilder:FormBuilder,
    private envService:AppEnvService,
    // private errorMessage:ErrorMessageComponent
  ) { 
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }else{
     this.VerifyType = false;
    }
  }

  ngOnInit() {
    this.initForm();

    if(this.VerifyType == true){      
        // FOR OTP Functianallity uncomment below code
      this.autoFillUserInfo();
    }
  }

  // FOR OLD and NEW password Functianallity uncomment below code----------------

  initForm() {
    if(this.VerifyType == true){
      this.fForm = this.formBuilder.group({
        'userId': ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]],
      });
      this.vForm = this.formBuilder.group({
        'verifyCode': ['', [Validators.required]],
        'newpwd': ['', [Validators.required]],
        'confpwd': ['', [Validators.required]],
      });
    }else{
      this.changepwdform = this.formBuilder.group({
        'oldpwd': ['', [Validators.required]],
        'newpwd': ['', [Validators.required]],
        'confpwd': ['', [Validators.required]],
      });
    }
  }

  onChangePwd(){
      return !this.changepwdform.invalid;
  }
  
  get c() {return this.changepwdform.controls;}

  onSubmit(){
    if (this.changepwdform.invalid) {
      return;
    }
     const oldpwd = this.changepwdform.value.oldpwd;
     const newpwd = this.changepwdform.value.newpwd;
     const confirmpwd= this.changepwdform.value.confpwd;
    if(newpwd==confirmpwd)
    { 
      const payload =  {currentPassword: oldpwd, newPassword: newpwd, confirmNewPassword: confirmpwd };
      //  this.authService.changePassword(payload);
    }
    else{
      this.passwordNotMatch = false;
    }
  }

  oldpasswordmismatch(){
    if(this.changepwdform.value.newpwd === this.changepwdform.value.confpwd){ 
      this.changepwdform.controls['confpwd'].setErrors(null);;
      this.passwordNotMatch = false;
    }else{
      this.changepwdform.controls['confpwd'].setErrors({'invalid': true});
      this.passwordNotMatch = true;
    }
  }

  showoldpass() {
    this.oldpassword = !this.oldpassword;
  }

  // shownewpass() {
  //   this.newpassword = !this.newpassword;
  // }

  // showconfirmpass() {
  //   this.confirmpassword = !this.confirmpassword;
  // }

  ////////////////////------------------------------------------------------------------------
  // FOR OTP Functianallity uncomment below code
  

  autoFillUserInfo(){
    // this.authService._user_info.subscribe(resp => {
    //   this.userInfo = resp;      
    //   this.username = this.userInfo.mobile1;
    //   if(this.username != undefined && this.username != ''){
    //     this.fForm.get('userId').setValue(this.username);
    //   } 
    // })
  }

  onResetPwd() {
    if (this.fForm.invalid) {
      return;
    }
    // this.authService.forgetPass(this.username);
    this.resetPwd = false;
  }

  resendCode() {
    // this.authService.forgetPass(this.username);
  }
  
  onVerifyPwd() {
    if (this.vForm.invalid) {
      return;
    }
    const code = this.vForm.value.verifyCode;
    const password = this.vForm.value.password;
    const payload = { userId: this.username, code: code, newPassword: password };
    // this.authService.saveNewPassword(payload);   
  }
  
  get f() {return this.fForm.controls;}
  get r() {return this.vForm.controls;}
  
  shownewpass() {
    this.newpassword = !this.newpassword;
  }

  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }

  passwordmismatch(){
    if(this.vForm.value.password === this.vForm.value.confpwd){ 
      this.vForm.controls['confpwd'].setErrors(null);;
      this.passwordNotMatch = false;
    }else{
      this.vForm.controls['confpwd'].setErrors({'invalid': true});
      this.passwordNotMatch = true;
    }
  }
  
  homenavigate(){
    this.router.navigate(['/home'])
  }

}