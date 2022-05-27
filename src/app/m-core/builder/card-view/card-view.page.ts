import { Component, OnInit, Optional, OnDestroy} from '@angular/core';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { Platform, ModalController, IonRouterOutlet} from '@ionic/angular';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';

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
  filterCount: 0;
  searching:boolean = false;
  searchcardvalue:string = '';

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
      @Optional() private readonly routerOutlet?: IonRouterOutlet,
      
    ) 
    {
      
    }
  
    ionViewWillEnter(){
      this.load();
      this.searching = false;
    }

    ngOnInit() {  
    }
    togglesearch(){
      this.searching = !this.searching;
      this.searchcardvalue = "";
      if(!this.searching){
        this.search(this.searchcardvalue);
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
      if(cardWithTab && cardWithTab.card){
        this.card = cardWithTab
        ;
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
    // filterdata
    filterCard(){  
      this.openFilter = false;
      this.data = {
        'filterFormData' : this.filterForm.getRawValue()
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

  }