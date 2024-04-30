import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoaderService, NotificationService } from '@core/ionic-core';
import { AlertController, IonInput, Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { StorageService, ApiCallService, AwsSecretManagerService, DataShareService } from '@core/web-core';

@Component({
  selector: 'app-verify-company',
  templateUrl: './verify-company.component.html',
  styleUrls: ['./verify-company.component.scss'],
})
export class VerifyCompanyComponent implements OnInit {

  @ViewChild('companyCode') companyCode: IonInput;

  cCodeForm: UntypedFormGroup;
  isValidCode = false;
  isExitAlertOpen: boolean = false;
  
  constructor(    
    private formBuilder: UntypedFormBuilder,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private _location: Location,
    private platform: Platform,
    private alertController: AlertController,
    private notificationService: NotificationService,
    private loaderService: LoaderService,
    private apiCallService: ApiCallService,
    private awsSecretManagerService : AwsSecretManagerService
  ) { }

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){
    // this.onload();
  }
  ionViewDidEnter() {
    this.companyCode.setFocus();
    this.exitTheApp();
    this.initForm();
  }
  // Ionic LifeCycle Function Handling End--------------------

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.onload();
    this.initForm();
  }
  // Angular LifeCycle Function Handling Start--------------------

  // Form Creation Function Handling Start--------------------  
  initForm() {
    this.cCodeForm = this.formBuilder.group({
      'code': ['', [Validators.required,]],
    });
    this.cCodeForm.value.code = '';
    // this.cCodeForm.get('code').setValidators([]);
  }
  // Form Creation Function Handling End--------------------
  
  // Hardware Button Click Function Handling Start--------------------
  exitTheApp(){ 
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/checkcompany')) {
        let isloaderOpen:any = this.loaderService.loadingCtrl.getTop();
        if(isloaderOpen){
          this.loaderService.hideLoader();
        }
        if(this.isExitAlertOpen){
          this.notificationService.presentToastOnBottom("Please Click On the exit button to exit the app.");
        }else{
          this.showExitConfirm();
          // processNextHandler();
        }
      } else {
        // Navigate to back page
        console.log('Navigate to back page');
        this._location.back();
      }
    });
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
  // Hardware Button Click Function Handling End--------------------

  // Click Function Handling Start--------------------
  async verifyCompanyCode(){
    let clientCode:string = this.cCodeForm.value.code;
    let hostname = await this.awsSecretManagerService.getserverHostByAwsOrLocal(clientCode);
    if(hostname || clientCode === "localhost"){
      this.storageService.removeDataFormStorage('all');
      this.loaderService.showLoader("Please wait while we are setting up the App for you.");
      setTimeout(async () => {        
        await this.checkLoader();
      }, 10000);
      this.storageService.setClientNAme(clientCode);
      this.storageService.setHostNameDinamically(hostname+"/rest/");
      this.dataShareService.shareServerHostName(hostname);
      this.apiCallService.getApplicationAllSettings();
    }else{
      this.cCodeForm.controls['code'].setErrors({'invalid': true});
    }
  }
  checkLoader() {
    new Promise(async (resolve)=>{
      let checkLoader = await this.loaderService.loadingCtrl.getTop();
      if(checkLoader && checkLoader['hasController']){
        this.loaderService.hideLoader();
        if(checkLoader['textContent'] === "Please wait while we are setting up the App for you."){
          this,this.notificationService.presentToastOnBottom("Something went wrong, please try again.");
        }
      }
    });
  }
  infoAlert(){
    this.alertController.create({
      header: 'Code ?',
      message: 'It is a code shared by your admin. Normally it is for example - <br /><strong>ApplicationId-ReferenceCode</strong>',
      backdropDismiss: false,
      buttons: [{
        text: 'Done',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }
  // Click Function Handling End--------------------

  // Dependency Functions Handling Start------------------
  async onload(){
    // let keyList = await this.storageService.getKetList();
    await this.storageService.removeDataFormStorage();
    this.storageService.removeDataFormStorage();
  }
  // Dependency Functions Handling End------------------

  // Functions NOt in use -----------  
  // get ccform() { return this.cCodeForm.controls;}
  
  

}
