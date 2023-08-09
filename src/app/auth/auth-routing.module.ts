import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangepwdComponent } from './changepwd/changepwd.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { VerifyCompanyComponent } from './verify-company/verify-company.component';

const authRoutes : Routes = [
    { path: 'signin', component: SigninComponent, },
    { path: 'signup', component: SignupComponent },
    { path: 'forgetpassword', component: ForgetPasswordComponent },
    { path: 'changepwd', component: ChangepwdComponent },
    { path: 'otp_varify/:username', component: VerifyOtpComponent },
    { path: 'verifyCompany', component: VerifyCompanyComponent }
];



@NgModule({
    imports : [
        RouterModule.forChild(authRoutes)
        ],
    exports:[
        RouterModule
        ]
    
})
export class AuthRoutingModule{
    
}