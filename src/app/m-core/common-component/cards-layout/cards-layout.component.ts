import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { filter } from 'rxjs';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Platform, ModalController, AlertController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { ModalDetailCardComponent } from '../modal-detail-card/modal-detail-card.component';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-cards-layout',
  templateUrl: './cards-layout.component.html',
  styleUrls: ['./cards-layout.component.scss'],
})
export class CardsLayoutComponent implements OnInit, OnChanges {

  @Input() card:any;
  @Input() data:any ={};
  @Output() columnListOutput = new EventEmitter();
  @Input() searchcard:any;

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
  cardListSubscription:any;

  // db Flags
  addCallingFeature: boolean=false;
  addNewEnabled:boolean=false;
  detailPage:boolean=false;

  // new var
  gridDataSubscription: any;

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
    private alertController: AlertController
  ) 
  {
    // below code is for slider and title name
    this.initializeApp();
    this.web_site_name = this.envService.getWebSiteName();
    
    this.gridDataSubscription = this.dataShareService.collectiondata.subscribe(data =>{
      this.carddata = data.data;
      this.filterCount = data.data_size;
    });
    
  }

  resetVariabls(){
    this.editedRowIndex = -1;
    this.gridData = {};
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }
  ngOnChanges(changes: SimpleChanges) {
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
      this.filterForm['value'] = {};
    }
  }


  ngOnInit() {
    this.carddata = [];
  }

  ngOnDestroy(): void {
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }

  getCardDataByCollection(i) {
    this.resetVariabls();
    const cardWithTab = this.coreUtilityService.getCard(i); 
    this.setCardAndTab(cardWithTab)
    
  } 
  setCardAndTab(cardWithTab){
    if(cardWithTab && cardWithTab.card){
      let card  = cardWithTab.card;
      this.setCardDetails(card);
    } 
    if(cardWithTab && cardWithTab.tabs && cardWithTab.tabs.length > 0){
      this.tabMenu = cardWithTab.tabs;
      this.selectedIndex = cardWithTab.selectedTabIndex;
    }else{
      this.tabMenu = [];
      this.selectedIndex = -1;
    }
  }

  setCardDetails(card) {  
    if(card && card.add_new){
      if(this.detailPage){
        this.addNewEnabled = false;
      }else{
        this.addNewEnabled = true;
      }
    }else{
      this.addNewEnabled = false;
    } 
    if(card && card.add_calling){
      if(this.detailPage){
        this.addCallingFeature = false;
      }else{
        this.addCallingFeature = true;
      }
    }else{
      this.addCallingFeature = false;
    } 
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
    this.collectionname = card.collection_name;
    this.getGridData(this.collectionname);
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
      return await modal.present();
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
    this.storageService.presentToast('Comming Soon...');
  }

  call(card:any,Index:number) {
    let callingNumber:any;
    if(card.mobile && card.mobile.length >= 10 ){
      callingNumber = card.mobile;
      console.log(callingNumber);
    }else if(card.billing_mobile && card.billing_mobile  >= 10){
      callingNumber = card.billing_mobile;
      console.log(callingNumber);
    }else if(card.phone && card.phone  >= 10){
      callingNumber = card.phone;
      console.log(callingNumber);
    }else{
      console.log("number Not found")
    }
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
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
  async getGridData(collectionName,criteria?){
    const crList = this.restService.getfilterCrlist(this.columnList, this.filterForm)
    const params = collectionName;
    let cardCriteria = []
    if(criteria && criteria.length > 0){
      cardCriteria = this.setCriteria(cardCriteria,criteria);
    }
    let object = {};
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
    data['pageNo'] = 0;
    data['pageSize'] = 50;
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


  async addNew(){
    this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);
    let card = this.card;
    let form:any = {};
    let id = '5f6d95da9feaa2409c3765cd';
    if(card && card.card && card.card.form){
      form = card.card.form;
      if(form && form._id && form._id != ''){
        id = form._id;
      }
    }    
    this.commonDataShareService.setFormId(id);
    // this.router.navigate(['crm/form']);
    const modal = await this.modalController.create({
      component: FormComponent,
      componentProps: {
        "childData": this.gridData,
        "editedRowIndex": this.editedRowIndex,
        "addform" : form
       },
      swipeToClose: true
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then((result) => {
      this.getCardDataByCollection(this.selectedIndex);
    });
    return await modal.present();
  }

  editedRow(data,index){
    this.editedRowIndex = index;
    this.gridData = data
    this.addNew();
  }
  getFirstCharOfString(char:any){
    return this.coreUtilityService.getFirstCharOfString(char);
  }

  

}
