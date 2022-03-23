import { Component, OnInit } from '@angular/core';
import { CommonDataShareService, CoreUtilityService, StorageService,} from '@core/ionic-core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';

@Component({
  selector: 'app-quotation-details',
  templateUrl: './quotation-details.page.html',
  styleUrls: ['./quotation-details.page.scss'],
})
export class QuotationDetailsPage implements OnInit {

  cardType = ""; //default Card
  childColumns: any = {};
  childData: any = {};
  childDataTitle: any;
  childDataValue: any = {};

  // 
  filterCount: number = -1;
  carddata: any = [];
  columnList: any = [];
  
  constructor(
    private dataShareServiceService:DataShareServiceService,
    private coreUtilityService :CoreUtilityService,
    private commonDataShareService:CommonDataShareService,
    private callNumber: CallNumber,
    private storageService: StorageService
  ) { 
    
  }

  ngOnInit() {
    this.getChildData();    
  }

  getChildData(){
    let module = this.coreUtilityService.getModuleBySelectedIndex();
    let tabDetail:any = '';
    this.childData = this.dataShareServiceService.getchildCardData();
    let index:any = this.childData.selected_tab_index;
    const moduleList = this.commonDataShareService.getModuleList();
    if(index != -1){      
      let tabs:any = module.tab_menu;
      let tab:any = tabs[index];
      const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id");
      tabDetail = moduleList[tabIndex];
    }
    let child_card = {};
    if(tabDetail != ''){
      if(tabDetail && tabDetail.child_card){
        const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tabDetail.child_card._id,"_id");
        child_card = moduleList[tabIndex]; 
      }
    }else{
      if(module && module.child_card){
        const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,module.child_card._id,"_id");
        child_card = moduleList[tabIndex]; 
      }else{
        child_card = module;
      }      
    }
    this.childDataValue = this.childData.childdata; 
    this.setCard(child_card);
    
  }
  tabMenu:any =[];
  selectedIndex:any =-1;
  setCard(card){
    if (card.card_type !== '') {
      this.cardType = card.card_type.name;
    }
    this.childColumns = card.fields;
    if(card.tab_menu && card.tab_menu.length > 0){
      this.tabMenu = card.tab_menu;
      this.selectedIndex = 0;
    }
  }

  goBack(){
    this.childColumns = [];
    this.childData = {};
    this.childDataTitle = '';
    this.cardType = '';
    this.childDataValue = {};
  }

  getValueForGrid(field,object){
    return this.coreUtilityService.getValueForGrid(field,object);
  }

  // extra code added below for error ressolve
  call(providerNumber: any) {
    this.callNumber.callNumber(providerNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
      console.log(providerNumber);
  }
  sendemail(){
    var link = "mailto:" + this.childData.childdata.email + "?subject=Hi,"+ this.childData.childdata.name +"Contact%20Details&body=Hello, I need Some Information.";     
    window.location.href = link;
  }
  sendwhatsapp(){
    let countryCode = "+91";
    let mobile = "";
    let whatsappUrl = "https://wa.me/";
    let whatsappMsg = "?text=Hello,%20";
    let urllink =  whatsappUrl + countryCode + mobile + whatsappMsg;
    window.location.href = urllink;
  }
  sendsms(){
    let smsMsg = "?text=Hello,";
    let mobile = "";
    let smslink =  "sms:" + mobile + "?subject=Hi,"+ this.childData.childdata.name +"Contact%20Details&body=Hello,%20I%20need%20Some%20Information.";
    window.location.href = smslink;
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
  
  tabmenuClick(tabItem:any,index:number){
    
    // this.getCardDataByCollection(tabItem._id);
  }
  async detailCardButton(column, data){}

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}