import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangepwdComponent } from './changepwd/changepwd.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { VerifyCompanyComponent } from './verify-company/verify-company.component';
import { AuthGuard } from '@core/web-core';

const authRoutes : Routes = [
    { path: 'signin', component: SigninComponent, },
    { path: 'signup', component: SignupComponent },
    { path: 'forgetpassword', component: ForgetPasswordComponent },
    { path: 'createpwd', component: ChangepwdComponent, canActivate: [AuthGuard]  },
    { path: 'otp_varify/:username', component: VerifyOtpComponent },
    { path: 'checkcompany', component: VerifyCompanyComponent }
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