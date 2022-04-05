import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';
import { AuthService, StorageService, StorageTokenStatus,App_googleService, RestService, ApiService, DataShareService } from '@core/ionic-core';
import { StatusBar } from '@ionic-native/status-bar/ngx'; 
import { DataShareServiceService } from './service/data-share-service.service';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { AndroidpermissionsService } from './service/androidpermissions.service';

 
@Component({ 
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  cardListSubscription;
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
  gridDataSubscription:any;

  @Output() collection_name = new EventEmitter<string>();

  selectedIndex= -1;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private storageService:StorageService,
    private router: Router,
    private statusBar: StatusBar,
    private dataShareServiceService:DataShareServiceService,
    private app_googleService: App_googleService,
    private nativeGeocoder:NativeGeocoder,
    private androidpermissionsService: AndroidpermissionsService,
    private alertController: AlertController,
    private restService: RestService,
    private apiService: ApiService,
    private dataShareService: DataShareService

  ) {
    
    this.initializeApp();
    // this.web_site = appConstants.siteName;
    this.web_site = "ELABS";
    this.gridDataSubscription = this.dataShareService.gridData.subscribe(data =>{
      this.cardList = data.data;
    })
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

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }
  
  
  
  ngOnInit() {
    
    if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
      this.getGridData();
      this.authService.getUserPermission(false,'/home');
      this.router.navigateByUrl('/home');      
    } 
    else{
      console.log("Token Not active");
      this.router.navigateByUrl('/auth/signine');
    }

    this.authService._user_info.subscribe(resp => {
      if(resp!== null){
        this.userInfo = resp;
        this.dataShareServiceService.setUserDetails(resp);
      }
      else{
        this.userInfo = this.dataShareServiceService.getUserDetails();
      }
    })
  }
  
  async getCurrentLocation(){
    try{
      const coordinates = await this.app_googleService.getUserLocation();
      this.coords = coordinates;
      console.log("coords:", this.coords);
      this.latitude = this.coords.lat;
      this.dataShareServiceService.setCurrentLatitude(this.latitude);
      this.longitude = this.coords.lng;
      this.dataShareServiceService.setCurrentLongitude(this.longitude);

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

  

  
  getGridData(criteria?){
    let criteriaList = [];
    if(criteria){
      criteriaList = criteria;
    }
    const params = 'card_master';
    let data = this.restService.getPaylodWithCriteria(params,'',criteria,{});
    data['pageNo'] = 0;
    data['pageSize'] = 50;
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getGridData(payload);
  }

  
  

  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    this.router.navigate(['card-view']);
    this.dataShareServiceService.setcardData(card);
  }

  setData(){    
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
