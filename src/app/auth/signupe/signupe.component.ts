import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AppEnvService, AppStorageService, NotificationService } from '@core/ionic-core';
import { CustomvalidationService, AuthService, DataShareService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-signupe',
  templateUrl: './signupe.component.html',
  styleUrls: ['./signupe.component.scss']
})
export class SignupeComponent implements OnInit {


  signUpForm: FormGroup;
  showpassword = false;
  passwordNotMatch:boolean=false;
  confirmpassword = false;
  signUpErrorSubscribe: Subscription;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private storageService: AppStorageService,
    private envService:AppEnvService,
    private customValidationService: CustomvalidationService,
    private notificationService: NotificationService,
    private dataShareService: DataShareService
  ) { 
    // this.signUpErrorSubscribe = this.dataShareService.signUpResponse.subscribe(data =>{
    //   let color = "danger";
    //   if(data.response){
    //     color = "success";
    //   }
    //   if(data.responsemsg){
    //     if(data.present == 'alert'){
    //       this.notificationService.showAlert(data.responsemsg, data.header, ['Dismiss']);
    //     }else{          
    //       this.notificationService.presentToastOnBottom(data.responsemsg,color);
    //     }
    //   }
    // }) 
  }

  ngOnInit() {
    this.initForm();
  }
  ngDestroy(){
    if(this.signUpErrorSubscribe){
      this.signUpErrorSubscribe.unsubscribe();
    }
  }

  initForm(){
    this.signUpForm = new FormGroup({
      name: new FormControl ('', [Validators.required]),
      email: new FormControl ('', [Validators.required, Validators.email]),
      mobileNo: new FormControl ('', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]),
      password: new FormControl ('', [Validators.required, Validators.minLength(6)]),
      confpwd: new FormControl ('', [Validators.required]),
    },{ validators: this.customValidationService.MatchPassword('password','confpwd') }
    );
  }

  get f() { return this.signUpForm.controls; }

  onSubmit() {    
    if (this.signUpForm.invalid) {
      this.notificationService.presentToastOnBottom("Please fill all * mark fields","danger");
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
    //note: if autologin =true then set redirection= '/home', And if autologin =false then set redirection= '/auth/signine'
    const payload = { data:data, redirection:'/home',"autologin":true};
    // this.authService.appSignup(payload);
    this.signUpForm.reset();
    //this.router.navigate(['/auth/signine']);
  }

  showtxtpass() {
    this.showpassword = !this.showpassword;
  }
  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }
  passwordmismatch(){
    if((this.signUpForm.value.password === this.signUpForm.value.confpwd)){
      this.signUpForm.controls['confpwd'].setErrors(null);
      this.passwordNotMatch = false;
    }else{
      this.signUpForm.controls['confpwd'].setErrors({'invalid': true});
      this.passwordNotMatch = true;
    }
  }


}
