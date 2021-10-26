import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService, StorageService } from '@core/ionic-core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  isLoading = false;
  isLogin = true;
  isForget = false;
  isResetPass = false;
  isSavePass = false;
  private username: string;
  cognitoIdToken;
  loginObj: any = {};
  otpSent: boolean = false;
  userForm: FormGroup;
  submitted = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      // password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.userForm.controls; }

  // signUp() {
  //   let obj: any = {};
  //   obj.phone_number = "+91" + String(this.loginObj.mobileNo);
  //   obj.username = obj.phone_number;
  //   obj.name = this.loginObj.name;
  //   obj.email = this.loginObj.email;
  //   obj.password = this.loginObj.password;
  //   this.authService.mobileSignUp(obj);

  //   this.loginObj = {};
  // }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }
    let loginObj = this.userForm.value;
    let obj: any = {};
    obj.phone_number = "+91" + String(loginObj.mobileNo);
    obj.username = obj.phone_number;
    obj.name = loginObj.name;
    obj.email = loginObj.email;
    //obj.password = loginObj.password;
    this.authService.mobileSignUp(obj);
    this.userForm.reset();
  }

}
