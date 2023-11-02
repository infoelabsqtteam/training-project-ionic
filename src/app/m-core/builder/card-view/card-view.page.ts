import { Component, OnInit, Optional, OnDestroy, SimpleChanges, ViewChild, ElementRef, Renderer2} from '@angular/core';
import { NotificationService } from '@core/ionic-core';
import { ModalController, IonRouterOutlet, PopoverController} from '@ionic/angular';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonFunctionService, MenuOrModuleCommonService, CommonAppDataShareService, PermissionService, AuthService, FormCreationService } from '@core/web-core';

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
  nestedCardSubscribe:any;
  
  constructor(
    private commonAppDataShareService:CommonAppDataShareService,
    private formBuilder: FormBuilder,
    public modalController: ModalController,
    private router:Router,
    public popoverController: PopoverController,
    public renderer: Renderer2,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    private notificationService: NotificationService,
    private formCreationService: FormCreationService,
    @Optional() private readonly routerOutlet?: IonRouterOutlet,
  ){}

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){
    this.load();
    this.searching = false;
    this.renderer.setStyle(this.primaryheader['el'], 'webkitTransition', 'top 700ms');
  }
  ionViewWillLeave(){
    console.log("IonCycle: ","ionViewWillLeave");
  }
  ionViewDidLeave(){
    console.log("IonCycle: ","ionViewDidLeave");
  }
  // Ionic LifeCycle Function Handling Start--------------------

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    console.log("ngCycle: ","ngOnInit");
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("ngCycle: ","ngOnChanges");
  }
  ngOnDestroy(): void {
    this.resetVariables();
  }
  // Angular LifeCycle Function Handling Start-------------------
  
  // Click Functions Handling Start---------------------
  togglesearch(){      
    this.searching = !this.searching;
    this.searchcardvalue = "";
    if(!this.searching){
      this.filterCardByDropdownValue();
    }
    this.searchcardfield = "";
  }
  async goBack(){
    const multipleCardCollection = this.commonAppDataShareService.getMultipleCardCollection();
    let previousCollectiondData:any = {};
    let multiCardLength = multipleCardCollection.length;
    const lastIndex = multipleCardCollection.length - 1;
    if(multiCardLength > 1){
      previousCollectiondData = multipleCardCollection[multiCardLength - 2];
    }
    if(multipleCardCollection && multipleCardCollection.length >0){
      previousCollectiondData = multipleCardCollection[lastIndex];
      if(previousCollectiondData){          
        this.card = previousCollectiondData.card;
        this.commonAppDataShareService.setModuleIndex(previousCollectiondData.module_index);
      }
      multipleCardCollection.splice(lastIndex,1);
      this.commonAppDataShareService.setMultipleCardCollection(multipleCardCollection);
      this.commonAppDataShareService.setNestedCard(previousCollectiondData);
      this.router.navigateByUrl('card-view');
    }else{
      this.router.navigateByUrl('home');
      this.resetVariables();
    }
  }
  closefilterCard(){
    this.openFilter = false;
  }
  clearfilterCard(){
    this.filterForm.reset();
    this.data = {};
  }
  open(){
    this.openFilter=!this.openFilter;
    // this.data={};
  }
  tabmenuClick(item:any,index:number){
    this.tabSwichingChanges();
    // if(item && item.name){
    //   this.popoverOutput(item);
    // }
    this.selectedIndex = index;
    this.carddata = [];
    this.createFormgroup = true;
    // const tab = this.popoverItems[index];
    // const moduleList = this.commonAppDataShareService.getModuleList();
    // const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tab._id,"_id"); 
    // const card = moduleList[tabIndex];
    this.card['card'] = item.tabCard;
    this.card.selectedTabIndex = index;
    this.popoverOutput(this.card);
  }
  filterCard(){  
    this.open();
    this.data = {
      'filterFormData' : this.filterForm.getRawValue()
    }
  }
  // Click Functions Handling End-------------------- 
  
  // Ionic Event Functions Handling Start ------------
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
  filterCardByDropdownValue(){  
    const value = {}
    if(this.searchcardvalue && this.searchcardvalue.length >= 1){
      value[this.searchcardfield] = this.searchcardvalue;
      this.data = {
        'filterFormData' : value
      }
    } 
    if(this.searchcardvalue.length === 0){ 
      this.data = {};
    }    
  }
  // Ionic Event Functions Handling End ------------

  // Dependency Functions Handling Start -------------------
  load(){
    this.carddata = [];
    this.data = {};
    const index = this.commonAppDataShareService.getSelectdTabIndex();
    this.getCardDataByCollection(index);
  }
  private getCardDataByCollection(i:number) {
    const cardWithTab = this.menuOrModuleCommonService.getCard(i);
    this.collectionName = cardWithTab.card.collection_name;
    // if (this.permissionService.checkPermission(this.collectionName, 'view')) {
      if(cardWithTab && cardWithTab.card){
        if(cardWithTab.card && cardWithTab.card.card_type && cardWithTab.card.chart_view){
          let navigation = '';
          if(cardWithTab.card.card_type && cardWithTab.card.card_type.name == 'chartview'){
            navigation = 'chart';
          }else if(cardWithTab.card.card_type && cardWithTab.card.card_type.name == 'mongochart'){
            navigation = 'mongochart';
          }else{
            navigation = 'home';
          }
          if(navigation == 'home'){
            this.notificationService.presentToastOnBottom("Path Does not exists, please connect to admin.");
          }
          this.router.navigateByUrl(navigation);
        }else{
            if(cardWithTab.card && cardWithTab.card.name){
              this.headerTitle = cardWithTab.card.name;
            }
          this.card = cardWithTab;
        }
      }
      this.popoverTabbing = cardWithTab?.popoverTabbing;
      this.selectedIndex = cardWithTab?.selectedTabIndex;
    // }else{
    //   let getStatus:any = this.authService.checkIdTokenStatus();
    //   if(getStatus && getStatus.status){
    //     this.notificationService.presentToastOnBottom("Permission denied !", "danger");
    //   }else{
    //     if(getStatus && getStatus.msg){
    //       this.notificationService.presentToastOnBottom(getStatus.msg);
    //     }
    //     this.authService.gotToSigninPage();
    //   }
    // }
  }
  tabSwichingChanges(){   
    this.searchcardfield = "";
    if(this.searchcardvalue) this.searchcardvalue = "";
    if(this.selectedSearchCardField) this.selectedSearchCardField = {};
    this.searching=false;
  }
  parentCardName(name:string){
    this.headerTitle = name;
  }
  resetVariables(){
    this.card = {}      
    this.carddata = [];
    this.tabMenu = [];
    this.openFilter = false;
    if(this.filterForm) this.filterForm.reset();
    this.searchcardfield = '';
    this.popoverMenu = false;
    this.popoverTabbing = false;
    this.popoverItems = [];
    this.commonAppDataShareService.setSelectedTabIndex(-1);
    this.selectedgriddataId = "";
    this.searchcardvalue = "";
    this.selectedSearchCardField = {};
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
            this.formCreationService.createFormControl(forControl, element, '', "text");
            break;
        }
      });
      if (forControl) {
        this.filterForm = this.formBuilder.group(forControl);
      }
    }
  }
  popoverOutput(popoverdata:any){
    // if(popoverdata && popoverdata.name){ 
    //   this.headerTitle = popoverdata.name;
    // }
    if(popoverdata && popoverdata.card){
      this.headerTitle = popoverdata.card?.name;
      this.card = {
        "card":popoverdata.card,
        "collectionFound":popoverdata.collectionFound,
        "popoverTabbing": this.popoverTabbing,
        "selectedTabIndex": popoverdata.selectedTabIndex,
        "tabs" : popoverdata.tabs
      }
    }
  }    
  popoverMenuItem(menuitem:any){
    this.popoverItems = menuitem;
  }
  // Dependency Functions Handling End -------------------
  

  // Functions NOt In use--------------
  
  // search(searchcardvalue){
  //   // console.log(searchcardvalue);
  //   // if(searchcardvalue && searchcardvalue.length > 0){
  //     this.data = {
  //       'searchData' : searchcardvalue
  //     }
  //   // }
  // }
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
  
  // primaryheaderNewEmit(setStyleValue){
  //   if (setStyleValue.scrollValue >= 50) {
  //     this.renderer.setStyle(this.primaryheader['el'], 'top', setStyleValue.setTopValue);
  //   } else {
  //     this.renderer.setStyle(this.primaryheader['el'], 'top', setStyleValue.setTopValue);
  //   }
  // }
  // comingSoon() {
  //   this.notificationService.presentToastOnBottom('Comming Soon...');
  // }
  
  

}