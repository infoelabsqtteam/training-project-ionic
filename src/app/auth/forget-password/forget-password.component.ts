import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@core/ionic-core';
import { AuthDataShareService, AuthService, EnvService, StorageService } from '@core/web-core';

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
  forGotSubscription:any;
  title = "";
  template:string = "temp1";
  logoPath = '';
  forgetPasswordImage = 'assets/img/icons/forget-password.svg';

  constructor(
    private formBuilder: FormBuilder,
    private envService:EnvService,
    private authService: AuthService,
    private authDataShareService: AuthDataShareService,
    private storageService: StorageService,
    private notificationService: NotificationService
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
          msg = 'Verification code has been sent to your registered user id';
        }else{          
          this.authService.redirectToSignPage();
        }
        color = 'success';
        this.resetPwd = false;
      }else{
        if(msg === "UserId Entered is not correct"){
          msg = "Invald UserId, please enter registered UserId"
        }
      }
      if(msg != ''){
        this.notificationService.presentToastOnBottom(msg,color);
      }
    })
    // this.appNameSubscription = this.dataShareService.appName.subscribe(data =>{
    //   this.setAppName(data);
    // })
    this.pageloded();
  }

  ngOnInit() {
    this.initForm();
    // this.pageloded();
  }
  // setAppName(data){
  //   if (data.appName && data.appName.hasOwnProperty("appName")) {
  //     this.appName = data.appName["appName"]
  //   }
  // }

  initForm() {
    this.username = "";
    this.fForm = this.formBuilder.group({
      'userId': ['', [Validators.required]],
    });

    if(!this.VerifyType){
      this.fForm.get('userId').setValidators([Validators.email,Validators.required]);
    }else{
      this.fForm.get('userId').setValidators([Validators.required,Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]);
    }

    this.vForm = this.formBuilder.group({
      'verifyCode': ['', [Validators.required]],
      'password': ['', [Validators.required]],
      'confpwd': ['', [Validators.required]],
    });
  }

  onResetPwd() {
    if (this.fForm.invalid) {
      return;
    }
    this.username = this.fForm.value.userId;
    this.authService.TryForgotPassword(this.username);
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
