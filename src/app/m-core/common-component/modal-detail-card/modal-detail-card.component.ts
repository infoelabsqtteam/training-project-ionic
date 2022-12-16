import { Component, Input, OnInit } from '@angular/core';
import { CommonDataShareService, CoreUtilityService, DataShareService, RestService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { GridInfoComponent } from '../../modal/grid-info/grid-info.component';

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
  public selectedViewRowIndex = -1;
  public viewColumnName = '';
  checkForDownloadReport:boolean = false;
  currentMenu: any;
  
  constructor(
    private modalController: ModalController,
    private dataShareServiceService: DataShareServiceService,
    private coreUtilityService: CoreUtilityService,
    private restService:RestService,
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

  clickOnGridElement(field, object, i) {
    let value={};
    value['data'] = this.coreUtilityService.getObjectValue(field.field_name, object)
    if(field.gridColumns && field.gridColumns.length > 0){
      value['gridColumns'] = field.gridColumns;
    }
    let editemode = false;
    if(field.editable){
      editemode = true;
    }
    if(field.bulk_download){
      value['bulk_download'] = true;
    }else{
      value['bulk_download'] = false;
    }
    if (!field.type) field.type = "Text";
    switch (field.type.toLowerCase()) {
      case "info":
        if (value && value != '') {
          this.selectedViewRowIndex = -1;
          this.viewColumnName = '';
          this.viewModal(value, field, i, field.field_name,editemode);
        };
        break;
      case "template":
        if (value && value != '') {
          this.selectedViewRowIndex = -1;
          this.viewColumnName = '';
          //this.templateModal('template-modal',object,i, field.field_name)
        };
        break;
      case "file":
        if (value['data'] && value['data'] != '') {
          this.selectedViewRowIndex = -1;
          this.viewColumnName = '';
          //this.viewModal('fileview-grid-modal', value, field, i, field.field_name,editemode);
        };
        break;
      case "download_file":
        this.checkForDownloadReport = true;
        let data = object[field.field_name];
        const payload = {
          "_id":object._id,
          "data":{
            "current_tab":this.currentMenu.name,
            "field_name":field.field_name,
            "data":data
          }
        }
        this.restService.download_file(payload);
        break;
      default: return;
    }

  }



  //this.viewModal('basic-modal', value, field, i, field.field_name,editemode);
  async viewModal(value:any, field:any, i:number, field_name:any, editemode){
    const modal = await this.modalController.create({
      component: GridInfoComponent,
      componentProps: {
        "Data": {"value":value,"field":field,"index": i,"field_name":field_name,"editemode": editemode},        
        "formInfo" : {"InlineformGridSelection" : ""}          
      },
      swipeToClose: false
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
          console.log("Modal closed");
                
    });
    return await modal.present();
  }

}
