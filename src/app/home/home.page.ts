import { Component, OnInit, EventEmitter, Output , OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { AppStorageService, NotificationService } from '@core/ionic-core';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { App } from '@capacitor/app';
import { ApiService, CommonFunctionService, DataShareService, CommonAppDataShareService, StorageService, MenuOrModuleCommonService } from '@core/web-core';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [],
})
export class HomePage implements OnInit, OnDestroy {
  modal: any;
  selectedIndex= -1;


  // get local data of card
  private authSub: Subscription;
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
  gridDataSubscription:Subscription;
  notification: boolean=false;
  cardMasterList:any;
  userAuthModules:any;
  // cardListSubscription:Subscription;
  appCardMasterDataSize:number;  
  ionEvent:any;
  isExitAlertOpen:boolean = false;
  errorTitle:string= "Please Wait !";
  errorMessage:string= "We are getting modules.";


  constructor(
    private platform: Platform,
    private storageService: StorageService,
    private router: Router,
    private _location: Location,
    public alertController: AlertController,
    private dataShareService:DataShareService,
    private apiService:ApiService,
    private commonAppDataShareService:CommonAppDataShareService,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    private appStorageService: AppStorageService
  ) 
  {
    this.initializeApp();
    this.banner_img = [
      'assets/img/home/banner1.jpg',
      'assets/img/home/banner2.jpg',
      'assets/img/home/banner3.jpg',
      'assets/img/home/banner4.jpg'
    ];
    this.homePageLayout = this.appStorageService.getAppHomePageLayout();
    this.web_site_name = this.appStorageService.getWebSiteName();
    this.appCardMasterDataSize = this.appStorageService.getAppCardMasterDataSize();
    this.gridDataSubscription = this.dataShareService.gridData.subscribe((data:any) =>{
      if(data && data.data && data.data.length > 0){
        this.cardMasterList = data.data;
        this.commonAppDataShareService.setModuleList(this.cardMasterList);
        this.cardList = this.menuOrModuleCommonService.getUserAutherisedCards(this.cardMasterList);
        if(this.cardList == null){
          this.errorTitle = "No module assign";
          this.errorMessage = "Permission denied, No module found!";
          this.notificationService.presentToastOnBottom("You don't have any permission or assign module.","danger")
        }
      }else{
        if(this.myInput && this.myInput.length > 0 ){
          this.errorTitle = "No matching module found";
          this.errorMessage = "Try again by adjusting your search value!";
          this.cardList = [];
        }else{
          this.errorTitle = "No module assign";
          this.errorMessage = "Permission denied, No module found!";
        }
      }
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {});

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if(this.isExitAlertOpen){
        this.notificationService.presentToastOnBottom("Please Click On the exit button to exit the app.");
      }else{
        if(this._location.isCurrentPathEqualTo('/home')){
          this.showExitConfirm();
          // processNextHandler();
        }
      }
    });

    // this.platform.backButton.subscribeWithPriority(5, () => {
    //   console.log('Handler called to force close!');
    //   this.alertController.getTop().then(r => {
    //     if (r) {
    //       navigator['app'].exitApp();
    //     }
    //   }).catch(e => {
    //     console.log(e);
    //   })
    // });

  }

  unsubscribeVariabbles(){
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    // this.resetVariables();
    this.unsubscribeVariabbles();
  }

  ngOnInit() {
    this.getGridData();
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
    if(card['userAutherisedModule'] && card['userAutherisedModule']['name'] && card['userAutherisedModule']['_id']){
      this.storageService.setModule(card['userAutherisedModule']['name']);
      this.router.navigate(['card-view']);
    }else{
      this.notificationService.presentToastOnBottom("Clicked module does not autherised to you","danger");
    }
  }

  showExitConfirm() {
    this.isExitAlertOpen = true;
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
          this.isExitAlertOpen = false;
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        cssClass: 'danger',
        handler: () => {
          this.isExitAlertOpen = false;
          App.exitApp();
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
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...','danger');
  }
  // Pull from Top to Do refreshing or update card list 
  doRefresh(event:any) {
    // if(this.refreshlist){
      this.ionEvent = event;
      console.log('Begin doRefresh async operation');
      // this.updateMode = false;  
      setTimeout(() => {
        event.target.complete();
        this.getGridData();
        (event.target as HTMLIonRefresherElement).complete();
      }, 2000);

    // }else{
    //   console.log("Top refresh feature disable.");
    // }
  }
 
  
}