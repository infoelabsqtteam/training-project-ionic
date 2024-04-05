import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangepwdComponent } from './changepwd/changepwd.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { VerifyCompanyComponent } from './verify-company/verify-company.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ],
  declarations: [
    SigninComponent, 
    SignupComponent,
    ForgetPasswordComponent,
    ChangepwdComponent,
    VerifyOtpComponent,
    VerifyCompanyComponent
  ]
})
export class AuthModule { }
