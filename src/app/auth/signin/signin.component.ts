import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import {  NotificationService } from '@core/ionic-core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IonLoaderService } from 'src/app/service/ion-loader.service';
import { App } from '@capacitor/app';
import { ApiCallService, AuthDataShareService, AuthService, CoreFunctionService, EnvService, StorageService, StorageTokenStatus } from '@core/web-core';

@Component({
  selector: 'app-signine',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {


  loginForm: UntypedFormGroup;
  showpassword = false;
  VerifyType : boolean = false;
  isExitAlertOpen:boolean = false;
  logoPath:string = '';
  imageTitle:string = '';
  appTitle:string = '';
  authenticationMessage: Subscription;
  resetSignin:any;
  userInfoSubscribe:any;
  sessionSubscribe:any;
  signinReponseData:any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private alertController: AlertController,
    private storageService: StorageService,
    private coreFunctionService: CoreFunctionService,
    private notificationService:NotificationService,
    private platform: Platform,
    private ionLoaderService: IonLoaderService,
    private envService: EnvService,
    private authDataShareService: AuthDataShareService,
    private apiCallService: ApiCallService
  ) { 
    this.initializeApp();    
  }

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){
    this.initializeApp();
    // this.getLogoPath();
    this.checkValues();
  }
  ionViewDidEnter(){
    this.getLogoPath();
    this.onLoadSubscriptions();
  }
  ionViewWillLeave(){
    console.log('leaving');
  }
  ionViewDidLeave(){
    this.unsubscribed();
  }
  // Ionic LifeCycle Function Handling End -----------------------
  
  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.initForm();
  }
  ngOnDestroy(){
    
  }
  // Angular LifeCycle Function Handling End--------------------
  
  // Form Creation Function Handling start--------------
  initForm(){
    if(this.storageService.getVerifyType() == 'mobile' || this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }
    this.loginForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      userId: ['', [Validators.required]],
    });
    if(!this.VerifyType){
      this.loginForm.get('userId').setValidators([Validators.email,Validators.required]);
    }else{
      this.loginForm.get('userId').setValidators([Validators.required,Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]);
    }
  }
  // Form Creation Function Handling End--------------

  // subscribe Varibale rather than Constructor start-------- 
  initializeApp() {
    this.platform.ready().then(() => {});
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      let isloaderOpen:any = this.ionLoaderService.loadingController.getTop();
      if(isloaderOpen){
        this.ionLoaderService.hideLoader();
      }
      if(this.isExitAlertOpen){
        this.notificationService.presentToastOnBottom("Please Click On the exit button to exit the app.");
      }else{
        this.showExitConfirm();
        // processNextHandler();
      }  
    });
  } 
  onLoadSubscriptions(){
    this.userInfoSubscribe = this.authDataShareService.userInfo.subscribe(data =>{ 
      let color = 'danger';
      if(data && data.msg){
        this.notificationService.presentToastOnTop(data.msg, color);
      }    
    });
    this.resetSignin = this.authDataShareService.settingData.subscribe(data =>{      
      if(data == "logged_in"){
        this.ionLoaderService.hideLoader();
        this.notificationService.presentToastOnTop(this.signinReponseData.msg,'success');
        this.loginForm.reset();
      }
      this.signinReponseData = '';
    });
    this.sessionSubscribe = this.authDataShareService.sessionexpired.subscribe(data =>{      
      let color = 'danger';
      if(data && data.msg && data.status == 'success'){
        this.notificationService.presentToastOnTop(data.msg, color);
      }    
    });
    this.authenticationMessage = this.authDataShareService.signinResponse.subscribe(data => {
      this.signinResponse(data);
    })
  }
  // subscribe Varibale rather than Constructor End----------
  
  // Subscribed Variable Function Handling Start-------------------
  signinResponse(res){
    let msg = res.msg;
    let color = "danger";
    if(res && res.message && res.message == 'reset'){
      this.notificationService.presentToast('info', 'Password expired !!!');
      this.router.navigate(['createpwd']);
    }else if(res && res.message && res.message == 'notify'){
      // if(res.msg != '' && res.status != 'success') {
      //   this.notificationService.presentToastOnTop(msg,color);
      // }
      if(res.status == 'success') {
        this.ionLoaderService.showLoader("Checking Permissions..");
        color = 'success';
        this.signinReponseData = res;
        this.authService.GetUserInfoFromToken(this.storageService.GetIdToken(), '/home');
      }
    }else if(res && res.status == 'success'){
      this.ionLoaderService.showLoader("Checking Permissions..");
      color = 'success';
      this.signinReponseData = res;
      this.authService.GetUserInfoFromToken(this.storageService.GetIdToken(), '/home');
    }
    if(msg != '' && res.status != 'success'){
      this.notificationService.presentToastOnTop(msg,color);
    }
  }
  // Subscribed Variable Function Handling End--------------------

  // Unsubscribe Variables Start--------------------  
  unsubscribed(){
    if(this.authenticationMessage){
      this.authenticationMessage.unsubscribe();
    }
    if(this.sessionSubscribe){
      this.sessionSubscribe.unsubscribe();
    }
    if(this.resetSignin){
      this.resetSignin.unsubscribe();
    }
    if(this.userInfoSubscribe){
      this.userInfoSubscribe.unsubscribe();
    }
  }
  // Unsubscribe Variables End--------------------

  // Click Functions Handling Start--------------------
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    let loginObj = this.loginForm.value; 
    let payload = { userId: loginObj.userId, password: loginObj.password }
    this.authService.Signin(payload);
  }
  changeCode(){
    this.storageService.removeDataFormStorage('all');
    this.router.navigateByUrl('/checkcompany');
    this.resetVariables();
  }
  showtxtpass() {
    this.showpassword = !this.showpassword;
  }
  // Click Functions Handling End--------------------

  // Hardware Button Click Functions Handling Start-------------  
  showExitConfirm() {
    this.isExitAlertOpen = true;
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
          this.isExitAlertOpen = false;
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        cssClass: 'danger',
        handler: () => {
          this.isExitAlertOpen = false;
          App.exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }  
  // Hardware Button Click Functions Handling End-------------

  // Dependency Functions Handling Start -------------------
  async checkValues(){    
    let isClientCodeExist:any = this.storageService.getClientName();
    let isHostNameExist:any = this.storageService.getHostNameDinamically();
    if(this.coreFunctionService.isNotBlank(isClientCodeExist)){
      if(this.checkIdTokenStatus()){
        this.authService.GetUserInfoFromToken(this.storageService.GetIdToken(), '/home');
      }else if(!this.checkApplicationSetting() && this.coreFunctionService.isNotBlank(isHostNameExist) && isHostNameExist != '/rest/'){
        this.apiCallService.getApplicationAllSettings();
      }else{        
        this.storageService.removeKeyFromStorage("USER");
      }
    }else{
      this.router.navigateByUrl('/checkcompany');
    }
  }
  async getLogoPath(){
    let appsetting = await this.storageService.getApplicationSetting()
    if(this.coreFunctionService.isNotBlank(appsetting)){
      this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
      this.imageTitle = this.storageService.getPageTitle();
      this.appTitle = this.storageService.getPageTitle();
      let loader:any = await this.ionLoaderService.loadingController.getTop();
      if(loader){
        this.ionLoaderService.hideLoader();
      }
    }
  }
  checkIdTokenStatus(){
    let tokenStatus = false;
    if (this.storageService != null && this.storageService.GetIdToken() != null) {      
      if(this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE){
        tokenStatus = true;           
      }else{
        tokenStatus = false; 
      }
    }else{
      tokenStatus = false; 
    }
    return tokenStatus;
  }
  resetVariables(){
    this.logoPath = '';
    this.imageTitle = '';
    this.appTitle = '';
  }
  checkApplicationSetting(){
    let exists = false;
    let applicationSetting = this.storageService.getApplicationSetting();
    if(applicationSetting){
      exists = true;
    }else{
      exists = false;
    }
    return exists;
  }
  checkValidate(){
    return !this.loginForm.valid;
  }
  get f() { return this.loginForm.controls; }
  // Dependency Functions Handling Start -------------------
  
  // NOt in Use Functions--------------  
  // comingSoon() {
  //   this.notificationService.presentToastOnBottom('Comming Soon...');
  // }

}
