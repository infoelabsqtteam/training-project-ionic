import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthPage } from './auth.page';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { SignineComponent } from './signine/signine.component';
import { SignupeComponent } from './signupe/signupe.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

const routes: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      { path: 'signin', component: SigninComponent, },
      { path: 'signup', component: SignupComponent },
      { path: 'signine', component: SignineComponent, },
      { path: 'signupe', component: SignupeComponent },
      { path: 'forgetpassword', component: ForgetPasswordComponent },
    ]

  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AuthPage, 
    SigninComponent, 
    SignupComponent,
    SignineComponent,
    SignupeComponent,
    ForgetPasswordComponent
  ]
})
export class AuthPageModule { }
