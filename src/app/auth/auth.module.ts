import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
// import { AuthPage } from './auth.page';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
// import { AuthGuard } from './auth.guard';
// import { SignineComponent } from './signine/signine.component';
// import { SignupeComponent } from './signupe/signupe.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangepwdComponent } from './changepwd/changepwd.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { VerifyCompanyComponent } from './verify-company/verify-company.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SigninOldComponent } from './signinOld/signin.component';
import { SignupOldComponent } from './signupOld/signup.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: AuthPage,
//     children: [
//       // { path: 'signin', component: SigninComponent, },
//       // { path: 'signup', component: SignupComponent },
//       // { path: 'signine', component: SignineComponent, },
//       // { path: 'signupe', component: SignupeComponent },
//       // { path: 'forgetpassword', component: ForgetPasswordComponent },
//       // { path: 'changepwd', component: ChangepwdComponent },
//       // { path: 'verifyotp/:username', component: VerifyOtpComponent },
//       // { path: 'verifyCompany', component: VerifyCompanyComponent }
//     ]

//   }
// ];

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
    SigninOldComponent,
    SignupOldComponent,
    ForgetPasswordComponent,
    ChangepwdComponent,
    VerifyOtpComponent,
    VerifyCompanyComponent
  ]
})
export class AuthModule { }
