import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '@core/ionic-core';



@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  isForget = false;
  isResetPass = false;
  isSavePass = false;
  private username: string;
  cognitoIdToken;
  loginObj: any = {};
  otpSent: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  ngOnInit() { }

}
