import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService, NotificationService, PermissionService, App_googleService } from '@core/ionic-core';
import { filter } from 'rxjs';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Platform, ModalController, AlertController, PopoverController, isPlatform } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { ModalDetailCardComponent } from '../modal-detail-card/modal-detail-card.component';
import { FormComponent } from '../form/form.component';
import { DatePipe } from '@angular/common';
import { CallDataRecordFormComponent } from '../../modal/call-data-record-form/call-data-record-form.component';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { AndroidpermissionsService } from '../../../service/androidpermissions.service';
import { GmapViewComponent } from '../gmap-view/gmap-view.component';
import { Geolocation } from '@capacitor/geolocation';
import { zonedTimeToUtc } from 'date-fns-tz';

@Component({
  selector: 'app-cards-layout',
  templateUrl: './cards-layout.component.html',
  styleUrls: ['./cards-layout.component.scss'],
  providers: [File]
})
export class CardsLayoutComponent implements OnInit, OnChanges {
  
  @ViewChild('cardView') cardViewContent: ElementRef<any>;

  @Input() card:any;
  @Input() data:any ={};
  @Output() columnListOutput = new EventEmitter();
  @Input() searchcard:any;
  @Output() formNameTypeTravel = new EventEmitter();
  @Output() popoverTabbing = new EventEmitter();
  @Output() primaryheaderNew = new EventEmitter();
  @Output() nestedCard = new EventEmitter();
  @Output() parentCardName = new EventEmitter();



  web_site_name: string = '';
  list: any = [];
  carddata: any;

  columnList: any = [];
  cardType = "summary"; //default cardtype
  cardDataMasterSubscription: any;
  collectionname: any = 'request_quote';
  // cardtitle: any;

  childColumns : any;
  childColumn: any = {};
  childDataTitle: any;
  childCardType: string = "";
  childTabMenu: any=[];
  name: any ='';
  
  // searchbar variables
  inValue = 0;
  myInput: string;

  // filter card
  //filterForm: FormGroup;
  filterForm:any = {
    'value' : {}
  }
  createFormgroup: boolean = true;
  openFilter: boolean = false;
  filterCount: 0;
  gridData:any={};

  //common function
  cardList: any = [];
  selectedIndex= -1;
  public editedRowIndex:number=-1;
  tabMenu: any = [];
  // cardListSubscription:any;

  // db Flags
  addCallingFeature: boolean=false;
  addNewEnabled:boolean=false;
  detailPage:boolean=false;
  callStatus:boolean=false;
  popoverMenu:boolean=false;
  enableEditOnly:boolean=false;
  loadMoreData:boolean = false;
  refreshlist:boolean = false;
  enableReviewOnly:boolean=false;
  downloadReport:boolean=false;
  downloadPdfBtn:boolean=false;
  // new var
  gridDataSubscription: any;
  currentPageCount:number = 1;
  currentPage:number;
  dataPerPageCount:number = 50;
  totalDataCount:number;
  totalPageCount:number;
  formTypeName:any;
  selectedgriddataId:any="";
  updateMode:boolean = false;
  ionEvent:any;
  checkPreviewData = false;
  currentMenu: any;
  flagForTdsForm:boolean = false;
  currentRowIndex:any = -1;
  checkForDownloadReport:boolean = false;
  gridButtons:any=[];
  downloadPdfCheck: any = '';
  downloadQRCode: any = '';
  public tab: any = [];
  details:any = {};  
  pdfFileSubscription:any;
  downloadProgress:any;
  nodatafoundImg :any = "../../../../assets/nodatafound.png";
  nodatafound:boolean = false;
  hasDetaildCard:boolean = false;
  childgridsubscription:any;
  // GPS variables below
  currentLatLng:any;
  userLocation:any;
  saveResponceSubscription:any;
  geocoder:any;

  multipleCardCollection:any=[];
  public nextCardData:any ={};
  nestedCardSubscribe:any;
  userTimeZone: any;
  userLocale:any;

  constructor(
    private platform: Platform,
    private envService: EnvService,
    private storageService: StorageService,
    private router: Router,
    private dataShareServiceService:DataShareServiceService,
    private formBuilder: FormBuilder,
    private callNumber: CallNumber,
    private apiService:ApiService,
    private restService:RestService,
    private coreUtilityService :CoreUtilityService,
    private dataShareService: DataShareService,
    private commonDataShareService:CommonDataShareService,
    private modalController: ModalController,
    private alertController: AlertController,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private permissionService:PermissionService,
    private http: HttpClient,
    private fileOpener: FileOpener,
    private file: File,
    private apppermissionsService: AndroidpermissionsService,
    public renderer: Renderer2,
    private app_googleService: App_googleService
  ) 
  {
    
    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    // below code is for slider and title name
    this.initializeApp();
    this.web_site_name = this.envService.getWebSiteName();
    this.gridDataSubscription = this.dataShareService.collectiondata.subscribe(data =>{
      let res:any;
      if(data && data.data && data.data_size && data.data.length > 0){
        res = data.data;
        this.totalDataCount = data.data_size;
        this.totalPageCount = Math.ceil(this.totalDataCount / this.dataPerPageCount);
        this.setCardData(res);
      }else{
        if(this.loadMoreData){
          if(data && data.data && data.data.length == 0){
            this.totalPageCount = 0;
          }
          this.setCardData(data.data);
        }else{
          this.nodatafound=true;
          this.notificationService.presentToastOnBottom("Somethisng went wrong, Data not available");
        }
      }
    });
    
    this.pdfFileSubscription = this.dataShareService.downloadPdfData.subscribe(data =>{
      this.setDownloadPdfData(data);
    })
    this.childgridsubscription = this.dataShareService.childGrid.subscribe(data =>{
      if(data && data.gridColumns){
        this.childColumns = data.gridColumns;
      }
    });
    this.nodatafound=false;

    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      if(responce && responce.data){
        this.setSaveResponce(responce);
      }
    });
    this.nestedCardSubscribe = this.commonDataShareService.nestedCard.subscribe(nextgriddata =>{
      if(nextgriddata && nextgriddata !=undefined){
        this.card = nextgriddata.card;
      }
    });
    
  }

  setCardData(data:any){
    if( this.currentPage < this.totalPageCount){
      if(this.loadMoreData && this.carddata.length !== 0 && this.totalDataCount !== 0 && this.updateMode){
        this.updateMode = false;
        let index = -1;
        if(this.selectedgriddataId && this.selectedgriddataId != ''){
          index = this.coreUtilityService.getIndexInArrayById(this.carddata,this.selectedgriddataId);
        }
        if(data && data.length > 0){  
            if(index != -1){
              this.carddata[index] = data[0];
            }
        }else{
            if(index != -1){
              this.carddata.splice(index,1);
            }
        }
        this.selectedgriddataId = '';
      }else if(data && data.length > 0 && !this.loadMoreData && !this.refreshlist){
        this.carddata = [];
        for(let i=0;i<data.length;i++){
          this.carddata.push(data[i]);
        }
      }else if(((data && data.length > 0 && (this.carddata.length > 0 && this.carddata.length !== this.totalDataCount) && (this.loadMoreData || this.refreshlist)))){
        if(this.ionEvent){
          if(this.ionEvent.type == 'ionInfinite'){
            for(let i=0;i<data.length;i++){
              this.carddata.push(data[i]);
            }
          }else if(this.ionEvent.type == 'ionRefresh'){
            this.carddata = [];
            for(let i=0;i<data.length;i++){
              this.carddata.push(data[i]);
            }  
          }
        }else{
          this.carddata = [];
          for(let i=0;i<data.length;i++){
            this.carddata.push(data[i]);
          }
        }
      }else if(((data && data.length > 0 && this.carddata.length == 0 && (this.loadMoreData || this.refreshlist)))){        
        this.carddata = [];
        for(let i=0;i<data.length;i++){
          this.carddata.push(data[i]);
        }
      }
    }else{
      this.nodatafound=true;
      console.log("Current page greater than totalPage");
    }
    if(this.carddata && this.carddata.length > 0){
      this.nodatafound=false;
    }else{
      this.nodatafound=true;
    }
  }

  resetVariabls(){
    if(this.updateMode){
    }
    if(!this.updateMode){
      this.carddata = []; 
      this.selectedgriddataId="";
    }
    this.formTypeName = '';
    this.editedRowIndex = -1;
    this.currentPageCount = 1;
    this.gridData = {};
  }

  initializeApp() {
    this.platform.ready().then(() => {

      // this.callLog.hasReadPermission().then(hasPermission => {
      //   if (!hasPermission) {
      //     this.callLog.requestReadPermission().then(results => {
      //       this.getContacts("type","1","==");
      //     })
      //       .catch(e => console.log(" requestReadPermission " + JSON.stringify(e)));
      //   } else {
      //     this.getContacts("type", "1", "==");
      //   }
      // })
      //   .catch(e => console.log(" hasReadPermission " + JSON.stringify(e)));

    });

  }
  ionViewwillEnter(){}

  ionViewwillLeave(){
    this.carddata=[];
    this.nodatafound=false;
  }
  ionViewDidLeave(){
    this.carddata=[];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onloadVariables();
    if(this.data && this.data.filterFormData){
      this.filterForm['value'] = this.data.filterFormData;
      // this.getGridData(this.collectionname);
      if(this.card && this.card.card && this.card.card.name){
        this.setCardDetails(this.card.card);
      }
    }else if(this.data && this.data.searchData && this.data.searchData.length > 0){
      let criteria = [];
      if(this.card && this.card.card && this.card.card){
        let card = this.card.card;
        if(card && card.search_field_name && card.search_field_name != ''){
          const cr = card.search_field_name + ";stwic;" +this.data.searchData + ";STATIC";
          criteria.push(cr);
          this.getGridData(this.collectionname,criteria);
        }
      }
      
    }else{
      this.filterForm['value'] = {};
      if(this.data && this.data._id){
        this.detailPage = true;
      }
      if(this.card && this.card.card && this.card.card.name){
        this.setCardAndTab(this.card);
      }
      if(this.card && this.card.card && this.card.card.grid_selection_inform != null){
        this.dataShareService.setGridSelectionCheck(this.card.card.grid_selection_inform)
      }
    }
  }

  onloadVariables(){
    this.nodatafound=false;
    this.gridButtons=[];
    this.currentPageCount = 1;    
    this.carddata=[];
    this.checkionEvents();
    this.hasDetaildCard=false;
    this.selectedgriddataId = "";
  }
  ngOnInit() {     
    // this.renderer.setStyle(this.cardViewContent['el'], 'webkitTransition', 'top 700ms');
  }

  ngOnDestroy(): void {
    // if (this.cardListSubscription) {
    //   this.cardListSubscription.unsubscribe();
    // }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
    if(this.pdfFileSubscription){
      this.pdfFileSubscription.unsubscribe();
    }
    if(this.childgridsubscription){
      this.childgridsubscription.unsubscribe();
    }
  }
  
  onContentScroll(event:any) {
    let scrollEventVal:any = {};
    if (event.detail.scrollTop >= 50) {
      this.renderer.setStyle(this.cardViewContent['el'], 'top', '-69px');
      scrollEventVal['scrollValue'] = event.detail.scrollTop;
      scrollEventVal['setTopValue'] = "-69px";
      this.primaryheaderNew.emit(scrollEventVal);
    } else {
      this.renderer.setStyle(this.cardViewContent['el'], 'top', '0px');
      scrollEventVal['scrollValue'] = event.detail.scrollTop;
      scrollEventVal['setTopValue'] = "0px";
      this.primaryheaderNew.emit(scrollEventVal);
    }
  }

  getCardDataByCollection(i: number,parentId?:string) {
    this.resetVariabls();
    const cardWithTab = this.coreUtilityService.getCard(i);
    if(parentId !=null && parentId !=undefined){
      cardWithTab.card['parent_id'] = parentId;
      this.card = cardWithTab;
    }
    this.setCardAndTab(cardWithTab);    
  } 
  setCardAndTab(cardWithTab){
    if(cardWithTab && cardWithTab.card){
      let card  = cardWithTab.card;
      this.setCardDetails(card);
    } 
    if(cardWithTab && cardWithTab.tabs && cardWithTab.tabs.length > 0){
      this.tabMenu = cardWithTab.tabs;
      this.selectedIndex = cardWithTab.selectedTabIndex;
      this.popoverMenu = cardWithTab.popoverTabbing;
      // if(cardWithTab && cardWithTab.popoverTabbing){
        this.popoverTabbing.emit(this.tabMenu);
      // }
    }else{
      this.tabMenu = [];
      this.selectedIndex = -1;
    }
  }

  async setCardDetails(card) {  
    let criteria:any = [];
    let parentcard:any = {};
    if(card){
      if(card.buttons){
        this.gridButtons = card.buttons;
      }else{
        this.gridButtons = [];
      }
      if(card.add_new){
        if(this.detailPage){
          this.addNewEnabled = false;
        }else{
          this.addNewEnabled = true;
        }
      }else{
        this.addNewEnabled = false;
      }
      if(card.add_calling){
        if(this.detailPage){
          this.addCallingFeature = false;
        }else{
          this.addCallingFeature = true;
        }
      }else{
        this.addCallingFeature = false;
      } 
      // if(card.call_status){
      //   if(this.detailPage){
      //     this.callStatus = false;
      //   }else{
      //     this.callStatus = true;
      //   }
      // }else{
      //   this.callStatus = false;
      // }
      if (card.card_type !== '') {
        this.cardType = card.card_type.name;
      }
      // this.childColumn = card.child_card;
      if(card.fields && card.fields.length > 0){
        this.columnList = card.fields;      
      }
      if(this.createFormgroup){
        let columnList:any =[];
        this.columnList.forEach(element => {
          if(element.filter){
            columnList.push(element);
          }
        });
        this.columnListOutput.emit(columnList);
      }
      if(card.parent_criteria){
        if (card.api_params_criteria && card.api_params_criteria.length > 0 ) {
          card.api_params_criteria.forEach(element => {
            criteria.push(element);
          });
          parentcard = card;
        }
      }
      if(card.enable_refresh_mode){
        this.refreshlist = card.enable_refresh_mode;
        this.checkionEvents();
      }else{
        this.refreshlist = false;
      }      
      if(card.enable_load_more ){   
        this.loadMoreData = card.enable_load_more
        this.checkionEvents();
        if(this.selectedgriddataId && this.selectedgriddataId !=''){
          const cr = "_id;eq;" + this.selectedgriddataId + ";STATIC";
          criteria.push(cr);
          parentcard = card;
        }
      }else{
        this.loadMoreData = false;
        this.selectedgriddataId = "";
      }
      if((card.child_card && card.child_card['_id']) || (card.grid && card.grid['_id'])){
        if(card.grid && card.grid['_id']){
          this.getChildGridFieldsbyId(card.grid['_id']);
        }
        this.hasDetaildCard = true;
      }else{
        this.hasDetaildCard = false;
      }      
      let collectioncriteria:any = await this.collectionSpecificCriteria(card);
      if(collectioncriteria && collectioncriteria.length > 0){
        criteria = this.setCriteria(criteria,collectioncriteria);
      }
      this.collectionname = card.collection_name;
      if(this.collectionname !=''){
        if(this.currentMenu == undefined){
          this.currentMenu = {};
        }
        this.currentMenu['name'] = this.collectionname;
        this.dataShareServiceService.setCollectionName(card.collection_name);
      }
      this.getGridData(this.collectionname, criteria, parentcard);
    }
  }

  async collectionSpecificCriteria(card:any){
    let customCriteria = [];
    if(this.cardType == "trackOnMap"){
      if(this.platform.is("hybrid")){
        // let isGpsEnabled = await this.app_googleService.checkGPSPermission();
        let isGpsEnabled = await this.app_googleService.checkGeolocationPermission();
        if(isGpsEnabled){
          this.requestLocationPermission();
        }else{
          this.gpsEnableAlert();
        }
      }else{
        await this.getCurrentPosition();
      }
      if(card && card.collection_name == "travel_tracking_master" && card.parent_id && card.parent_id !=''){
        const cr = "travelPlan._id;eq;" + card.parent_id + ";STATIC";
        customCriteria.push(cr);
        return customCriteria;
      }
    }
  }

  search(searchcard) {
    // const criteria = "quotation_status;stwic;"+this.searchcard+";STATIC";
    // this.getGridData(this.collectionname, [criteria]);
    // this.getGridData(this.collectionname);
  }

  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.getGridData(this.collectionname);
    }
  }

  // goBack(){
  //   this.carddata = [];
  //   this.tabMenu = [];
  //   this.openFilter = false;
  // }

  async modaldetailCardButton(column, data){
    if(this.hasDetaildCard){
     const cardmaster=this.dataShareServiceService.getCardList();
      // const cardmaster = this.commonDataShareService.getModuleList();
      const childColumn = this.childColumn;
      if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
        cardmaster.forEach(element => {
          if(element._id == childColumn._id ){
            this.childColumns = element.fields;
            this.childCardType = element.card_type;
          }
        });
      }    
      //modalShowfunction
      // if(this.getcardmasete.get("viewtype") ="cardtype") {

      // } else (""){
        
      // }
      const modal = await this.modalController.create({
        component: ModalDetailCardComponent,
        componentProps: {
          "childData": data,
          "childColumns": this.childColumns,
          "childDataTitle": this.childDataTitle,
          "childCardType" : this.childCardType,
          "selected_tab_index": this.selectedIndex
        },
        swipeToClose: true
      });
      modal.componentProps.modal = modal;
      modal.onDidDismiss().then((result) => {
        this.detailPage = false;
      });
      return await modal.present();
    }else{
      return console.log("No detail card found.");
    }
  }

  // go to new page 2nd method
  async detailCardButton(column, data){
    if(this.detailPage){
      //const index = this.coreUtilityService.getIndexInArrayById(this.carddata,data._id);
      this.modaldetailCardButton(column,data);
    }else{
      const newobj = {
        "childdata": data,
        "selected_tab_index": this.selectedIndex
      }
      this.dataShareServiceService.setchildDataList(newobj);  
      this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);  
      this.router.navigate(['card-detail-view']);
    }
    
  }
  
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...');
  }

  call(card:any,Index:number) {
    let callingNumber:any;
    let startTime: any = new Date();
    let startTimeMs:any = startTime.getTime(startTime);
    this.editedRowIndex = Index;
    if(card.mobile && card.mobile.length >= 10){
      callingNumber = card.mobile;
    }else if(card.billing_mobile && card.billing_mobile.length >= 10){
      callingNumber = card.billing_mobile;
    }else if(card.phone && card.phone.length >= 10){
      callingNumber = card.phone;
    }else{
      console.log("No number Found");
    }

    if(callingNumber && callingNumber != null){
      this.callNumber.callNumber(callingNumber, true)
        .then(res => {
          // console.log('Launched dialer! ' + res);
          this.notificationService.presentToastOnBottom("Calling on :- " + callingNumber,"success");
          
          this.callDetailRecord(card, startTimeMs);
        })
        .catch(err => console.log('Error launching dialer ' + err));
    }else{
      this.notificationService.presentToastOnBottom("Invalid number or Number not found","danger");
    }
  }

  callInvoice(card:any,Index:number) {
    let callingNumber:any;
    if(card.billing_mobile !=''){
      callingNumber = card.billing_mobile;
    }
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
  }
  setCriteria(listCiteria,criteria){
    if(criteria && criteria.length > 0){
      criteria.forEach(cr => {
        if(listCiteria && listCiteria.length >=0 ){
          listCiteria.push(cr);
        }
      });
    }
    return listCiteria;
  }
  async getGridData(collectionName,criteria?,parentCard?){
    const crList = this.restService.getfilterCrlist(this.columnList, this.filterForm)
    const params = collectionName;
    let cardCriteria = [];
    let object = {};
    if(criteria && criteria.length > 0){
      cardCriteria = this.setCriteria(cardCriteria,criteria);
      object = parentCard;
    }
    if(this.detailPage){
      if(this.card && this.card.card){
        let card = this.card.card
        if(card.api_params_criteria && card.api_params_criteria.length > 0){
          cardCriteria = this.setCriteria(cardCriteria,card.api_params_criteria);
          object = this.data
        }        
      } 
    }
    
    let user = this.storageService.getUserInfo();
    object["user"]=user;
    let data = this.restService.getPaylodWithCriteria(params,'',cardCriteria,object);
    this.currentPage = this.currentPageCount - 1;
    data['pageNo'] = this.currentPage;
    data['pageSize'] = this.dataPerPageCount;
    // if(this.currentPageCount < this.totalPageCount){
    //   // let dataIncrement = this.pageCount ++;
    //   data['pageNo'] = 0;
    //   data['pageSize'] = this.currentPageCount * this.dataPerPageCount;
    // }else{
    //   data['pageNo'] = this.currentPageCount;
    //   data['pageSize'] = this.dataPerPageCount;
    // }
    
    if(crList && crList.length > 0){
      crList.forEach(cr => {
        if(data && data.crList && data.crList.length >= 0){
          data.crList.push(cr);
        }
      });
    }
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getDatabyCollectionName(payload);
  }

  getValueForGrid(field,object){
    return this.coreUtilityService.getValueForGrid(field,object);
  } 

  tabmenuClick(index:number){
    this.selectedIndex = index;
    this.carddata = [];
    this.createFormgroup = true;
    const tab = this.tabMenu[index];
    const moduleList = this.commonDataShareService.getModuleList();
    const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id"); 
    const card = moduleList[tabIndex];
    this.card['card'] = card;
    this.card.selectedTabIndex = index;
    this.setCardDetails(card);
  } 
  
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    //this.router.navigate(['crm/quotation']);
    this.dataShareServiceService.setcardData(card);
  }
  // add new card or record in cardlist 
  async addNewForm(formName?:any){
    if (this.permissionService.checkPermission(this.currentMenu.name, 'add')) {
      if(formName){
        this.formTypeName = formName;
      }else{
        this.formTypeName = "default";
      }
      this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);
      let card = this.card;
      let form:any = {};
      let id = '5f6d95da9feaa2409c3765cd';
      if(card && card.card && card.card.form){
        form = this.coreUtilityService.getForm(card.card.form,formName);
        if(form && form._id && form._id != ''){
          id = form._id;
        }else if(card.card.form && card.card.form._id){
          form = card.card.form;
          id = card.card.form._id;
        }
      }    
      this.commonDataShareService.setFormId(id);
      // this.router.navigate(['crm/form']);
      const modal = await this.modalController.create({
        component: FormComponent,
        componentProps: {
          "childData": this.gridData,
          "editedRowIndex": this.editedRowIndex,
          "addform" : form,
          "formTypeName" : this.formTypeName,
        },
        id: form._id,
        showBackdrop:true,
        backdropDismiss:false,
      });
      modal.componentProps.modal = modal;
      modal.onDidDismiss().then((result) => {
        this.getCardDataByCollection(this.selectedIndex);
      });
      return await modal.present();
    } else {
      this.notificationService.presentToastOnBottom("Permission denied !!!","danger");
    }
  }


  getFirstCharOfString(char:any){
    return this.coreUtilityService.getFirstCharOfString(char);
  }
  // for entering call record after call cut with customer
  async callDetailRecord(data:any, startTime:any){
    const modal = await this.modalController.create({
      component: CallDataRecordFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        "cardData": data,
        "selectedRowIndex": this.editedRowIndex,
        "startTime" : startTime,
      },
      showBackdrop:true,
      backdropDismiss:false,
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then((result) => {
      this.getCardDataByCollection(this.selectedIndex);
    });
    return await modal.present();
  }
  // Pull from bottom for loading more cards
  loadData(event:any) {
    if(this.loadMoreData){
      this.ionEvent = event;
      setTimeout(() => {
        event.target.complete();
        // this.loadMoreData = true;
        if(this.currentPageCount <= this.totalPageCount){
          if (this.carddata.length === this.totalDataCount || this.totalDataCount === 1) {// App logic to determine if all data is loaded
            this.ionEvent.target.disabled = true;    // and disable the infinite scroll
            this.notificationService.presentToastOnBottom("You reached at the end.","success");
          }else{
            this.currentPageCount++;
            this.getGridData(this.collectionname);  
          }
        }else{
          this.notificationService.presentToastOnBottom("No more data.");
        }
        
      }, 2000);

    }else{
      console.log("Load More Data feature disable.");
    }
  }
  // Pull from Top for Do refreshing or update card list 
  doRefresh(event:any) {
    if(this.refreshlist){
      this.ionEvent = event;
      console.log('Begin doRefresh async operation');
      this.updateMode = false;  
      setTimeout(() => {
        event.target.complete();
        let card:any;
        let criteria:any = [];
        if (this.carddata.length === this.totalDataCount) { // App logic to determine if all data is loaded
          // this.refreshEvent.target.disabled = true;    // Disable the infinite scroll if carddata.length === response.totaldata.length
          // console.log('doRefresh async operation has ended');
          this.notificationService.presentToastOnBottom("No Updates Available","success");
        }else{
          if(this.card && this.card.card){
            card = this.card.card;
          }
          if(card && card.api_params_criteria && card.api_params_criteria.length > 0){
            card.api_params_criteria.forEach(element => {
              criteria.push(element);
            });
          }
          this.getGridData(this.collectionname, criteria, card);
        }
      }, 2000);

    }else{
      console.log("Top refresh feature disable.");
    }
  }
  gridButtonAction(gridData,index,button){
    if(button && button.onclick && button.onclick.action_name){
      switch (button.onclick.action_name.toUpperCase()) {
        case "PREVIEW":
          this.checkPreviewData = true;
          this.restService.preview(gridData,this.currentMenu,'grid-preview-modal');
          break;
        case "TEMPLATE": 
          let object =JSON.parse(JSON.stringify(gridData))    
          console.log(gridData); 
          //this.templateModal('template-modal',object,index, 'Template')
          break;
        case 'UPDATE':
          this.editedRowData(index,button.onclick.action_name.toUpperCase())
          break;
        case 'DOWNLOAD':
          let currentMenu = '';
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentMenu = this.currentMenu.name
          }
          this.downloadPdfCheck = this.restService.downloadPdf(gridData,currentMenu);         
          break;
          case 'GETFILE':
            let currentsMenu = '';
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentsMenu = this.currentMenu.name
          }
          this.downloadPdfCheck = this.restService.getPdf(gridData,currentsMenu);         
          break;
          case 'TDS':
            let currentMenuForTds = '';
            this.flagForTdsForm = true;
            this.currentRowIndex = index;
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentMenuForTds = this.currentMenu.name
          }
          const getFormData:any = this.restService.getFormForTds(gridData,currentMenuForTds,this.carddata[index]);        
          if(getFormData._id && getFormData._id != undefined && getFormData._id != null && getFormData._id != ''){
            getFormData.data['data']=gridData;
            this.apiService.GetForm(getFormData);
          }else{
            getFormData.data=gridData;
            this.apiService.GetForm(getFormData);
          }
          break;
        case 'CANCEL':
          this.editedRowData(index,button.onclick.action_name)
          break;
        case 'INLINEEDIT':
          //this.gridInlineEdit(gridData,index);
          break;
        case 'COMMUNICATION':
          // this.commonFunctionService.openModal('communication-modal',gridData);
          break;
        case 'DOWNLOAD_QR':
          this.downloadQRCode = this.restService.getQRCode(gridData,this.carddata[index]);
          this.checkForDownloadReport = true;
          break;
        case 'DELETE_ROW':
          if(this.permissionService.checkPermission(this.currentMenu.name, 'delete')){
            this.editedRowData(index,button)
          }else{
            this.notificationService.showAlert("Permission denied","You don't have this Permission",['Dismiss']);
          }
            break;
          // case 'AUDIT_HISTORY':
          //   if (this.permissionService.checkPermission(this.currentMenu.name, 'auditHistory')) {
          //     let obj = {
          //       "aduitTabIndex": this.selectTabIndex,
          //       "tabname": this.tabs
          //     }
          //     this.commonFunctionService.getAuditHistory(gridData,this.elements[index]);
          //     this.modalService.open('audit-history',obj);
          //   }else {
          //     this.notificationService.notify("bg-danger", "Permission denied !!!");
          //   }
          // break;
          case 'GOOGLE_MAP':
            this.loadNextGrid(index, gridData, button.onclick.action_name.toUpperCase());
            break;
          case 'GOOGLE_TRACKING_START':
            this.startTracking(gridData, index, button.onclick.action_name.toUpperCase());
            break;
        default:
          this.editedRowData(index,button.onclick.action_name);
          break;
      }
    }
  }

  editedRowData(index,formName) {
    if (this.permissionService.checkPermission(this.currentMenu.name, 'edit')) {
      this.editedRowIndex = index;
      this.gridData = this.carddata[index];
      this.selectedgriddataId = this.gridData._id;
      this.updateMode = true;
      if(formName == 'UPDATE'){   
        // if(this.checkUpdatePermission(this.carddata[index])){
        //   return;
        // }   
        // if(this.checkFieldsAvailability('UPDATE')){
        //   this.addNewForm(formName);
        // }else{
        //   return;
        // }  
        this.addNewForm(formName);      
      }else{
        this.addNewForm(formName);
      }  
      this.selectedIndex = index;    
    } else {
      this.notificationService.presentToastOnBottom("Permission denied !!!","danger");
    }
  }

  async storeCardGridDetails(selectedgridcard:any,index:number){
    let updateMode =  this.updateMode;
    let cardLayoutDetails = {
      "collection_name":this.currentMenu.name,
      "card":this.card,
      "selected_grid_card":selectedgridcard,
      "selected_grid_card_index":index,
      "carddata_list":this.carddata,
      "updateMode" : updateMode,
      "module_index":this.commonDataShareService.getModuleIndex(),
    }
    if(this.multipleCardCollection && this.multipleCardCollection.length > 0){
      this.multipleCardCollection.forEach(element => {
        if(element.module_index != this.commonDataShareService.getModuleIndex()){
          this.multipleCardCollection.push(cardLayoutDetails);
          this.commonDataShareService.setMultipleCardCollection(this.multipleCardCollection);
        }
      });
    }else{
      this.multipleCardCollection.push(cardLayoutDetails);
      this.commonDataShareService.setMultipleCardCollection(this.multipleCardCollection);
    }
       
  }
  
  async loadNextGrid(index:number,gridData:any,buttonName?:any){
    const status = await this.checkStatus(gridData); //only for travel approve status
    if(status){
      if(gridData && gridData.name){
        this.parentCardName.emit(gridData.name);
      }
      await this.storeCardGridDetails(gridData,index);

      let parentcard = this.card.card;
      // this.selectedgriddataId = gridData._id;

      let nestedCard:any = {};
      let id="";
      if(parentcard && parentcard.gridChildCard){
        nestedCard = this.coreUtilityService.getNestedCard(parentcard.gridChildCard,buttonName);
        if(nestedCard && nestedCard._id && nestedCard._id != ''){
          id = nestedCard._id;
        }
        this.commonDataShareService.setNestedCardId(id);
        const moduleList = this.commonDataShareService.getModuleList();
        const nxtCardindex = this.coreUtilityService.getIndexInArrayById(moduleList,nestedCard._id,"_id");
        this.commonDataShareService.setModuleIndex(nxtCardindex);
        this.getCardDataByCollection(index, gridData._id); 
        // this.commonDataShareService.setNestedCard(nestedCard);
        // let cardWithTabs:any = this.coreUtilityService.getCard(index);
        // let nestedCardDetail:any = cardWithTabs.card;
        // nestedCardDetail['parent_item_id']=
        // this.setCardDetails(nestedCardDetail);
      }else {
        console.log("parentcard.gridChildCard : is not Present or undefined." )
        this.notificationService.presentToastOnBottom("Something went wrong. Please connect to Admin.");
      }
    
    }else{
      this.notificationService.presentToastOnBottom("This Plan is not Approved.");
    }
        
  }
  async checkStatus(gridData:any){
    if(gridData && gridData.approvdStatus !="Approve"){
      return false;
    }else{
      return true;
    }
  }
  async loadPreviousGrid(){
    let nextGridData:any = {}
    if(this.multipleCardCollection.length > 0){
      nextGridData = this.multipleCardCollection[this.multipleCardCollection.length -1];
    }
    this.carddata=nextGridData.carddata;
    // this.setCardDetails(nextNextGridData.card);
  }

  checkUpdatePermission(rowdata){
    if(this.details && this.details.permission_key && this.details.permission_key != '' && this.details.permission_value && this.details.permission_value != ''){ 
      const value = this.coreUtilityService.getObjectValue(this.details.permission_key,rowdata) 
      if(value == this.details.permission_value){
        this.notificationService.showAlert("Can't be update!!!","NO permission",['Dismiss'])
        return true;
      }
    }else{
      return false;
    }
  }
  checkFieldsAvailability(formName){
    if(this.card && this.card.card && this.card.card.forms){
      let form = this.coreUtilityService.getForm(this.card.card.forms,formName);        
      if(form['tableFields'] && form['tableFields'] != undefined && form['tableFields'] != null){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  getChildGridFieldsbyId(childrGridId:string){
      const params = "grid";
      const criteria = ["_id;eq;" + childrGridId + ";STATIC"];
      const payload = this.restService.getPaylodWithCriteria(params, '', criteria, {});
      this.apiService.GetChildGrid(payload);
  }
  // myFiles:any;
  setDownloadPdfData(downloadPdfData){
    if (downloadPdfData != '' && downloadPdfData != null && this.downloadPdfCheck != '') {
      let link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      const file = new Blob([downloadPdfData.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(file);
      link.href = url;
      let fileExt:any = '';
      let fileName:any = '';
      if(downloadPdfData && downloadPdfData.filename){
        fileExt = downloadPdfData.filename.split('.').pop();
        fileName = downloadPdfData.filename;
      }
      
      if(this.platform.is("hybrid")){
        this.downloadToMobile(file,fileName)
          // this.http.get(url , {
          //   responseType : 'blob',
          //   reportProgress: true,
          //   observe:'events'
          // }).subscribe(async event =>{
          //   if(event.type === HttpEventType.DownloadProgress){
          //     this.downloadProgress = Math.round((100 * event.loaded)/event.total);
          //   }
          //   else if(event.type === HttpEventType.Response){
          //     this.downloadProgress = 0;
      
          //     const name = downloadPdfData.filename;
          //     const base64 = await this.convertBlobToBase64(event.body) as string;
      
          //     const savedFile = await Filesystem.writeFile({
          //       path: name,
          //       data: base64,
          //       directory: Directory.Documents,
          //     });
          //     console.log(savedFile.uri);
          //     const path = savedFile.uri;
          //     const mimeType = this.getMimetype(name);
      
          //     this.fileOpener.open(path,mimeType)
          //     .then(()=> console.log('File is opened'))
          //     .catch(error => console.log('Error opening file',error));
      
          //     // this.myFiles.unshift(path);
              
          //     // Storage.set({
          //     //   key:FILE_KEY,
          //     //   value: JSON.stringify(this.myFiles)
          //     // })
          //   }
          // })
      }else{
        link.download = downloadPdfData.filename;
        document.body.appendChild(link);
        link.click();
      }
      link.remove();
      this.downloadPdfCheck = '';
      this.apiService.ResetPdfData();
      fileExt = '';
      fileName = '';
    }
  }
  arrayBufferToBlob(arrayBufferData:any, extentionType?:any,filename?:any){  
    const fileExtension = extentionType;
    let file_Type: any;
    let file_prefix: any;
    if(fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg" ){
      file_Type = "image/" + extentionType;
      file_prefix = "Image";
    }else if(fileExtension == "xlsx" || fileExtension == "xls"){
      file_Type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
      file_prefix = "Excel";
    }else if(fileExtension == "pdf"){
      file_Type = "application/" + extentionType;
      file_prefix = "PDF";
    }else{
      file_Type = "application/octet-stream";
      file_prefix = "TEXT";
    }

    let fileName:any;
    if(filename && filename !=undefined){      
      fileName = filename;
    }else{
      fileName = file_prefix + '_' + new Date().getTime() + "." + fileExtension;
    }
    const blobData:Blob = new Blob([arrayBufferData],{type:file_Type});
    
    this.downloadToMobile(blobData,fileName);

  }
  async downloadToMobile(blobData:any,fileName:any,FolderName?:any){
    let file_Type:any = '';
    let folderName:any = '';
    if(blobData && blobData.type){
      file_Type = blobData.type;
    }
    if(FolderName == undefined || FolderName == null){
      folderName = 'Download'
    }else{
      folderName = FolderName;
    }
    let readPermission = await this.permissionService.checkAppPermission("READ_EXTERNAL_STORAGE");
    let writePermission = await this.permissionService.checkAppPermission("WRITE_EXTERNAL_STORAGE");

    if(readPermission && writePermission){

      // ==========using native file    
      this.file.checkDir(this.file.externalRootDirectory, folderName).then(() => {

        this.file.writeFile(this.file.externalRootDirectory + '/' + folderName + '/',fileName,blobData,{replace:true}).then(async() => {
          // confirm alert
          let openFile:any = await this.notificationService.confirmAlert("Saved in Downloads","Open file  " + fileName);
          if(openFile == "confirm"){
            const path = this.file.externalRootDirectory + '/' + folderName + '/' + fileName;
            const mimeType = file_Type;      
            this.fileOpener.open(path,mimeType)
            .then(()=> console.log('File is opened'))
            .catch(error => console.log('Error opening file ',error));
          }
        }).catch( (error:any) =>{
          this.storageService.presentToast(JSON.stringify(error));
        })
        
      }).catch( (error:any) =>{
        if(error && error.message == "NOT_FOUND_ERR" || error.message == "PATH_EXISTS_ERR"){
          
          this.file.createDir(this.file.externalRootDirectory, folderName, false).then((response:any) => {
            console.log('Directory create '+ response);
            this.file.writeFile(this.file.externalRootDirectory + "/" + folderName + "/",fileName,blobData,{replace:true}).then(() => {
              this.storageService.presentToast(fileName + " Saved in " + folderName);
            })

          }).catch( (error:any) =>{            
            this.storageService.presentToast(JSON.stringify(error));
          })
        }
      });
    }else{
      let gavepermission:any = await this.notificationService.presentToastWithButton("Please Allow File and Media Access in App Permission, to Download File","",'Allow',"",5000);
      if(gavepermission == "cancel"){
        this.apppermissionsService.openNativeSettings('application_details');
      }
    }
  }

  checkionEvents(){
    if(this.refreshlist){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = !this.refreshlist;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = this.refreshlist;
      }
    }
    if(this.loadMoreData){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = this.loadMoreData;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = !this.loadMoreData;
      }
    }
    if(this.loadMoreData && this.refreshlist){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = !this.refreshlist;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = !this.loadMoreData;
      }
    }
    
  }
  async gpsEnableAlert(){     
    const alert = await this.alertController.create({
      cssClass: 'my-gps-class',
      header: 'Please Enable GPS !',
      message: 'For smooth app experience please give us your location access.',
      buttons: [
        {
          text: 'No, thanks',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirmed',
          handler: () => {
            this.requestLocationPermission();
          },
        },
      ],
    });

  await alert.present();
  }
  async enableGPSandgetCoordinates(){
    if(isPlatform('hybrid')){
        this.gpsEnableAlert();
    }else{
      const isGpsEnable:boolean = await this.app_googleService.checkGPSPermission();
      if(isGpsEnable){
        this.requestLocationPermission();
      }
    }
  }
  async requestLocationPermission() {
    let isGpsEnable = false;
    if(isPlatform('hybrid')){
      const permResult = await this.permissionService.checkAppPermission("ACCESS_FINE_LOCATION");
      if(permResult){
        isGpsEnable = await this.app_googleService.askToTurnOnGPS();
        if(isGpsEnable){
          this.userLocation = await this.app_googleService.getUserLocation();
          if(this.userLocation !=null && (this.userLocation.lat !=null || this.userLocation.latitude !=null)){
            this.currentLatLng ={
              lat:this.userLocation.lat ? this.userLocation.lat : this.userLocation.latitude,
              lng:this.userLocation.lng ? this.userLocation.lng : this.userLocation.longitude
            }
            return true;
          }
        }
        else{
          this.enableGPSandgetCoordinates();
        }
      }
    }else{      
      // if(navigator.geolocation){
        // const successCallback = (position) => {
        //   console.log("Web current Location: ",position);
        //   if(position && position.coords){
        //     this.userLocation = position;
        //     let pos = position.coords;
        //     this.currentLatLng ={
        //       lat:pos.latitude,
        //       lng:pos.longitude
        //     }
        //     return true;
        //   }
        // };      
        // const errorCallback = (error) => {
        //   console.log(error);
        //   this.currentLatLng = {}
        //   return false;
        // };
        // navigator.geolocation.getCurrentPosition(successCallback, errorCallback);        
      // }
      await this.getCurrentPosition();
    }
    
  }
  async getCurrentPosition(){
    if(navigator?.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        this.userLocation = position;
        this.currentLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        return true;
      });
    }else{
      this.notificationService.presentToastOnBottom("Browser doesn't support Geolocation.");
      this.currentLatLng = {};
    }
  }
  async actionBtnClicked(index:number,btnStatus:any){
    this.updateMode=true;
    this.editedRowIndex = index;
    let header:string = "Are you sure !";
    let msg:string = "Wanna do this?";
    if(btnStatus == "reject"){
      header = 'Reject Item';
      msg = 'Do you wanna Reject the Item Delivery ?'
    }else if(btnStatus == "accept"){
      header = 'Accept Item';
      msg = 'Accept this Item for Delivery ?'
    }
    let confirmDelete:any = await this.notificationService.confirmAlert(header,msg);
    let selectedRow:any = {};
    selectedRow = this.carddata[index];
    if(confirmDelete === "confirm"){
      if(btnStatus == "reject"){ 
        selectedRow['status'] = "REJECTED";
        selectedRow['rejectedDateTime'] = this.datePipe.transform(new Date(), "dd-MM-yyyyThh:mm:ss");
        // this.carddata.splice(index,1);
      }
      if(btnStatus == "accept"){ 
        selectedRow['status'] = "ACCEPTED";
        selectedRow['acceptedDateTime'] = this.datePipe.transform(new Date(), "dd-MM-yyyyThh:mm:ss");
      }
      this.carddata[index]=selectedRow;
      let payload = {
        'data':selectedRow,
        'curTemp': this.collectionname
      }
      this.apiService.SaveFormData(payload);
    }
  }
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '') {
        if (saveFromDataRsponce.success == 'success' && !this.updateMode) {          
          let card:any;
          let criteria:any = [];
          if(this.card && this.card.card){
            card = this.card.card;
          }
          if(card && card.api_params_criteria && card.api_params_criteria.length > 0){
            card.api_params_criteria.forEach(element => {
              criteria.push(element);
            });
          }
          this.getGridData(this.collectionname,);
          // this.setCardDetails(this.card.card);
        }if (saveFromDataRsponce.success == 'success' && this.updateMode) {
          this.carddata[this.editedRowIndex] == saveFromDataRsponce.data;
        }
      }
    }
  }
  async startTracking(data:any,index:number,actionname?:any){
    try{
      this.updateMode = true;
      this.editedRowIndex = index;
      let isGpsEnable = await this.app_googleService.checkGPSPermission();
      if(isGpsEnable && this.currentLatLng && this.currentLatLng.lat){
        let destination:any={}
        if(data.customerAddress !=null && data.customerAddress !=undefined){
          const geocodeAddress:any = {
            'address' : data.customerAddress
          }
          destination = await this.app_googleService.getGoogleAddressFromString(geocodeAddress);          
        }
        if(data.trackingStatus == "ASSIGNED"){
          const newDate = new Date();
          // let startTime = await this.getCurrentTime(newDate);
          data['trackingStatus'] = "PROGRESS";
          data['trackStartDateTime'] = JSON.parse(JSON.stringify(newDate));
          data['trackStartTime'] = await this.dataShareServiceService.getCurrentTime(newDate);          
          data['trackStartLocation'] = {
            'latitude': this.currentLatLng.lat,
            'longitude': this.currentLatLng.lat
          }
          data['customerAddressDetail'] = {
            'latitude': destination?.geometry?.location.lat,
            'longitude': destination?.geometry?.location.lat,
            'placeId': destination?.place_id
          };
          let packagePayload = {
            "curTemp":this.collectionname,
            "data":data
          }
          this.apiService.SaveFormData(packagePayload); //For updation status of package item
        }
        let additionalData:any = {
          "collectionName":this.collectionname,
          "currentLatLng":this.currentLatLng,
          "destinationAddress": destination
        }
        const modal = await this.modalController.create({
          component: GmapViewComponent,
          cssClass: 'my-custom-modal-css',
          componentProps: { 
            "selectedRowData": data,
            "selectedRowIndex": index,
            "additionalData": additionalData,
          },
          showBackdrop:true,
          backdropDismiss:false,
        });
        modal.componentProps.modal = modal;
        modal.onDidDismiss().then(async (result:any) => {
          console.log("Google map Modal Closed", result);
          if(result && result.role == "delivered"){
            this.editedRowData(index,"UPDATE");
            //   let packagePayload = {
            //   "curTemp":this.collectionname,
            //   "data":result.data
            // }
            // await this.apiService.SaveFormData(packagePayload);
          }
          this.carddata[index] = result.data;
          // this.getCardDataByCollection(this.selectedIndex);
        });
        return await modal.present();
      }else{
        await this.requestLocationPermission();
        this.notificationService.presentToastOnBottom("Getting your location, please wait..");
        this.startTracking(data,index); 
      }

    }catch{

    }
  }
  
  async getUTCDate(date:any){
    let Mdate = date.substring(0,11) + "00:00:00" + date.substring(19);
    let utcDate:any = zonedTimeToUtc(Mdate, this.userTimeZone);
    return utcDate = this.datePipe.transform(utcDate,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", 'UTC');
  }

  mapOutPutData(index:number){
    this.editedRowData(index,"UPDATE");
  }
  
  async getGeocodeAddress(LatLng:any) {
    this.geocoder = new google.maps.Geocoder();
    // const latlngStr = ;
    const latlng = {
      lat: parseFloat(LatLng.lat),
      lng: parseFloat(LatLng.lng),
    };
  
    this.geocoder.geocode({ location: latlng }).then((response) => {
        if (response.results[0]) {
          console.log(response.results[0])
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  }

  convertBlobToBase64 = (blob :Blob)=>new Promise ((resolve,reject) =>{
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () =>{
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
  

}
;