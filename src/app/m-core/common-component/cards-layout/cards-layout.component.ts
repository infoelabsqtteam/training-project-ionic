import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { filter } from 'rxjs';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Platform, ModalController } from '@ionic/angular';
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
  @Input() data:any;

  web_site_name: string = '';
  list: any = [];
  carddata: any;

  columnList: any = [];
  cardType = "summary"; //default cardtype
  cardDataMasterSubscription: any;
  collectionname: any = 'request_quote';
  cardtitle: any;

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
  filterForm: FormGroup;
  createFormgroup: boolean = true;
  openFilter: boolean = false;
  filterCount: 0;

  //common function
  cardList: any = [];
  selectedIndex= -1;
  tabMenu: any = [];
  cardListSubscription:any;

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
    private modalController: ModalController
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

  initializeApp() {
    this.platform.ready().then(() => {});
  }
  ngOnChanges(changes: SimpleChanges) {
    if(this.card && this.card.card && this.card.card.name){
      this.setCardAndTab(this.card)
    }
    if(this.data && this.data.name){
      this.detailPage = true;
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
    this.cardtitle = card.name;
    if (card.card_type !== '') {
      this.cardType = card.card_type.name;
    }
    // this.childColumn = card.child_card;
    this.columnList = card.fields;
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
    this.collectionname = card.collection_name;
    this.getGridData(this.collectionname);
  }
  
  // filterdata
  filterCard(){  
    this.openFilter = false;
    this.getGridData(this.collectionname);
  }
  closefilterCard(){
    this.openFilter = false;
  }
  clearfilterCard(){
    this.filterForm.reset();
    this.getGridData(this.collectionname);
  } 

  search(myInput) {
    this.getGridData(this.collectionname);
  }

  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.getGridData(this.collectionname);
    }
  }

  goBack(){
    this.carddata = [];
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
      this.modaldetailCardButton(column,data);
    }else{
      const newobj = {
        "childdata": data,
        "selected_tab_index": this.selectedIndex
      }
      this.dataShareServiceService.setchildDataList(newobj);  
      this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);  
      this.router.navigate(['crm/quotation-details']);
    }
    
  }
  
  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

  call(card:any,Index:number) {
    let callingNumber:any;
    if(card.mobile !=''){
      callingNumber = card.mobile;
    }else {
      callingNumber = card.billing_mobile;
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

  async getGridData(collectionName,criteria?){
    const crList = this.restService.getfilterCrlist(this.columnList, this.filterForm)
    const params = collectionName;
    let data = await this.restService.getPaylodWithCriteria(params,'',[],{});
    data['pageNo'] = 0;
    data['pageSize'] = 50;
    data.crList = crList;
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
        "childData": card,
        "selected_tab_index": this.selectedIndex,
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

  

}
