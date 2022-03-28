import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService, StorageService,LoaderService, CoreUtilityService, NotificationService, EnvService } from '@core/ionic-core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IonLoaderService } from 'src/app/service/ion-loader.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
    private coreUtilService: CoreUtilityService,
    private notificationService:NotificationService,
    private platform: Platform,
    private ionLoaderService: IonLoaderService,
    private envService: EnvService
  ) { 
    if(this.envService.getVerifyType() == "mobile"){
      this.VerifyType = true;
    }else{
     this.VerifyType = false;
    }
  }

  ngOnInit() {
    this.initForm();
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
  // showEmailIcon() {
  //   this.showicon = !this.loginForm.value.userId;
  // }
  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
