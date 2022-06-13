import { Component, OnInit, Optional, OnDestroy} from '@angular/core';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { Platform, ModalController, IonRouterOutlet, PopoverController} from '@ionic/angular';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Router } from '@angular/router';
import { PopoverComponent } from '../../common-component/popover/popover.component';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.page.html',
  styleUrls: ['./card-view.page.scss'],
})

export class CardViewPage implements OnInit, OnDestroy {

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
    collectionname: any;
  
    card:any={};
    data :any ={};
  
    // new var
    gridDataSubscription: any;

   // filter card
  filterForm: FormGroup;
  createFormgroup: boolean = true;
  openFilter: boolean = false;
  openTravelFilter: boolean = false;
  filterCount: 0;
  searching:boolean = false;
  searchcardvalue:any='';
  searchcardfield:any='';
  selectedLeave : string = '';
  collectionName:any;
  travelCardList:any=["Travel Mangement","Travel Report"];
  headerTitle:any;
  popoverdata:any;
  // addNewEnabled:boolean=false;
  // detailPage:boolean=false;

    constructor(
      private storageService: StorageService,
      private coreUtilityService :CoreUtilityService,
      private commonDataShareService:CommonDataShareService,
      private restService:RestService,
      private apiService:ApiService,
      private formBuilder: FormBuilder,
      public modalController: ModalController,
      private router:Router,
      public popoverController: PopoverController,
      @Optional() private readonly routerOutlet?: IonRouterOutlet      
    ){}
  
    ionViewWillEnter(){
      this.load();
      this.searching = false;
    }

    ngOnInit() {}
    togglesearch(){
      this.searching = !this.searching;
      this.searchcardvalue = "";
      if(!this.searching){
        this.filterCardAgain();
      }
    }
    
  
    load(){
      this.carddata = [];
      this.data = {};
      const index = this.commonDataShareService.getSelectdTabIndex();
      this.getCardDataByCollection(index);
    }
  
    resetVariables(){
      this.card = {}
    }
  
    ngOnDestroy(): void {
      this.resetVariables();
    }
  
    private getCardDataByCollection(i) {
      const cardWithTab = this.coreUtilityService.getCard(i); 
      this.collectionName = cardWithTab.card.collection_name;
      if(cardWithTab && cardWithTab.card){
        if(cardWithTab.card && cardWithTab.card.card_type && cardWithTab.card.chart_view){
          this.router.navigateByUrl('charts');
        }else{
        this.card = cardWithTab;
        }
      }    
    }
    
    comingSoon() {
      this.storageService.presentToast('Comming Soon...');
    }
    goBack(){
      this.carddata = [];
      this.tabMenu = [];
      this.openFilter = false;
      this.filterForm.reset();
    }
    open(){
      this.openFilter=!this.openFilter
      this.data={};
    }
    openTravel(){
      this.openTravelFilter=!this.openTravelFilter
      this.data={};
      // this.travelCardList =["Travel Mangement","Travel Report"];

    }
    // filterdata
    filterCard(){  
      this.openFilter = false;
      this.data = {
        'filterFormData' : this.filterForm.getRawValue()
      }
    }
    filterCardAgain(){  
      const value = {}
      value[this.searchcardfield] = this.searchcardvalue;
      this.data = {
        'filterFormData' : value
      }         
    }
    closefilterCard(){
      this.data = {};
      this.openFilter = false;
    }
    clearfilterCard(){
      this.data = {};
      this.filterForm.reset();
    } 
    columnListOutput(columnList){
      this.columnList = columnList;
      this.createFormgroup = true;
      if (this.columnList && this.columnList.length > 0 && this.createFormgroup) {
        this.createFormgroup = false;
        const forControl = {};
        this.columnList.forEach(element => {
          switch (element.type) {
            case "abcd":
              break;
            default:
              this.coreUtilityService.createFormControl(forControl, element, '', "text");
              break;
          }
        });
        if (forControl) {
          this.filterForm = this.formBuilder.group(forControl);
        }
      }
    }
    search(searchcardvalue){
      console.log(searchcardvalue);
      // if(searchcardvalue && searchcardvalue.length > 0){
        this.data = {
          'searchData' : searchcardvalue
        }
      // }
    }
    // setCardDetails(card) {  
    //   if(card && card.add_new){
    //     if(this.detailPage){
    //       this.addNewEnabled = false;
    //     }else{
    //       this.addNewEnabled = true;
    //     }
    //   }else{
    //     this.addNewEnabled = false;
    //   } 
    //   this.cardtitle = card.name;
    //   if (card.card_type !== '') {
    //     this.cardType = card.card_type.name;
    //   }
    //   // this.childColumn = card.child_card;
    // }
    async presentPopover(ev: any) {
      const popover = await this.popoverController.create({
        component: PopoverComponent,
        cssClass: 'my-custom-class',
        event: ev,
        translucent: true
      });
      await popover.present();
    
      const { role } = await popover.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    }
    popoverOutput(popoverdata:any){
      this.headerTitle = popoverdata;
      
    }

  }