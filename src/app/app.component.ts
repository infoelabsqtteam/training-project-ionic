import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalController, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';
import * as appConstants from './shared/app.constants';
import { AuthService, CoreUtilityService, StorageService, StorageTokenStatus, PermissionService } from '@core/ionic-core';
import { StatusBar } from '@ionic-native/status-bar/ngx';

 
@Component({ 
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  userData: any;
  userInfo: any={};
  web_site:string='';

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private coreUtilService:CoreUtilityService,
    private storageService:StorageService,
    private router: Router,
    private statusBar: StatusBar,
    private http: HttpClient,
    private permissionService:PermissionService
  ) {
    this.initializeApp();
    this.web_site = appConstants.siteName;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }

      //this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#e30010');
      this.permissionService.requestPermisiions();
    });

  }

  ngOnInit() {
    if (this.storageService.GetRefreshTokenTime() === true || this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_EXPIRED) {
      this.authService.refreshToken();
    } else if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
      this.router.navigateByUrl('tab/home');
    } else {
      if(appConstants.loginWithMobile){
        this.router.navigateByUrl('auth/signin');
      }else{
        this.router.navigateByUrl('auth/signine');
      }
      
    }
    this.authService.getUserPermission(false);

    this.authService._user_info.subscribe(resp => {
      this.userInfo = resp;
    })


  }
  ionViewWillEnter() {
    //this.commonFunctionService.getCurrentAddress();
  }
  onLogout() {
    this.authService.logout('/auth/signine');
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
