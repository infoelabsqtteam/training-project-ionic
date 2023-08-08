import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AppEnvService, AppStorageService, NotificationService } from '@core/ionic-core';
import { CustomvalidationService, AuthService, AuthDataShareService, EnvService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {


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
    private appEnvService:AppEnvService,
    private customValidationService: CustomvalidationService,
    private notificationService: NotificationService,
    private authDataShareService: AuthDataShareService,
    private envService: EnvService
  ) { 
    this.signUpErrorSubscribe = this.authDataShareService.signUpResponse.subscribe(data =>{
      let color = "danger";
      let msg = data.msg;
      if(data && data.status == 'success'){
        this.signUpForm.reset();
        color = 'success';
        if(this.envService.getVerifyType() == 'mobile'){
          this.notificationService.presentToastOnTop(msg,color);
          this.authDataShareService.setOtpAutoLogin(data.payload);
          this.router.navigate(['otp_varify'+'/'+data?.payload?.userId]);
        }else{
          if(data && data.autoLogin){
            this.notificationService.presentToastOnTop(data.msg,color);
            this.authService.Signin(data.payload);
          }else{
            if(data.appPresentAlert){
              let header = '';
              if(msg == 'A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process.'){
                header = 'Successfully Registered';
              }else if(msg == 'OTP has been sent to your registered Mobile no.'){
                header = 'OTP sent successfully';
              }
              this.notificationService.showAlert(msg, header, ['Dismiss']);
            }else{
              this.notificationService.presentToastOnTop(msg,color);
            }
            this.authService.redirectToSignPage();
          }
        }
      }else{
        this.notificationService.presentToastOnTop(data.msg, color);
      }
    }) 
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
    if(this.appEnvService.getVerifyType() == "mobile"){
      userId = mobile;
    }else{
     userId = email;
    }
    
    const hostName = this.envService.getHostName('origin');
    const domain = hostName + "/#/verify";
    const data = {email: email, password: password, name: name, mobileNumber: mobile, domain:"", userId: userId}
    //note: if autologin =true then set redirection= '/home', And if autologin =false then set redirection= '/signine'
    const payload = { data:data, redirection:'/signin',"autologin":false};
    this.authService.Signup(payload);
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
