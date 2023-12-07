import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/ionic-core';
import { EnvService, AuthService, AuthDataShareService, CustomvalidationService, StorageService } from '@core/web-core';
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
  changepwdform:UntypedFormGroup;
  oldpassword = false;
  confirmpwd: any;
  oldpwd: string;
  // newpassword = false;
  // confirmpassword = false;
  // newpwd: any;
  // passwordNotMatch:boolean;

  // for Mobile OTP functianality
  fForm: UntypedFormGroup;
  confirmpassword = false;
  newpassword = false;
  vForm: UntypedFormGroup;
  username: string;
  resetPwd: boolean = true;
  newpwd: any;
  passwordNotMatch: boolean;
  userInfo :any;
  changepwdSubscribe:any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService:NotificationService,
    private formBuilder:UntypedFormBuilder,
    private envService: EnvService,
    private authDataShareService: AuthDataShareService,
    private customValidationService: CustomvalidationService,
    private storageService: StorageService
  ) { 
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }else{
     this.VerifyType = false;
    }
    this.changepwdSubscribe = this.authDataShareService.createPwd.subscribe(data =>{
      let color = 'danger';
      let msg = data.msg;
      if(data && data.status == "success"){
        color = 'success';
        if(data.msg === "Your Password has been updates successfully"){
          msg = 'Password changed successfully, please relogin';
          this.authService.Logout("");
        }
      }
      if(msg != ''){
        this.notificationService.presentToastOnBottom(msg,color);
      }
    })
  }
  
  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.initForm();

    if(this.VerifyType == true){      
        // FOR OTP Functianallity uncomment below code
      this.autoFillUserInfo();
    }
  }
  // Angular LifeCycle Function Handling End--------------------

  // Form Creation Function Handling start--------------
  initForm() {
    if(this.VerifyType == true){
      this.fForm = this.formBuilder.group({
        'userId': ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]],
      });
      this.vForm = this.formBuilder.group({
        'verifyCode': ['', [Validators.required]],
        'newpwd': ['', [Validators.required, this.customValidationService.patternValidator()]],
        'confpwd': ['', [Validators.required]],
      });
    }else{
      this.changepwdform = this.formBuilder.group({
        'oldpwd': ['', [Validators.required]],
        'newpwd': ['', [Validators.required, this.customValidationService.patternValidator()]],
        'confpwd': ['', [Validators.required]],
      });
    }
  }
  // Form Creation Function Handling End--------------

  // Click Functions Handling Start--------------------  
  homenavigate(){
    this.router.navigate(['/home'])
  }
  onSubmit(){
    if (this.changepwdform.invalid) {
      return;
    }
     const oldpwd = this.changepwdform.value.oldpwd;
     const newpwd = this.changepwdform.value.newpwd;
     const confirmpwd= this.changepwdform.value.confpwd;
    if(newpwd==confirmpwd){ 
      const payload =  {currentPassword:oldpwd, newPassword:newpwd, confirmNewPassword:confirmpwd };
       this.authService.changePassword(payload);
    }
    else{
      this.passwordNotMatch = false;
    }
  }
  showoldpass() {
    this.oldpassword = !this.oldpassword;
  }
  shownewpass() {
    this.newpassword = !this.newpassword;
  }
  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }
  onChangePwd(){
    return !this.changepwdform.invalid;
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
    this.authService.SaveNewPassword(payload);  
  }
  // Click Functions Handling End--------------------

  // Dependency Function Handling Start -------------------
  get c() {return this.changepwdform.controls;}  
  get f() {return this.fForm.controls;}
  get r() {return this.vForm.controls;}
  autoFillUserInfo(){
    // this.authService._user_info.subscribe(resp => {
      this.userInfo = this.storageService.GetUserInfo;      
      this.username = this.userInfo.mobile1;
      if(this.username != undefined && this.username != ''){
        this.fForm.get('userId').setValue(this.username);
      } 
    // })
  }
  // Dependency Function Handling End -------------------

  // Ion Change Functions Handling Start --------------------
  oldpasswordmismatch(){
    if(this.changepwdform.value.newpwd === this.changepwdform.value.confpwd){ 
      this.changepwdform.controls['confpwd'].setErrors(null);;
      this.passwordNotMatch = false;
    }else{
      this.changepwdform.controls['confpwd'].setErrors({'invalid': true});
      this.passwordNotMatch = true;
    }
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
  // Ion Change Functions Handling End --------------------   

  // NOt In use Functions------------------
  // shownewpass() {
  //   this.newpassword = !this.newpassword;
  // }

  // showconfirmpass() {
  //   this.confirmpassword = !this.confirmpassword;
  // }

}