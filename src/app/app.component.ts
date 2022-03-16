import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';
import * as appConstants from './shared/app.constants';
import { AuthService, CoreUtilityService, StorageService, StorageTokenStatus, PermissionService, LoaderService, EnvService, App_googleService, NotificationService } from '@core/ionic-core';
import { StatusBar } from '@ionic-native/status-bar/ngx'; 
import { DataShareServiceService } from './service/data-share-service.service';
import { IonLoaderService } from './service/ion-loader.service';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { AndroidpermissionsService } from './service/androidpermissions.service';
// import { Network } from '@ionic-native/network/ngx';

 
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
  side_menu: boolean = true;

  gridData: any;
  cardData: any;
  cardList: any = [];
  menuItem: any;
  cardType: any;
  cardTypeList: any = {};
  collectionName: any;
  collectionNameList: any = [];

  // geoloaction
  coords:any;
  latitude: number;
  longitude:number;
  options: any;
  inputaddress: any;
  result: any;

  // Network status
  disconnectSubscription: any;
  connectSubscription: any;
  networkAlert:any;

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
    private dataShareService:DataShareServiceService,
    private ionLoaderService: IonLoaderService,
    private app_googleService: App_googleService,
    private nativeGeocoder:NativeGeocoder,
    private notificationService:NotificationService,
    private androidpermissionsService: AndroidpermissionsService,
    public alertController: AlertController,
    // private network: Network

  ) {
    // this.cardListSubscription = this.dataShareService.cardList.subscribe(data =>{
    //   this.setCardList(data);
    // })
   
    // this.checkInternetConnection();
    this.initializeApp();
    // this.web_site = appConstants.siteName;
    this.web_site = "ELABS";
  }

  initializeApp() {
    this.platform.ready().then(() => {
      window.addEventListener('offline', () => {
        this.androidpermissionsService.internetExceptionError();
      });
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        // SplashScreen.hide();
        setTimeout(() => {
          SplashScreen.hide();
        }),4000;
      }      

      //this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#e30010');
      // this.androidpermissionsService.internetPermission();
      // this.permissionService.requestPermisiions();
      // this.androidpermissionsService.checkPermission();
      // this.getCurrentLocation();

    });

  }

  async showNetworkAlert(){
    const alert = await this.alertController.create({
      header: 'No Internet Connection',
      backdropDismiss: false,
      message: 'You Do not have Internet Connection ',
      buttons: [{
        text: "OK",
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    });
    await alert.present();
  }

  setCardList(cardList){
    this.cardList = cardList;
  }
  
  ngOnInit() {
    // if (this.storageService.GetRefreshTokenTime() === true || this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_EXPIRED) {
    //   this.authService.refreshToken();
    // } else 
    if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
   
    //this.ionLoaderService.autohideLoader('Setting Up The App for You');
    this.commonFunction();
    this.authService.getUserPermission(false,'/home');
      this.router.navigateByUrl('/home');      
    } 
    // else {
    //   if(appConstants.loginWithMobile){
    //     this.router.navigateByUrl('auth/signine');
    //   }
    else{
      console.log("Token Not active");
      this.router.navigateByUrl('/auth/signine');
      // this.router.navigateByUrl('auth/signine');
    }
      
    // }

    this.authService._user_info.subscribe(resp => {
      if(resp!== null){
        this.userInfo = resp;
        this.dataShareService.setUserDetails(resp);
      }
      else{
        this.userInfo = this.dataShareService.getUserDetails();
      }
      // console.log(this.userInfo);
    })
    
    

    
  }
  
  async getCurrentLocation(){
    try{
      // const coordinates = await Geolocation.getCurrentPosition();
      const coordinates = await this.app_googleService.getUserLocation();
      this.coords = coordinates;
      console.log("coords:", this.coords);
      this.latitude = this.coords.lat;
      this.dataShareService.setCurrentLatitude(this.latitude);
      this.longitude = this.coords.lng;
      this.dataShareService.setCurrentLongitude(this.longitude);

      let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 1
      };
        this.nativeGeocoder.reverseGeocode(this.latitude, this.longitude, options)
      .then((result: NativeGeocoderResult[]) =>{
         this.result = (JSON.stringify(result[0]));
         console.log(this.result);
         
      })
      .catch((error: any) => console.log(error));

    }catch(e) {
      // this.notificationService.showAlert("GPS is unable to locate you.", 'Enable GPS',['OK']);
      console.log('Error getting location: ', e);
    }
  }

  forwardLocation(inputaddress){
    let options: NativeGeocoderOptions = {
      useLocale: false,
      maxResults: 1
    };
    this.nativeGeocoder.forwardGeocode(inputaddress, options)
      .then((result: NativeGeocoderResult[]) => console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude  ))
      .catch((error: any) => console.log(error));
  }
  
  
  ionViewWillEnter() {
    //this.commonFunctionService.getCurrentAddress();
  }
  onLogout() {
    // this.side_menu = false;
    // this.userInfo = '';
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
        this.ionLoaderService.autohideLoader('Please wait..');
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          log: await this.storageService.getUserLog(),
          pageNo: 0,
          pageSize: 50,
          value: "card_master"
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.cardList = respData['data'];   
            this.dataShareService.setCardList(respData['data']);
            this.loaderService.hideLoader();
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);
          }
        )
      }
    })
  }

  //for getting card type master data
  // cardTypeFunction() {
  //   this.storageService.getObject('authData').then(async (val) => {
  //     if (val && val.idToken != null) {
  //       var header = {
  //         headers: new HttpHeaders()
  //           .set('Authorization', 'Bearer ' + val.idToken)
  //       }
  //       this.loaderService.showLoader(null);
  //       let obj = {
  //         crList: [],
  //         key1: "MCLR01",
  //         key2: "CRM",
  //         log: await this.storageService.getUserLog(),
  //         pageNo: 0,
  //         pageSize: 50,
  //         value: "card_type_master"
  //       }
  //       let api = this.envService.baseUrl('GET_GRID_DATA')
  //       this.http.post(api + '/' + 'null', obj, header).subscribe(
  //         respData => {
  //           this.loaderService.hideLoader();
  //           this.cardTypeList = respData['data'];
  //         },
  //         (err: HttpErrorResponse) => {
  //           this.loaderService.hideLoader();
  //           console.log(err.error);
  //           // console.log(err.name);
  //           // console.log(err.message);
  //           // console.log(err.status);
  //         }
  //       )
  //     }
  //   })
  // }

  

  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    this.router.navigate(['crm/quotation']);
    this.dataShareService.setcardData(card);
  }

  setData(){    
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
