import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService, EnvService, StorageService } from '@core/ionic-core';

@Component({
  selector: 'lib-signupe',
  templateUrl: './signupe.component.html',
  styleUrls: ['./signupe.component.scss']
})
export class SignupeComponent implements OnInit {


  signUpForm: FormGroup;
  showpassword = false;
  passwordNotMatch:boolean;
  confirmpassword = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: StorageService,
    private envService:EnvService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.signUpForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]],
      password: ['', [Validators.required]],
      confpwd: ['', [Validators.required]],
    });
  }

  get f() { return this.signUpForm.controls; }

  onSubmit() {    
    if (this.signUpForm.invalid) {
      return;
    }
    const email = this.signUpForm.value.email;
    const password = this.signUpForm.value.password;
    const name = this.signUpForm.value.name;
    const mobile = this.signUpForm.value.mobileNo;
    let userId = "";
    if(this.envService.getVerifyType() == "mobile"){
      userId = mobile;
    }else{
     userId = email;
    }
    
    const data = {email: email, password: password, name: name, mobileNumber: mobile, domain:"", userId: userId}
    const payload = { data:data, redirection:'/auth/verifyotp'};
    this.authService.signup(payload);
    // this.signUpForm.reset();
    //this.router.navigate(['/auth/signine']);
  }

  showtxtpass() {
    this.showpassword = !this.showpassword;
  }
  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }
  passwordmismatch(){
    if(this.signUpForm.value.password !== this.signUpForm.value.confpwd && this.signUpForm.value.confpwd != '')
    { 
      this.passwordNotMatch = true;
    }else{
      this.passwordNotMatch = false;
    }
  }


}
