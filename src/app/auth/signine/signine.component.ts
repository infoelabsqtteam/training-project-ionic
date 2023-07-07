import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, IonRouterOutlet } from '@ionic/angular';
import { AuthService, StorageService, NotificationService, EnvService, CoreFunctionService, StorageTokenStatus } from '@core/ionic-core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IonLoaderService } from 'src/app/service/ion-loader.service';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';

@Component({
  selector: 'lib-signine',
  templateUrl: './signine.component.html',
  styleUrls: ['./signine.component.scss']
})
export class SignineComponent implements OnInit {


  loginForm: FormGroup;
  showpassword = false;
  VerifyType : boolean = false;
  // showicon = false;
  isExitAlertOpen:boolean = false;
  logoPath:string = '';
  imageTitle:string = '';
  appTitle:string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private storageService: StorageService,
    private coreFunctionService: CoreFunctionService,
    private notificationService:NotificationService,
    private platform: Platform,
    private ionLoaderService: IonLoaderService,
    private envService: EnvService,
    private routerOutlet: IonRouterOutlet,
    private _location: Location,
  ) { 
    this.initializeApp();
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }else{
     this.VerifyType = false;
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {});
    let isClientCodeExist:any = this.storageService.getClientCode();
    let isHostNameExist:any = this.storageService.getHostNameDinamically();
    if(this.coreFunctionService.isNotBlank(isClientCodeExist) && this.checkIdTokenStatus()){   
      this.authService.getUserPermission(false,'/home');
      // this.router.navigateByUrl('/home');
    }else if(this.coreFunctionService.isNotBlank(isClientCodeExist) && this.coreFunctionService.isNotBlank(isHostNameExist) && isHostNameExist != '/rest/'){
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
    }else{
      this.router.navigateByUrl('/auth/verifyCompany');
    }

  }
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
  ngOnInit() {
    this.initForm();
    this.getLogoPath();
  }
  initForm(){
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
  checkValidate(){
    return !this.loginForm.valid;
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    let loginObj = this.loginForm.value; 
    this.authService.login(loginObj.userId, loginObj.password,'/home');
    this.loginForm.reset();
  }
  showtxtpass() {
    this.showpassword = !this.showpassword;
  }
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...');
  }
  changeCode(){
    this.storageService.removeDataFormStorage();
    this.authService.navigateByUrl('/auth/verifyCompany');
    this.resetVariables();
  }
  resetVariables(){
    this.logoPath = '';
    this.imageTitle = '';
    this.appTitle = '';
  }
  getLogoPath(){
    if(this.coreFunctionService.isNotBlank(this.storageService.getApplicationSetting())){
      this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
      this.imageTitle = this.storageService.getPageTitle();
      this.appTitle = this.storageService.getPageTitle();
      let loader:any = this.ionLoaderService.loadingController.getTop();
      if(loader){
        this.ionLoaderService.hideLoader();
      }
    }else{
      this.getLogoPath();
    }
  }

}
