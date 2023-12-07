import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/ionic-core';
import { CustomvalidationService, AuthService, AuthDataShareService, EnvService, StorageService } from '@core/web-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {


  signUpForm: UntypedFormGroup;
  showpassword = false;
  passwordNotMatch:boolean=false;
  confirmpassword = false;
  signUpErrorSubscribe: Subscription;
  title = "";
  logoPath = ''
  adminEmail='';
  template:string = "temp1";

  constructor(
    private authService: AuthService,
    private router: Router,
    private customValidationService: CustomvalidationService,
    private notificationService: NotificationService,
    private authDataShareService: AuthDataShareService,
    private envService: EnvService,
    private storageService: StorageService
  ) { 
    this.signUpErrorSubscribe = this.authDataShareService.signUpResponse.subscribe(data =>{
      this.signupResponse(data);
    }) 
  }

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.initForm();
    this.pageloded();
  }
  ngOnDestroy(){
    if(this.signUpErrorSubscribe){
      this.signUpErrorSubscribe.unsubscribe();
    }
  }
  // Angular LifeCycle Function Handling End--------------------
  
  // Form Creation Function Handling start--------------
  initForm(){
    this.signUpForm = new UntypedFormGroup({
      name: new UntypedFormControl ('', [Validators.required]),
      email: new UntypedFormControl ('', [Validators.required, Validators.email]),
      mobileNumber: new UntypedFormControl ('', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),Validators.maxLength(10),Validators.minLength(10)]),
      password: new UntypedFormControl ('', [Validators.required, this.customValidationService.patternValidator()]),
      confpwd: new UntypedFormControl ('', [Validators.required]),
      'admin': new UntypedFormControl(false),
    },{ validators: this.customValidationService.MatchPassword('password','confpwd') }
    );
  }
  // Form Creation Function Handling End--------------

  // Subscribed Variable Function Handling Start-------------------
  signupResponse(data){
    let color = "danger";
    let msg = data.msg;
    if(data && data.status == 'success'){
      this.signUpForm.reset();
      color = 'success';
      if(data && data.autoLogin){
        this.notificationService.presentToastOnTop(data.msg,color);
        this.authService.Signin(data.payload);
      }else{
        if(this.envService.getVerifyType() == 'mobile'){
          this.notificationService.presentToastOnTop(msg,color);
          this.authDataShareService.setOtpAutoLogin(data.payload);
          this.router.navigate(['otp_varify'+'/'+data?.payload?.userId]);
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
  }
  // Subscribed Variable Function Handling End-------------------

  // Click Functions Handling Start--------------------
  onSubmit() {    
    if (this.signUpForm.invalid) {
      this.notificationService.presentToastOnBottom("Please fill all * mark fields","danger");
      return;
    }
    const payload = this.signUpForm.getRawValue();
    let userId = "";
    if(this.envService.getVerifyType() == "mobile"){
      userId = payload['mobileNumber'];
    }else{
     userId = payload['email'];
    }    
    const hostName = this.envService.getHostName('origin');
    const domain = hostName + "/#/verify";
    delete payload['confpwd'];
    payload['domain'] = domain;
    payload['userId'] = userId;
    // const data = {email: email, password: password, name: name, mobileNumber: mobile, domain:"", userId: userId}
    //note: if autologin =true then set redirection= '/home', And if autologin =false then set redirection= '/signine'
    const payloadNew = { data:payload, redirection:'/signin',"autologin":false};
    this.authService.Signup(payloadNew);
  }

  showtxtpass() {
    this.showpassword = !this.showpassword;
  }
  showconfirmpass() {
    this.confirmpassword = !this.confirmpassword;
  }
  // Click Functions Handling End--------------------

  // Dependency Functions Handling Start -------------------
  get f() { return this.signUpForm.controls; }
  
  pageloded(){
    this.logoPath = this.storageService.getLogoPath() + "logo-signin.png";
    this.template = this.storageService.getTemplateName();
    this.title = this.storageService.getPageTitle();
    this.adminEmail = this.storageService.getAdminEmail();
  }
  // Dependency Functions Handling End -------------------

  // NOt In use
  // passwordmismatch(){
  //   if((this.signUpForm.value.password === this.signUpForm.value.confpwd)){
  //     this.signUpForm.controls['confpwd'].setErrors(null);
  //     this.passwordNotMatch = false;
  //   }else{
  //     this.signUpForm.controls['confpwd'].setErrors({'invalid': true});
  //     this.passwordNotMatch = true;
  //   }
  // }


}
