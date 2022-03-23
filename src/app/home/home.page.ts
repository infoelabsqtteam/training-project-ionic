import { Component, OnInit, EventEmitter, Output , OnDestroy } from '@angular/core';
import { DatePipe, CurrencyPipe, TitleCasePipe, Location } from '@angular/common';
import { ApiService, AuthService, CommonDataShareService, CoreUtilityService, DataShareService, EnvService, LoaderService, PermissionService, RestService, StorageService, StorageTokenStatus } from '@core/ionic-core';
import { Platform, ModalController , PopoverController, AlertController} from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { NavigationExtras, Router, RouterOutlet } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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
    private restService:RestService,
    private commonDataShareService:CommonDataShareService
  ) 
  {
    this.initializeApp();
    this.banner_img = [
      'assets/img/home/banner1.png',
      'assets/img/home/banner2.png'
    ];
    this.web_site_name = this.envService.getWebSiteName();
    
    this.gridDataSubscription = this.dataShareService.gridData.subscribe(data =>{
      this.cardList = data.data;
      this.commonDataShareService.setModuleList(this.cardList);
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


  ngOnDestroy(): void {
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }

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
    this.commonDataShareService.setModuleIndex(index);
    this.router.navigate(['crm/quotation']);
    //this.router.navigate(['form']); 
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
    this.storageService.presentToast('Comming Soon...');
  }

  pdfurl = "https://file-examples-com.github.io/uploads/2017/10/file-sample_150kB.pdf";
 
  
}