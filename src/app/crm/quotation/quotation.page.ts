import { Component, OnInit} from '@angular/core';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { ModalController, Platform} from '@ionic/angular';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ModalDetailCardComponent } from 'src/app/component/modal-detail-card/modal-detail-card.component';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})

export class QuotationPage implements OnInit {
  
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


  ngOnInit() {
    this.carddata = [];
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.getCardDataByCollection(-1);      
    });  

  }

  ngOnDestroy(): void {
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
  }

  private getCardDataByCollection(i) {
    const moduleList = this.commonDataShareService.getModuleList();
    // const clickedModuleIndex = this.commonDataShareService.getModuleIndex();
    // let module:any  = {};
    // if(clickedModuleIndex >= 0){
    //   module = moduleList[clickedModuleIndex];
    // }
    let module = this.coreUtilityService.getModuleBySelectedIndex();
    if(module && module.tab_menu && module.tab_menu.length > 0){
      this.tabMenu = module.tab_menu;
      let tab:any = {};
      if(i == -1){
        tab = this.tabMenu[0];
        this.selectedIndex = 0;
      }else{
        tab = this.tabMenu[i];
      }
      const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id");
      const tabDetail = moduleList[tabIndex];
      this.setCardDetails(tabDetail);
    }else{
      this.setCardDetails(module);
    }
        
  }

  setCardDetails(card) {
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
    // for child header
    this.childDataTitle = data.company_name;
    
    //modalShowfunction
    const modal = await this.modalController.create({
      component: ModalDetailCardComponent,
      componentProps: {
        "childData": data,
        "childColumns": this.childColumns,
        "childDataTitle": this.childDataTitle,
        "childCardType" : this.childCardType
       },
      swipeToClose: true
    });
    modal.componentProps.modal = modal;
    return await modal.present();

  }

  // go to new page 2nd method
  async detailCardButton(column, data){
    //const cardmaster=this.dataShareServiceService.gettCardList();
    // const childColumn = this.childColumn;
    // if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
    //   cardmaster.forEach(element => {
    //     if(element._id == childColumn._id ){
    //       this.childColumns = element.fields;
    //       this.childCardType = element.card_type;
    //       this.childTabMenu = element.tab_menu;
    //     }
    //   });
    // }
    //this.childData = data;
    
    // naviagte
    const newobj = {
      //"childcardtype": this.childCardType,
      "childdata": data,
      "selected_tab_index": this.selectedIndex
      //"childcolumns": this.childColumns,
      //"childtabmenu": this.childTabMenu
    }
    this.dataShareServiceService.setchildDataList(newobj);    
    this.router.navigate(['crm/quotation-details']);
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
    this.carddata = [];
    this.createFormgroup = true;
    this.getCardDataByCollection(index);
  }
  
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    //this.router.navigate(['crm/quotation']);
    this.dataShareServiceService.setcardData(card);
  }

}
