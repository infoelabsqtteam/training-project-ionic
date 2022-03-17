import { Component, OnInit, EventEmitter, Output , OnDestroy } from '@angular/core';
import { DatePipe, CurrencyPipe, TitleCasePipe, Location } from '@angular/common';
import { ApiService, AuthService, CoreUtilityService, DataShareService, EnvService, LoaderService, PermissionService, RestService, StorageService, StorageTokenStatus } from '@core/ionic-core';
import { Platform, ModalController , PopoverController, AlertController} from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { NavigationExtras, Router, RouterOutlet } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DataShareServiceService } from '../service/data-share-service.service';
import { Subscription } from 'rxjs';

import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  providers: [DocumentViewer,File],
})
export class HomePage implements OnInit, OnDestroy {
  modal: any;
  selectedIndex= -1;


  // get local data of card
  private authSub: Subscription;
  cardListSubscription;
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
  
  // for search
  carddata: any;
  inValue = 0;
  myInput: string;
  dataCount: "null";

  // banner data
  bannerData: any;
  banner_img: any;


  @Output() collection_name = new EventEmitter<string>();
  plt: any;
  pdfObj: any;
  gridDataSubscription;

  // download var

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
    private restService:RestService
  ) 
  {
    this.initializeApp();
    this.banner_img = [
<<<<<<< HEAD
      'assets/e-labs/banner.png'
      // 'assets/img/home/banner1.png',
      // 'assets/img/home/banner2.png'
=======
      'assets/img/home/banner1.png',
      'assets/img/home/banner2.png'
>>>>>>> bd1d5717af5cef730dede8de219ec0290e1f41ae
    ];
    this.web_site_name = this.envService.getWebSiteName();
    
    this.gridDataSubscription = this.dataShareService.gridData.subscribe(data =>{
      this.cardList = data.data;
    })
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


<<<<<<< HEAD
  ngOnDestroy(): void {
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
  }

=======
  
>>>>>>> bd1d5717af5cef730dede8de219ec0290e1f41ae
  ngOnInit() {
    if (this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE) {
      this.router.navigateByUrl('/home');      
    }else {
      this.router.navigateByUrl('auth/signine');      
    }
    this.authService.getUserPermission(false,'/home');
    this.authService._user_info.subscribe(resp => {
      this.userInfo = resp;
      this.getGridData();
    })
  }

<<<<<<< HEAD
  //for getting cardmaster data
  commonFunction(criteria?) {
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        // this.loaderService.showLoader(null);
        let crList = [];
        if(criteria && criteria.length > 0){
          crList = criteria;
        }
        let obj = {
          crList: crList,
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
            // this.loaderService.hideLoader();
            //this.cardList = respData['data'];
            if(respData && respData['data'].length > 0){

              if(criteria && criteria.length > 0){
                let card = respData['data'][0];
                this.dataShareService.setcardData(card);
                this.router.navigate(['crm/quotation']);
              }else{              
                this.dataShareService.setCardList(respData['data']);
              }
              
            }
          },
          (err: HttpErrorResponse) => {
            // this.loaderService.hideLoader();
            console.log(err.error);
          }
        )
      }
    })
=======

  async getGridData(criteria?){
    let criteriaList = [];
    if(criteria){
      criteriaList = criteria;
    }
    const params = 'card_master';
    let data = await this.restService.getPaylodWithCriteria(params,'',criteria,{});
    data['pageNo'] = 0;
    data['pageSize'] = 50;
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getGridData(payload);
>>>>>>> bd1d5717af5cef730dede8de219ec0290e1f41ae
  }

  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    // this.router.navigate(['cardview']);
    let cardId = card._id;
    if(card && card.tab_menu && card.tab_menu.length > 0){
      let tab  = card.tab_menu[0];
      let tabId = tab._id;
      let crList = [
        {
          "fName": "_id",
          "fValue": tabId,
          "operator": "eq"
        }
      ]
      this.commonFunction(crList);
    }else{
      this.dataShareService.setcardData(card);
    }
    this.dataShareService.setParentCardId(cardId);
    this.router.navigate(['crm/quotation']);
<<<<<<< HEAD
    //this.dataShareService.setcardData(card);
=======
    this.dataShareServiceService.setcardData(card);
>>>>>>> bd1d5717af5cef730dede8de219ec0290e1f41ae
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

<<<<<<< HEAD
  getBannersData() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }

        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          pageNo: 0,
          pageSize: 50,
          value: "quotation_letter"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_APP_BANNERS')
        this.http.post(api, obj, header).subscribe(
          (respData) => {
            this.bannerData = respData['success'];
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
          }
        )
      }
    })

  }
=======
  
>>>>>>> bd1d5717af5cef730dede8de219ec0290e1f41ae
  // search module below
  search() {
    const criteria = "name;stwic;"+this.myInput+";STATIC";
    this.getGridData([criteria]);
  }

  
  

  openSearch(){
    console.log("function open searchbar");
  }
  
  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

  pdfurl = "https://file-examples-com.github.io/uploads/2017/10/file-sample_150kB.pdf";
 
  
}