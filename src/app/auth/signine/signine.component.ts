import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService, StorageService,LoaderService, CoreUtilityService, NotificationService } from '@core/ionic-core';
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
    private ionLoaderService: IonLoaderService
  ) { }

  ngOnInit() {
    this.initForm();
  }
  initForm(){
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
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
    this.authService.login(loginObj.email, loginObj.password,'/home');
    this.loginForm.reset();
  }

  showtxtpass() {
    this.showpassword = !this.showpassword;
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
