import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@core/ionic-core';
import { AuthDataShareService, AuthService, CustomvalidationService, EnvService, StorageService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {

  fForm: FormGroup;
  confirmpassword = false;
  newpassword = false;
  vForm: FormGroup;
  username: string;
  resetPwd: boolean = true;
  newpwd: any;
  passwordNotMatch: boolean;
  VerifyType : boolean = false;
  forGotSubscription:Subscription;
  resetPassSubscription:Subscription;
  title = "";
  template:string = "temp1";
  logoPath = '';
  forgetPasswordImage = 'assets/img/icons/forget-password.svg';
  adminEmail='';

  constructor(
    private envService:EnvService,
    private authService: AuthService,
    private authDataShareService: AuthDataShareService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private customvalidationService: CustomvalidationService
  ) { 
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true; 
    }else{
     this.VerifyType = false;
    }    
    this.forGotSubscription = this.authDataShareService.forgot.subscribe(data =>{
      let color = 'danger';
      let msg = data.msg;
      if(data && data.status == "success"){
        if(data.msg === "Reset password is successful, notification with a verification code has been sent to your registered user id"){
          msg = 'Verification code has been sent to your registered UserId';
        }else{ 
          msg = data.msg;
        }
        color = 'success';
        this.resetPwd = false;
      }else{
        if(data && data.status == "error" && msg == "UserId Entered is not correct"){
          msg = "Invalid UserId, please enter registered UserId"
        }
      }
      if(msg != ''){
        this.notificationService.presentToastOnBottom(msg,color);
      }
    })
    this.resetPassSubscription = this.authDataShareService.resetPass.subscribe(data =>{
      let color = 'danger';
      let msg = data.msg;
      if(data && data.msg != '' && data.status == "success") {
        color = 'success';
        this.gobackandreset();
        this.fForm.reset();
      }
      if(msg != ''){
        this.notificationService.presentToastOnBottom(msg,color);
      }
      if(data && data.status == 'success') {
        this.authService.redirectToSignPage();
      }
    })
  }

  ngOnInit() {
    this.initForm();
    this.pageloded();
  }
  ngOnDestroy(){
    if(this.forGotSubscription){
      this.forGotSubscription.unsubscribe();
    }
    if(this.resetPassSubscription){
      this.resetPassSubscription.unsubscribe();
    }
  }

  initForm() {
    this.username = "";
    this.fForm = new FormGroup({
      'userId': new FormControl('', [Validators.required]),
      "admin": new FormControl(false)
    });

    if(!this.VerifyType){
      this.fForm.get('userId').setValidators([Validators.email,Validators.required]);
    }else{
      this.fForm.get('userId').setValidators([Validators.required,Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]);
    }

    this.vForm = new FormGroup({
      'verifyCode': new FormControl('', [Validators.required]),
      'password': new FormControl('', [Validators.required,this.customvalidationService.patternValidator()]),
      'confpwd': new FormControl('', [Validators.required]),
    });
  }

  onResetPwd() {
    if (this.fForm.invalid) {
      return;
    }
    this.username = this.fForm.value.userId;
    let admin = this.fForm.value.admin;
    let payload = {userId:this.username,admin:admin};
    this.authService.TryForgotPassword(payload);
  }

  resendCode() {
    this.authService.TryForgotPassword(this.username);
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
  get f() {return this.fForm.controls;}
  get r() {return this.vForm.controls;}

  pageloded(){
    this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
    this.template = this.storageService.getTemplateName();
    this.title = this.envService.getHostKeyValue('title');
    this.adminEmail = this.storageService.getAdminEmail();
  }

  shownewpass() {
    this.newpassword = !this.newpassword;
  }
  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }

  passwordmismatch(){
    if((this.vForm.value.password === this.vForm.value.confpwd)){
      this.vForm.controls['confpwd'].setErrors(null);;
      this.passwordNotMatch = false;
    }else{
      this.vForm.controls['confpwd'].setErrors({'invalid': true});
      this.passwordNotMatch = true;
    }
  }
  gobackandreset(){
    this.resetPwd=!this.resetPwd;
    this.vForm.reset();
  }
    
}
