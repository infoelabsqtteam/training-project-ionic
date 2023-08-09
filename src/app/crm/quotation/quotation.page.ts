import { Component, OnInit, Optional, OnDestroy} from '@angular/core';
import { NotificationService } from '@core/ionic-core';
import { ModalController, IonRouterOutlet} from '@ionic/angular';
import { FormGroup} from '@angular/forms';
import { CommonAppDataShareService, MenuOrModuleCommonService } from '@core/web-core';

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
  
  constructor(
    private commonAppDataShareService:CommonAppDataShareService,
    public modalController: ModalController,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    private notificationService: NotificationService,
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
    //   const index = this.commonAppDataShareService.getSelectdTabIndex();
    //   this.getCardDataByCollection(index);      
    // });
  }

  load(){
    this.carddata = [];
    const index = this.commonAppDataShareService.getSelectdTabIndex();
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
    this.notificationService.presentToast('Comming Soon...');
  }  

}