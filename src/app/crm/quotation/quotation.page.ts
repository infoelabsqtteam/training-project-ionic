import { Component, OnInit, Optional} from '@angular/core';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { Platform, ModalController, IonRouterOutlet} from '@ionic/angular';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';

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
  childData : any = {};
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
    public modalController: ModalController,
    @Optional() private readonly routerOutlet?: IonRouterOutlet,
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
      const index = this.commonDataShareService.getSelectdTabIndex();
      this.getCardDataByCollection(index);      
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
    const card = this.getCard(i);
    this.setCardDetails(card);        
  }

  getCard(index){
    const moduleList = this.commonDataShareService.getModuleList();
    const clicedModuleIndex = this.commonDataShareService.getModuleIndex();    
    let card:any  = {};
    if(clicedModuleIndex >= 0){
      card = moduleList[clicedModuleIndex];
    }
    if(card && card.tab_menu && card.tab_menu.length > 0){
      this.tabMenu = card.tab_menu;
      let tab:any = {};
      if(index == -1){
        tab = this.tabMenu[0];
        this.selectedIndex = 0;
      }else{
        tab = this.tabMenu[index];
        this.selectedIndex = index;
      }
      const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id");
      card = moduleList[tabIndex];      
    }
    return card;
  }

  setCardDetails(card) {
    this.cardtitle = card.name;
    if (card.card_type !== '') {
      this.cardType = card.card_type.name;
    }
    this.childColumn = card.child_card;
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

  // go to new page 2nd method
  async detailCardButton(column, data){
    const cardmaster=this.dataShareServiceService.gettCardList();
    const childColumn = this.childColumn;
    if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
      cardmaster.forEach(element => {
        if(element._id == childColumn._id ){
          this.childColumns = element.fields;
          this.childCardType = element.card_type;
          this.childTabMenu = element.tab_menu;
        }
      });
    }
    this.childData = data;
    
    // naviagte
    const newobj = {
      "childcardtype": this.childCardType,
      "childdata": this.childData,
      "childcolumns": this.childColumns,
      "childtabmenu": this.childTabMenu
    }
    this.dataShareServiceService.setchildDataList(newobj);
    if(this.cardType == 'contact'){
      this.router.navigate(['crm/contact-details']);
    }else{
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

  getGridData(collectionName,criteria?){
    const crList = this.restService.getfilterCrlist(this.columnList, this.filterForm)
    const params = collectionName;
    let data = this.restService.getPaylodWithCriteria(params,'',[],{});
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

  async addNew(){
    this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);
    let card = this.getCard(this.selectedIndex);
    const id = '5f6d95da9feaa2409c3765cd';
    this.commonDataShareService.setFormId(id);
    this.router.navigate(['form']);
    // const modal = await this.modalController.create({
    //   //showBackdrop: true,
    //   //backdropDismiss: true,
    //   component: FormModalPage,
    //   // componentProps: {
    //   //   "lastName": "Welcome"
    //   // },
    //   //swipeToClose: true,
    //   //cssClass: 'my-custom-class',
    // });
    // return await modal.present();
  }

}
