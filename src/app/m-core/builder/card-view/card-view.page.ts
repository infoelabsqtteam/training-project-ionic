import { Component, OnInit, Optional, OnDestroy, SimpleChanges, ViewChild, ElementRef, Renderer2} from '@angular/core';
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

  @ViewChild("primaryheader") primaryheader: HTMLElement;
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
  collectionName:any;
  searchcardfield:any = '';
  // addNewEnabled:boolean=false;
  // detailPage:boolean=false; 
  popoverTabbing:any; 
  headerTitle:string;
  popoverdata:any;
  popoverItems:any =[];
  popoverMenu:boolean;
  selectedgriddataId:any;
  selectedSearchCardField:any={}
  
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
      public renderer: Renderer2,
      @Optional() private readonly routerOutlet?: IonRouterOutlet,
    ){}
  
    ionViewWillEnter(){
      this.load();
      this.searching = false;
      this.renderer.setStyle(this.primaryheader['el'], 'webkitTransition', 'top 700ms');
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
      // this.card;
    }
    togglesearch(){      
      this.searching = !this.searching;
      this.searchcardvalue = "";
      if(!this.searching){
        this.filterCardByDropdownValue();
      }
      this.searchcardfield = "";
    }
    selectedSearchValue(serchingvalue:any){ 
      this.searchcardvalue = "";     
      this.selectedSearchCardField = {};
      if(serchingvalue){
        this.searching = true;
        for (let index = 0; index < this.columnList.length; index++) {
          const element = this.columnList[index];
          if(serchingvalue === element.field_name){
            this.selectedSearchCardField = element;
          }
          
        }
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
  
    private getCardDataByCollection(i:number) {
      const cardWithTab = this.coreUtilityService.getCard(i);
      this.collectionName = cardWithTab.card.collection_name;
      if(cardWithTab && cardWithTab.card){
        if(cardWithTab.card && cardWithTab.card.card_type && cardWithTab.card.chart_view){
          this.router.navigateByUrl('chart');
        }else{
          if(cardWithTab.card && cardWithTab.card.name){
            this.headerTitle = cardWithTab.card.name;
          }
        this.card = cardWithTab;
        }
      }
      if(cardWithTab && cardWithTab.popoverTabbing) {
        this.popoverTabbing = cardWithTab.popoverTabbing;
      }  
    }
    
    comingSoon() {
      this.storageService.presentToast('Comming Soon...');
    }
    goBack(){
      this.carddata = [];
      this.tabMenu = [];
      this.openFilter = false;
      if(this.filterForm) this.filterForm.reset();
      this.searchcardfield = '';
      this.popoverMenu = false;
      this.popoverTabbing = false;
      this.popoverItems = [];
      this.commonDataShareService.setSelectedTabIndex(-1);
      this.selectedgriddataId = "";
      this.searchcardvalue = "";
      this.selectedSearchCardField = {};
    }
    open(){
      this.openFilter=!this.openFilter;
      // this.data={};
    }
    filterCard(){  
      this.open();
      this.data = {
        'filterFormData' : this.filterForm.getRawValue()
      }
    }
    filterCardByDropdownValue(){  
      const value = {}
      if(this.searchcardvalue && this.searchcardvalue.length >= 3){
        value[this.searchcardfield] = this.searchcardvalue;
        this.data = {
          'filterFormData' : value
        }
      } 
      if(this.searchcardvalue.length === 0){ 
        this.data = {};
      }    
    }
    closefilterCard(){
      this.openFilter = false;
    }
    clearfilterCard(){
      this.filterForm.reset();
      this.data = {};
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
      // console.log(searchcardvalue);
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
    // async presentPopover(ev: any) {
    //   const popover = await this.popoverController.create({
    //     component: PopoverComponent,
    //     cssClass: 'my-custom-class',
    //     event: ev,
    //     translucent: true,
    //     componentProps: {
    //       "popoverItems" : this.popoverItems 
    //     }
    //   });
    //   popover.componentProps.popover = popover;
    //   popover.onDidDismiss().then((result) => {        
    //     console.log('onDidDismiss resolved with role', result);
    //     this.getCardDataByCollection(this.selectedIndex);
    //   });
    //   return await popover.present();
    // }
    popoverOutput(popoverdata:any){
      if(popoverdata && popoverdata.name){ 
        this.headerTitle = popoverdata.name;
      }
      if(popoverdata && popoverdata.card){
        this.card = {
          "card":popoverdata.card,
          "popoverTabbing": this.popoverTabbing,
          "selectedTabIndex": popoverdata.selectedTabIndex,
          "tabs" : popoverdata.tabs
        }
      }
    }
    popoverMenuItem(menuitem:any){
      this.popoverItems = menuitem;
    }
    primaryheaderNewEmit(setStyleValue){
      if (setStyleValue.scrollValue >= 50) {
        this.renderer.setStyle(this.primaryheader['el'], 'top', setStyleValue.setTopValue);
      } else {
        this.renderer.setStyle(this.primaryheader['el'], 'top', setStyleValue.setTopValue);
      }
    }
    tabmenuClick(item:any,index:number){
      this.tabSwichingChanges();
      if(item && item.name){
        this.popoverOutput(item);
      }
      this.selectedIndex = index;
      this.carddata = [];
      this.createFormgroup = true;
      const tab = this.popoverItems[index];
      const moduleList = this.commonDataShareService.getModuleList();
      const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id"); 
      const card = moduleList[tabIndex];
      this.card['card'] = card;
      this.card.selectedTabIndex = index;
      this.popoverOutput(this.card);
    } 
    tabSwichingChanges(){   
      this.searchcardfield = "";
      if(this.searchcardvalue) this.searchcardvalue = "";
      if(this.selectedSearchCardField) this.selectedSearchCardField = {};
      this.searching=false;
    }

  }