import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService, DataShareService, EnvService, NotificationService, StorageService } from '@core/ionic-core';
import { AlertController, IonInput, IonRouterOutlet, Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-verify-company',
  templateUrl: './verify-company.component.html',
  styleUrls: ['./verify-company.component.scss'],
})
export class VerifyCompanyComponent implements OnInit {

  @ViewChild('companyCode') companyCode: IonInput;

  cCodeForm: FormGroup;
  isValidCode = false;
  isExitAlertOpen: boolean = false;
  
  constructor(    
    private formBuilder: FormBuilder,
    private envService: EnvService,
    private authService: AuthService,
    private dataShareService: DataShareService,
    private storageService: StorageService,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private _location: Location,
    private platform: Platform,
    private alertController: AlertController,
    private notificationService: NotificationService
  ) { }

  ionViewWillEnter(){
    // this.onload();
  }
  ionViewDidEnter() {
    this.companyCode.setFocus();
  }
  ngOnInit() {
    this.onload();
    this.exitTheApp();
    this.initForm();
  }
  exitTheApp(){ 
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/auth/verifyCompany')) {
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
  async onload(){
    let keyList = await this.storageService.getKetList();
    await this.storageService.clearStorage();
    this.storageService.removeDataFormStorage();
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
  initForm() {
    this.cCodeForm = this.formBuilder.group({
      'code': ['', [Validators.required,]],
    });
    this.cCodeForm.value.code = '';
    // this.cCodeForm.get('code').setValidators([]);
  }
  
  get ccform() { return this.cCodeForm.controls;}
  
  verifyCompanyCode(){
    let clintCode:string = this.cCodeForm.value.code;
    let isClientExist = this.envService.checkClientExistOrNot(clintCode);
    if(isClientExist){
      this.dataShareService.subscribeClientName(clintCode);
      this.authService.navigateByUrl('auth/signine');
    }else{
      this.cCodeForm.controls['code'].setErrors({'invalid': true});
    }
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

}
