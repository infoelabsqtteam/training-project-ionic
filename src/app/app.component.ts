import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Subscription } from 'rxjs';
import { AppStorageService, App_googleService, NotificationService } from '@core/ionic-core';
import { StatusBar } from '@ionic-native/status-bar/ngx'; 
import { DataShareServiceService } from './service/data-share-service.service';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { AndroidpermissionsService } from './service/androidpermissions.service';
import { Title } from '@angular/platform-browser';
import { AuthService, ApiService, CommonFunctionService, DataShareService, StorageService, CommonAppDataShareService, AuthDataShareService, MenuOrModuleCommonService, EnvService, CoreFunctionService, StorageTokenStatus } from '@core/web-core';

 
@Component({ 
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  userData: any;
  userInfo: any={};
  web_site:string='';
  app_Version: String = '';

  gridData: any;
  cardData: any;
  cardList: any = [];
  menuItem: any;
  cardType: any;
  cardTypeList: any = {};
  collectionName: any;
  collectionNameList: any = [];
  showSidebarMenu : boolean = false;

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
  gridDataSubscription: Subscription;
  appCardMasterDataSize:number;

  @Output() collection_name = new EventEmitter<string>();

  selectedIndex= -1;
  themeSettingSubscription: Subscription;
  applicationSettingSubscription: Subscription;
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  themeName:any = '';
  clinetNameSubscription: Subscription;
  loginAndLogoutResponce: Subscription;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private statusBar: StatusBar,
    private dataShareServiceService:DataShareServiceService,
    private app_googleService: App_googleService,
    private nativeGeocoder: NativeGeocoder,
    private androidpermissionsService: AndroidpermissionsService,
    private apiService: ApiService,
    private dataShareService: DataShareService,
    private notificationService: NotificationService,
    private commonAppDataShareService: CommonAppDataShareService,
    private titleService:Title,
    private coreFunctionService: CoreFunctionService,
    private commonFunctionService: CommonFunctionService,
    private authDataShareService: AuthDataShareService,
    private menuOrModuleCommonService: MenuOrModuleCommonService,    
    private envService: EnvService,
    private appStorageService: AppStorageService

  ) {
    
    this.appCardMasterDataSize = this.appStorageService.getAppCardMasterDataSize();
    
    this.initializeApp();
    
    // this.web_site = appConstants.siteName;
    let newdate = new Date().getFullYear()
    this.app_Version  = newdate +"@" + this.envService.getAppName();
    this.gridDataSubscription = this.dataShareService.gridData.subscribe(data =>{
      if(data && data.data && data.data.length > 0){
        // this.cardList = data.data;
        this.cardList = this.menuOrModuleCommonService.getUserAutherisedCards(data.data);
      }else{
        console.log("Something went wrong, please try again later");
      }
    });
    if(this.dataShareService.themeSetting != undefined){
      this.themeSettingSubscription = this.dataShareService.themeSetting.subscribe(
        data =>{
          const themeSetting = data;
          if(themeSetting && themeSetting.length > 0) {
            const settingObj = themeSetting[0];
            this.storageService.setThemeSetting(settingObj);
            this.envService.setThemeSetting(settingObj);
            this.dataShareService.resetThemeSetting([]);            
          }
        })
    }
    if(this.dataShareService.applicationSetting != undefined){
      this.applicationSettingSubscription = this.dataShareService.applicationSetting.subscribe(
        data =>{
          const applicationSetting = data;
          if(applicationSetting && applicationSetting.length > 0) {
            const settingObj = applicationSetting[0];
            this.storageService.setApplicationSetting(settingObj);
            this.envService.setApplicationSetting();
            this.loadPage();
            if(this.coreFunctionService.isNotBlank(this.storageService.getClientName()) && !this.checkIdTokenStatus()){
              this.authService.redirectToSignPage();
            }
            this.dataShareService.subscribeTemeSetting("setting");
            this.dataShareService.resetApplicationSetting([]);
          }
        })
    } 
    
    this.loginAndLogoutResponce = this.authDataShareService.settingData.subscribe(data =>{      
      if(data == "logged_in"){
        // this.notificationService.presentToastOnBottom('Login successful',"success");
        this.userInfo = this.storageService.GetUserInfo();
        this.showSidebarMenu = true;
      }else if(data == "logged_out"){
        this.isClientCodeExist();
        this.resetVariables();
        this.notificationService.presentToastOnTop('Logout successful',"secondary");
      }    
    });
    
    // this.loadJsGoogleMap();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      let platForm = Capacitor.getPlatform();
      // this.storageService.setPlatForm(platForm);
      window.addEventListener('offline', () => {
        this.androidpermissionsService.internetExceptionError();
      });
      window.addEventListener('online', () => {
        this.notificationService.presentToastOnTop("Your internet connection is back.", "success");
        this.getGridData();
      });
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        // SplashScreen.hide();
        setTimeout(() => {
          SplashScreen.hide();
        }),4000;
      }
      //this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#e30010');
    });

  }

  async loadJsGoogleMap(){
    // this.storageService.setObject('JsGoogleMap',this.app_googleService.loadGoogleMaps());
    localStorage.setItem('JsGoogleMap',JSON.stringify(await this.app_googleService.loadGoogleMaps()));
  }

  unsubscribeVariabbles(){
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
    if (this.loginAndLogoutResponce) {
      this.loginAndLogoutResponce.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeVariabbles();
  }  
  
  ngOnInit() {
    this.router.events.subscribe(event =>{
      if (event instanceof NavigationEnd) {
        if(event.urlAfterRedirects == "/"){ 
          this.redirectToHomePage();
        }
        if (
          event.id === 1 &&
          event.url === event.urlAfterRedirects && !event.url.startsWith("/download-manual-report") && !event.url.startsWith("/verify") && !event.url.startsWith("/pbl") && !event.url.startsWith("/unsubscribe") && !event.url.startsWith("/privacy-policy")
        ) {
          this.redirectToHomePageWithStorage();
        }
      }      
   })
    
    // if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
    //   // this.getGridData();
    //   this.authService.getUserPermission(false,'/home');
    //   this.router.navigateByUrl('/home');  
    // } 
    // else{
    //   console.log("Token Not active");
    //   this.router.navigateByUrl('/signine');
    // }
    
    // this.authService._user_info.subscribe(resp => {
    //   if(resp!== null){
    //     this.dataShareServiceService.setUserDetails(resp);
    //     this.userInfo = this.dataShareServiceService.getUserDetails();
    //   }
    //   else{
    //     this.userInfo = {};
    //   }
    // })
  }
  isClientCodeExist(){
      const clientCode = this.storageService.getClientName();
      if(this.coreFunctionService.isNotBlank(clientCode)){
        // this.authService.appLogout();
      }else{            
        this.router.navigateByUrl("/checkcompany");
      }
  }
  redirectToHomePage(){
    this.redirectToHomePageWithStorage();
  }
  redirectToHomePageWithStorage(){
    let checkComapanyCode:any = this.storageService.getClientName();
    if(this.coreFunctionService.isNotBlank(checkComapanyCode)){
      if(!this.checkApplicationSetting()){
        this.commonFunctionService.getApplicationAllSettings();
      }else{
        this.loadPage();
      }
      if(this.checkIdTokenStatus()){
        this.showSidebarMenu = true;
        this.authService.GetUserInfoFromToken(this.storageService.GetIdToken(),'/home');
      }else{
        this.authService.redirectToSignPage();
      }      
    }else{
      this.storageService.removeDataFormStorage("all");
      this.router.navigate(['/checkcompany']);
    }
  }
  checkIdTokenStatus(){
    let tokenStatus = false;
    if (this.storageService != null && this.storageService.GetIdToken() != null) {      
      if(this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE){
        tokenStatus = true;           
      }else{
        tokenStatus = false; 
      }
    }else{
      tokenStatus = false; 
    }
    return tokenStatus;
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
    this.authService.Logout('');
  }
  
  resetVariables(){
    this.cardList = [];
    this.showSidebarMenu = false;
    this.userInfo = {};
  }
  getGridData(criteria?){
    let criteriaList = [];
    if(criteria){
      criteriaList = criteria;
    }
    const params = 'card_master';
    let data = this.commonFunctionService.getPaylodWithCriteria(params,'',criteria,{});
    data['pageNo'] = 0;
    data['pageSize'] = this.appCardMasterDataSize;
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getGridData(payload);
  } 

  showCardTemplate(card:any, index:number){    
    const moduleList = this.commonAppDataShareService.getModuleList();
    const cardclickedindex = this.commonFunctionService.getIndexInArrayById(moduleList,card._id,"_id"); 
    this.commonAppDataShareService.setModuleIndex(cardclickedindex);
    const selectedcard = moduleList[cardclickedindex];
    this.router.navigate(['card-view']);
    this.dataShareServiceService.setcardData(selectedcard);
  }
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...',"primary");
  }
  checkApplicationSetting(){
    let exists = false;
    let applicationSetting = this.storageService.getApplicationSetting();
    if(applicationSetting){
      exists = true;
    }else{
      exists = false;
    }
    return exists;
  }
  loadPage(){
    this.favIcon.href = this.storageService.getLogoPath() + "favicon.ico";
    this.titleService.setTitle(this.storageService.getPageTitle());
    this.themeName = this.storageService.getPageThmem();
  }

}
