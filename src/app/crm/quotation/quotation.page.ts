import { Component, OnInit, Optional, OnDestroy} from '@angular/core';
import { AppStorageService, AppApiService, RestService, CoreUtilityService, AppDataShareService, CommonDataShareService } from '@core/ionic-core';
import { Platform, ModalController, IonRouterOutlet} from '@ionic/angular';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { MenuOrModuleCommonService } from '@core/web-core';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})

export class QuotationPage implements OnInit, OnDestroy {

  //common function
  cardList: any = [];
  selectedIndex= -1;
  tabMenu: any = [];
  // cardListSubscription:any;
  columnList: any = [];
  carddata: any;
  cardtitle: any;
  cardType = "summary"; //default cardtype
  childColumns : any;
  childColumn: any = {};
  filterForm: FormGroup;
  createFormgroup: boolean = true;
  collectionname: any;

  card:any={};
  data :any ={};

  // new var
  // gridDataSubscription: any;
  
  
  constructor(
    private platform: Platform,
    private storageService: AppStorageService,
    private router: Router,
    private formBuilder: FormBuilder,
    private callNumber: CallNumber,
    private apiService:AppApiService,
    private restService:RestService,
    private coreUtilityService :CoreUtilityService,
    private dataShareService: AppDataShareService,
    private commonDataShareService:CommonDataShareService,
    public modalController: ModalController,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    @Optional() private readonly routerOutlet?: IonRouterOutlet,
  ) 
  {
    
  }

  ionViewWillEnter(){
    this.load();
  }

  ngOnInit() {    
    // this.router.events.pipe(
    //   filter((event: RouterEvent) => event instanceof NavigationEnd)
    // ).subscribe(() => {
    //   const index = this.commonDataShareService.getSelectdTabIndex();
    //   this.getCardDataByCollection(index);      
    // });
  }

  load(){
    this.carddata = [];
    const index = this.commonDataShareService.getSelectdTabIndex();
    this.getCardDataByCollection(index);
  }
  
  resetVariables(){
    this.card = {}
  }

  ngOnDestroy(): void {
    this.resetVariables();
    // if (this.cardListSubscription) {
    //   this.cardListSubscription.unsubscribe();
    // }
    // if (this.gridDataSubscription) {
    //   this.gridDataSubscription.unsubscribe();
    // }
  }

  private getCardDataByCollection(i) {
    const cardWithTab = this.menuOrModuleCommonService.getCard(i); 
    if(cardWithTab && cardWithTab.card){
      this.card = cardWithTab
      ;
    }     
  }  
  
  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }  

}