import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../modal/modal.component';
import { DataShareService, CommonFunctionService, MenuOrModuleCommonService, ApiService, CommonAppDataShareService, GridCommonFunctionService, ApiCallService } from '@core/web-core';
import { FileViewsModalComponent } from '../../modal/file-views-modal/file-views-modal.component';

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
  childgridsubscription :any;
  childGridFields:any;
  childgridIds:any;
  tabMenu:any =[];
  selectedIndex:any =-1;
  
  constructor(
    private modalController: ModalController,
    private dataShareService: DataShareService,
    private commonAppDataShareService: CommonAppDataShareService,
    private apiService: ApiService,
    private commonFunctionService: CommonFunctionService,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    private gridCommonFunctionService: GridCommonFunctionService,
    private apiCallService: ApiCallService
  ) {
    this.childgridsubscription = this.dataShareService.childGrid.subscribe(data =>{
      if(data && data.gridColumns){
        this.childColumns = data.gridColumns;
      }else{
        this.childgridIds.forEach((field,i) => {
          if(field['Id'] == data['_id']){
            this.childgridIds[i]['childgridfields'] = data.fields;
            this.childGridFields[field.field_name] = data.fields;
          }
        });
        // this.childGridFields = data;
      }
    })
  }

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){ 
  }
  ionViewDidEnter(){ 
  }
  // Ionic LifeCycle Function Handling End--------------------

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.getChildData();
    // if(this.childCardType && this.childCardType.name !=''){
    //   this.cardType = this.childCardType.name
    // }
  }
  ngOnDestroy() {
    if(this.childgridsubscription){
      this.childgridsubscription.unsubscribe();
    }
  }
  // Angular LifeCycle Function Handling Start--------------------

  // ngOnInit Functions Handling Start  ------------
  getChildData(){
    let module = this.menuOrModuleCommonService.getModuleBySelectedIndex();
    let tabDetail:any = '';
    // this.childData = this.dataShareServiceService.getchildCardData();
    let index:any = this.selected_tab_index;
    const moduleList = this.commonAppDataShareService.getModuleList();
    if(index != -1){      
      let tabs:any = module.tab_menu;
      if(tabs && tabs.length > 0){
      let tab:any = tabs[index];
      const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tab._id,"_id");
      tabDetail = moduleList[tabIndex];
      }
    }
    let child_card:any = {};
    if(tabDetail != ''){
      if(tabDetail && tabDetail.child_card){
        const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tabDetail.child_card._id,"_id");
        child_card = moduleList[tabIndex]; 
      }else if(tabDetail.child_card == null && tabDetail.grid){
        child_card = tabDetail
      }
    }else{
      if(module && module.child_card){
        const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,module.child_card._id,"_id");
        child_card = moduleList[tabIndex]; 
      }else{
        child_card = module;
      }      
    }
    this.childDataValue = this.childData;    
    if(this.childDataValue && this.childDataValue.name){
      if(typeof this.childDataValue.name == 'object'){
        this.childDataTitle = this.childDataValue?.name['name'];
      }else{
        this.childDataTitle = this.childDataValue.name;
      }
    }else if(child_card?.name){
      this.childDataTitle=child_card?.name;
    }
    this.setCard(child_card);
    
  }
  setCard(card){
    if (card.card_type !== '') {
      this.cardType = card.card_type.name;
    }
    if(card.grid == null && card.fields){
      this.childColumns = card.fields;
    }else if(card.grid && card.grid['_id']){
      this.cardType = "detail1"
      this.childColumns.forEach((element:any, i) => {
        if(element.type){
          element.type = element.type.toLowerCase();
          this.childColumns[i]=element;
        }
      });
    }
    if(card.tab_menu && card.tab_menu.length > 0){
      this.tabMenu = card.tab_menu;
      this.selectedIndex = 0;
    }
    if(this.childColumns && this.childColumns.length > 0) this.checkGridChild(this.childColumns);
  }
  checkGridChild(childColumns){
    this.childgridIds=[];
    this.childGridFields={};
    childColumns.forEach(field => {
      if(field && field.grid && field.grid['_id'] && field.type.toLowerCase() == "info"){
        this.childgridIds.push({'field_name':field.field_name,'Id':field.grid['_id']});
        this.childGridFields[field.field_name];
      }
    });
    if(this.childgridIds.length > 0){
      this.childgridIds.forEach(element => {
        this.getChildGridFieldsbyId(element['Id']);
      });
    }
  }  
  getChildGridFieldsbyId(childrGridId:string){
    const params = "grid";
    const criteria = ["_id;eq;" + childrGridId + ";STATIC"];
    const payload = this.apiCallService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetChildGrid(payload);
  }
  // ngOnInit Functions Handling End  ------------   
  
  // Click Functions Handling Start  ------------
  dismissModal(){
    this.modal?.offsetParent.dismiss({'dismissed': true},"backClicked");
  }
  clickOnGridElement(field, object, i) {
    let value={};
    value['data'] = this.commonFunctionService.getObjectValue(field.field_name, object);
    if(value['data']!){
      console.log('Data available in ' + field.field_label);
    }else{
      return console.log('No data available in ' + field.field_label);
    }
    if(field && field.grid && field.grid['_id'] && field.type.toLowerCase() == "info"){ 
      field['gridColumns'] = this.childGridFields[field.field_name]
    }    
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
      case "file_with_preview":
      case "file_with_print":
        if (value['data'] && value['data'] != '') {
          this.selectedViewRowIndex = -1;
          this.viewColumnName = '';
          let previewFile:boolean = false;
          let printFile:boolean = false;
          if(field.type.toLowerCase() == "file_with_preview"){
            previewFile = true;
          }else if(field.type.toLowerCase() == "file_with_print"){
            printFile = true;
          }
          const obj = {
            'data' : value,
            'field' : field,
            'index' : i,
            'field_name': field?.field_name,
            'editemode' : editemode,
            'field_type': field.type.toLowerCase(),
            'previewFile': previewFile,
            'printFile' : printFile
          }
          this.viewFileModal(FileViewsModalComponent, value, field, i, field.field_name,editemode,obj);
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
        this.commonFunctionService.download_file(payload);
        break;
      default: return;
    }

  }
  // Click Functions Handling End------------

  // Dependency Functions Handling Start------------
  async viewModal(value:any, field:any, i:number, field_name:any, editemode){
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'grid-info-modal',
      componentProps: {
        "Data": {"data":value,"field":field,"index": i,"field_name":field_name,"editemode": editemode},        
        "formInfo" : {"InlineformGridSelection" : ""}          
      },
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
          console.log("Detail Card Modal closed " , data.role);                
    });
    return await modal.present();
  }
  async viewFileModal(component:any, value, field, i,field_name,editemode,obj?,){    
    let objectData:any = {
      'data' : value,
      'field' : field,
      'index' : i,
      'field_name': field_name,
      'editemode' : editemode,
      'field_type': obj?.field_type,
      'previewFile': obj?.previewFile,
      'printFile' : obj?.printFile
    }
    // this.modelService.openModal(component,objectData).then((data:any) => {
    //   if(data && data.role == 'closed'){
    //     console.log("ModalIs",data.role);
    //   }
    // });
    const modal = await this.modalController.create({
      component: FileViewsModalComponent,
      cssClass: 'file-info-modal',
      componentProps: {
        "objectData": objectData,      
      },
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
          console.log("File Download Modal closed " , data.role);                
    });
    return await modal.present();
  }  
  // Dependency Functions Handling End------------
  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  }

}
