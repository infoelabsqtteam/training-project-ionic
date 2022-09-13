import { Component, Input, OnInit } from '@angular/core';
import { CommonDataShareService, CoreUtilityService, DataShareService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';

@Component({
  selector: 'app-modal-detail-card',
  templateUrl: './modal-detail-card.component.html',
  styleUrls: ['./modal-detail-card.component.scss'],
})
export class ModalDetailCardComponent implements OnInit {

  cardType = "demo";

  @Input() childColumns:any;
  @Input() childDataTitle:any;
  @Input() childData: any;
  @Input() childCardType: any;
  @Input() selected_tab_index : any;
  @Input() modal: any;
  childDataValue: any = {};
  
  constructor(
    private modalController: ModalController,
    private dataShareServiceService: DataShareServiceService,
    private coreUtilityService: CoreUtilityService,
    private commonDataShareService: CommonDataShareService
    ) { }

    
  ngOnInit() {
    this.getChildData();
    // if(this.childCardType && this.childCardType.name !=''){
    //   this.cardType = this.childCardType.name
    // }
  }
  ionViewWillEnter(){ 
  }
  ionViewDidEnter(){ 
  }
  
  getChildData(){
    let module = this.coreUtilityService.getModuleBySelectedIndex();
    let tabDetail:any = '';
    // this.childData = this.dataShareServiceService.getchildCardData();
    let index:any = this.selected_tab_index;
    const moduleList = this.commonDataShareService.getModuleList();
    if(index != -1){      
      let tabs:any = module.tab_menu;
      if(tabs && tabs.length > 0){
      let tab:any = tabs[index];
      const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id");
      tabDetail = moduleList[tabIndex];
      }
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
    this.childDataValue = this.childData;    
    if(this.childDataValue && this.childDataValue.name){
      this.childDataTitle = this.childDataValue.name;
    }
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
  
  getValueForGrid(field,object){
    return this.coreUtilityService.getValueForGrid(field,object);
  }
  
  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

  ngOnDestroy() { }

}
