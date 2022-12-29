import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService, NotificationService, PermissionService } from '@core/ionic-core';
import { filter } from 'rxjs';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Platform, ModalController, AlertController, PopoverController } from '@ionic/angular';
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

@Component({
  selector: 'app-cards-layout',
  templateUrl: './cards-layout.component.html',
  styleUrls: ['./cards-layout.component.scss'],
  providers: [File]
})
export class CardsLayoutComponent implements OnInit, OnChanges {

  @Input() card:any;
  @Input() data:any ={};
  @Output() columnListOutput = new EventEmitter();
  @Input() searchcard:any;
  @Output() formNameTypeTravel = new EventEmitter();
  @Output() popoverTabbing = new EventEmitter();



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
  selectedgriddataId:any;
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
    private apppermissionsService: AndroidpermissionsService
  ) 
  {
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
    this.nodatafound=false;
    
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
      }else if(((data && data.length > 0 && (this.carddata.length > 0 && this.carddata.length !== this.totalDataCount) && this.loadMoreData || this.refreshlist))){
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
      }else if(((data && data.length > 0 && this.carddata.length == 0 && this.loadMoreData || this.refreshlist))){        
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
    if(this.formTypeName == "UPDATE"){
      this.formTypeName = '';
      this.currentPageCount = 1;
    }else if(this.formTypeName == "default"){
      this.formTypeName = '';
      this.editedRowIndex = -1;
      this.currentPageCount = 1;
      this.carddata = [];
      this.gridData = {};
      // this.loadMoreData = true;
    }else{
      this.editedRowIndex = -1;
      this.currentPageCount = 1;
      this.gridData = {};
    }
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
      this.getGridData(this.collectionname);
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
      if(this.data && this.data._id){
        this.detailPage = true;
      }
      if(this.card && this.card.card && this.card.card.name){
        this.setCardAndTab(this.card)
      }
      if(this.card && this.card.card && this.card.card.grid_selection_inform != null){
        this.dataShareService.setGridSelectionCheck(this.card.card.grid_selection_inform)
      }
      this.filterForm['value'] = {};
    }
  }

  onloadVariables(){
    this.nodatafound=false;
    this.gridButtons=[];
    this.currentPageCount = 1;    
    this.carddata=[];
    this.checkionEvents();
    this.hasDetaildCard=false;
  }
  ngOnInit() { }

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
  }

  getCardDataByCollection(i) {
    this.resetVariabls();
    const cardWithTab = this.coreUtilityService.getCard(i); 
    this.setCardAndTab(cardWithTab)
    
  } 
  setCardAndTab(cardWithTab){
    if(cardWithTab && cardWithTab.card && cardWithTab.popoverTabbing){
      let card  = cardWithTab.card;
      this.setCardDetails(card);
    }else{
      let card  = cardWithTab.card;
      this.setCardDetails(card);
    } 
    if(cardWithTab && cardWithTab.tabs && cardWithTab.tabs.length > 0){
      this.tabMenu = cardWithTab.tabs;
      this.selectedIndex = cardWithTab.selectedTabIndex;
      this.popoverMenu = cardWithTab.popoverTabbing;
      if(cardWithTab && cardWithTab.popoverTabbing){
        this.popoverTabbing.emit(this.tabMenu);
      }
    }else{
      this.tabMenu = [];
      this.selectedIndex = -1;
    }
  }

  setCardDetails(card) {  
    let criteria:any = [];
    let parentcard:any = {};

    if(card && card.buttons){
      this.gridButtons = card.buttons;
    }else{
      this.gridButtons = [];
    }
    if(card && card.add_new){
      if(this.detailPage){
        this.addNewEnabled = false;
      }else{
        this.addNewEnabled = true;
      }
    }else{
      this.addNewEnabled = false;
    } 
    // if(card && card.enable_only_edit){
    //   if(this.detailPage){
    //     this.enableEditOnly = false;
    //   }else{
    //     this.enableEditOnly = true;
    //   }
    // }else{
    //   this.enableEditOnly = false;
    // }
    // if(card && card.enable_only_review){
    //   if(this.detailPage){
    //     this.enableReviewOnly = false;
    //   }else{
    //     this.enableReviewOnly = true;
    //   }
    // }else{
    //   this.enableReviewOnly = false;
    // }
    // if(card && card.enable_only_download_review){
    //   if(this.detailPage){
    //     this.downloadReport = false;
    //   }else{
    //     this.downloadReport = true;
    //   }
    // }else{
    //   this.downloadReport = false;
    // }
    // if(card && card.enable_download_pdf){
    //   if(this.detailPage){
    //     this.downloadPdfBtn = false;
    //   }else{
    //     this.downloadPdfBtn = true;
    //   }
    // }else{
    //   this.downloadPdfBtn = false;
    // }
    if(card && card.add_calling){
      if(this.detailPage){
        this.addCallingFeature = false;
      }else{
        this.addCallingFeature = true;
      }
    }else{
      this.addCallingFeature = false;
    } 
    // if(card && card.call_status){
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
      // this.createFormgroup = false;
      this.columnListOutput.emit(this.columnList);
    }
    if(card && card.parent_criteria){
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
    if(card && card.enable_load_more ){   
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
    if(card && card.child_card && card.child_card['_id']){
      this.hasDetaildCard = true;
    }else{
      this.hasDetaildCard = false;
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

  goBack(){
    this.carddata = [];
    this.tabMenu = [];
    this.openFilter = false;
  }

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
      //this.editedRow(data,index);
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
        swipeToClose: true,
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
  // edit mode Form
  // editedRow(data,index,formName?:any){
  //   this.editedRowIndex = index;
  //   this.gridData = data;
  //   this.selectedgriddataId = this.gridData._id;
  //   this.updateMode = true;
  //   if(formName){
  //     this.addNewForm(formName);
  //   }else{      
  //   this.addNewForm("UPDATE");
  //   }
  // }


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
            // this.currentPageCount = 1;
            this.ionEvent.target.disabled = true;    // and disable the infinite scroll
            this.notificationService.presentToastOnBottom("You reached at the End","success");
          }else{
            this.currentPageCount++;
            this.getGridData(this.collectionname);  
          }
        }else{
          this.notificationService.presentToastOnBottom("No more data","danger");
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
          this.notificationService.presentToastOnMiddle("No Updates Available","success");
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
          this.restService.preview(gridData,this.currentMenu,'grid-preview-modal')          
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
    if(this.loadMoreData){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = this.loadMoreData;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = !this.loadMoreData;
      }
    }
    if(this.refreshlist){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = !this.refreshlist;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = this.refreshlist;
      }
    }
    
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
