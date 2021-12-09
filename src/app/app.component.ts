import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalController, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';
import * as appConstants from './shared/app.constants';
import { AuthService, CoreUtilityService, StorageService, StorageTokenStatus, PermissionService, LoaderService, EnvService } from '@core/ionic-core';
import { StatusBar } from '@ionic-native/status-bar/ngx'; 
import { DataShareServiceService } from './service/data-share-service.service';

 
@Component({ 
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  cardListSubscription;
  private previousAuthState = false;
  userData: any;
  userInfo: any={};
  web_site:string='';

  gridData: any;
  cardData: any;
  cardList: any = [];
  menuItem: any;
  cardType: any;
  cardTypeList: any = {};
  collectionName: any;
  collectionNameList: any = [];

  @Output() collection_name = new EventEmitter<string>();

  selectedIndex= -1;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private coreUtilService:CoreUtilityService,
    private storageService:StorageService,
    private router: Router,
    private statusBar: StatusBar,
    private http: HttpClient,
    private loaderService: LoaderService,
    private envService: EnvService,
    private permissionService:PermissionService,
    private dataShareService:DataShareServiceService
  ) {
    this.cardListSubscription = this.dataShareService.cardList.subscribe(data =>{
      this.setCardList(data);
    })
    this.initializeApp();
    this.web_site = appConstants.siteName;
    // this.commonFunction();
    // this.cardTypeFunction();
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

  setCardList(cardList){
    this.cardList = cardList;
  }
  
  ngOnInit() {
    if (this.storageService.GetRefreshTokenTime() === true || this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_EXPIRED) {
      this.authService.refreshToken();
    } else if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
    //   this.commonFunction();
    //  this.cardTypeFunction();
      // this.router.navigateByUrl('/home4');
      
    } else {
      if(appConstants.loginWithMobile){
        this.router.navigateByUrl('auth/signin');
      }else{
        this.router.navigateByUrl('auth/signine');
      }
      
    }
    // this.authService.getUserPermission(false,'/home4');

    this.authService._user_info.subscribe(resp => {
      this.userInfo = resp;

      this.commonFunction();
      this.cardTypeFunction();
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

  //for getting cardmaster data
  commonFunction() {
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        // this.loaderService.showLoader(null);
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          // log: { userId: "kunalwebdeveloper11@gmail.com", appId: "DEVLP", refCode: "MCLR01" },
          log: await this.storageService.getUserLog(),
          pageNo: 0,
          pageSize: 50,
          value: "card_master"
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            // this.loaderService.hideLoader();
            //this.cardList = respData['data'];   
            this.dataShareService.setCardList(respData['data']);        
            // console.log(this.cardList);
          },
          (err: HttpErrorResponse) => {
            // this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })
  }

  //for getting card type master data
  cardTypeFunction() {
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        // this.loaderService.showLoader(null);
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          log: await this.storageService.getUserLog(),
          pageNo: 0,
          pageSize: 50,
          value: "card_type_master"
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            // this.loaderService.hideLoader();
            this.cardTypeList = respData['data'];
            // console.log(this.cardTypeList);
          },
          (err: HttpErrorResponse) => {
            // this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })
  }

  

  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    this.router.navigate(['cardview']);
    this.dataShareService.setcardData(card);
  }

  setData(){    
  }

}
