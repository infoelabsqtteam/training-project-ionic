import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService, StorageService,LoaderService, CoreUtilityService, NotificationService, EnvService } from '@core/ionic-core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';

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
    private platform: Platform,
    private envService:EnvService,
    private dataShareService: DataShareServiceService,
  ) { 
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }else{
     this.VerifyType = false;
    }
    // this.appNameSubscription = this.dataShareService.appName.subscribe(data =>{
    //   this.setAppName(data);
    // })
    // this.pageloded();
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
    this.authService.forgetPass(this.username);
    this.resetPwd = false;
  }

  resendCode() {
    this.authService.forgetPass(this.username);
  }
  
  onVerifyPwd() {
    if (this.vForm.invalid) {
      return;
    }
    const code = this.vForm.value.verifyCode;
    const password = this.vForm.value.password;
    const payload = { userId: this.username, code: code, newPassword: password };
    this.authService.saveNewPassword(payload);   
  }
  get f() {return this.fForm.controls;}
  get r() {return this.vForm.controls;}

  pageloded(){
    // this.logoPath = this.envService.getLogoPath() + "logo-signin.png";
    // this.template = this.envService.getTemplateName();
    // this.title = this.envService.getHostKeyValue('title');
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
