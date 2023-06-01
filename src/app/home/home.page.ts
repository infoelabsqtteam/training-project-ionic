import { Component, OnInit, EventEmitter, Output , OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ApiService, AuthService, CommonDataShareService, DataShareService, EnvService, NotificationService, RestService, StorageService, StorageTokenStatus, CoreUtilityService } from '@core/ionic-core';
import { Platform, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataShareServiceService } from '../service/data-share-service.service';
import { Subscription } from 'rxjs';

import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
//import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [DocumentViewer],
})
export class HomePage implements OnInit, OnDestroy {
  modal: any;
  selectedIndex= -1;


  // get local data of card
  private authSub: Subscription;
  // cardListSubscription;
  private previousAuthState = false;
  userData: any;
  userInfo: any={};
  web_site:string='';
  list: string[];
  web_site_name: any;


  // for iconsmenu //default values
  cardList: any = [];
  img_src: any = "./assets/expense.png";
  col_size: number = 3;
  homePageLayout:string;
  
  // for search
  carddata: any;
  inValue = 0;
  myInput: string;
  dataCount: number = -1;

  // banner data
  bannerData: any;
  banner_img: any;
  nodatafoundImg :any = "../../assets/nodatafound.png";


  @Output() collection_name = new EventEmitter<string>();
  plt: any;
  pdfObj: any;
  gridDataSubscription:any;
  notification: boolean=false;
  cardMasterList:any;
  userAuthModules:any;
  cardListSubscription:any;
  appCardMasterDataSize:number;  
  ionEvent:any;


  constructor(
    private platform: Platform,
    private authService: AuthService,
    private storageService:StorageService,
    private router: Router,
    private _location: Location,
    public alertController: AlertController,
    private http: HttpClient,
    private envService: EnvService,
    private dataShareServiceService: DataShareServiceService,
    private dataShareService:DataShareService,
    private apiService:ApiService,
    private restService:RestService,
    private commonDataShareService:CommonDataShareService,
    private notificationService: NotificationService,
    private coreUtilityService: CoreUtilityService

  ) 
  {
    this.initializeApp();
    this.banner_img = [
      'assets/img/home/banner1.jpg',
      'assets/img/home/banner2.jpg',
      'assets/img/home/banner3.jpg',
      'assets/img/home/banner4.jpg'
    ];
    this.homePageLayout = this.envService.getAppHomePageLayout();
    this.web_site_name = this.envService.getWebSiteName();
    this.appCardMasterDataSize = this.envService.getAppCardMasterDataSize();
    this.gridDataSubscription = this.dataShareService.gridData.subscribe((data:any) =>{
      if(data && data.data && data.data.length > 0){
        this.cardMasterList = data.data;
        this.commonDataShareService.setModuleList(this.cardMasterList);
        this.cardList = this.coreUtilityService.getUserAutherisedCards(this.cardMasterList);
        if(this.cardList == null){        
          this.notificationService.presentToastOnBottom("You don't have permission or assign any module.","danger")
        }
      }else{
        this.cardList = [];
      }
    });
    this.cardListSubscription = this.dataShareService.settingData.subscribe((data:any) =>{
      if(data == "logged_out"){
        this.cardList = [];
      }else if(data == "logged_in"){
        this.getGridData();
      }
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {});

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/home')) {

        // Show Exit Alert!
        console.log('Show Exit Alert!');
        this.showExitConfirm();
        processNextHandler();
      } else {
        // Navigate to back page
        console.log('Navigate to back page');
        this._location.back();
      }

    });

    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Handler called to force close!');
      this.alertController.getTop().then(r => {
        if (r) {
          navigator['app'].exitApp();
        }
      }).catch(e => {
        console.log(e);
      })
    });

  }

  unsubscribeVariabbles(){
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    // this.resetVariables();
    this.unsubscribeVariabbles();
  }

  ngOnInit() {
    if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
      this.router.navigateByUrl('/home');
      this.getGridData();
    }else {
      this.router.navigateByUrl('auth/signine');      
    }
    this.authService.getUserPermission(false,'/home');
    // this.authService._user_info.subscribe(resp => {
    //   this.userInfo = resp;
      
    // })
  }
  resetVariables(){
    this.cardList = [];
  }

  getGridData(criteria?){
    let criteriaList = [];
    if(criteria){
      criteriaList = criteria;
    }
    const params = 'card_master';
    let data = this.restService.getPaylodWithCriteria(params,'',criteria,{});
    data['pageNo'] = 0;
    data['pageSize'] = this.appCardMasterDataSize;
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getGridData(payload);
  }

  showCardTemplate(card:any, index:number){
    const moduleList = this.commonDataShareService.getModuleList();
    const cardclickedindex = this.coreUtilityService.getIndexInArrayById(moduleList,card._id,"_id"); 
    this.commonDataShareService.setModuleIndex(cardclickedindex);
    if(card['userAutherisedModule'] && card['userAutherisedModule']['name']){
      this.storageService.setModule(card['userAutherisedModule']['name']);
    }
    this.router.navigate(['card-view']); 
  }

  showExitConfirm() {
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        cssClass: 'danger',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }

  
  // search module below
  search() {
    const criteria = "name;stwic;"+this.myInput+";STATIC";
    this.getGridData([criteria]);
  } 

  openSearch(){
    console.log("function open searchbar");
  }
  
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...','danger');
  }

  // Pull from Top for Do refreshing or update card list 
  doRefresh(event:any) {
    // if(this.refreshlist){
      this.ionEvent = event;
      console.log('Begin doRefresh async operation');
      // this.updateMode = false;  
      setTimeout(() => {
        event.target.complete();
        this.getGridData();
      }, 2000);

    // }else{
    //   console.log("Top refresh feature disable.");
    // }
  }
 
  
}