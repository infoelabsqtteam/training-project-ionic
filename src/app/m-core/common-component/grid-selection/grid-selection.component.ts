import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppDataShareService, NotificationService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { GridSelectionDetailModalComponent } from '../../modal/grid-selection-detail-modal/grid-selection-detail-modal.component';
import { DataShareService, LimsCalculationsService, CommonFunctionService, CoreFunctionService, CheckIfService, GridCommonFunctionService } from '@core/web-core';

@Component({
  selector: 'app-grid-selection',
  templateUrl: './grid-selection.component.html',
  styleUrls: ['./grid-selection.component.scss'],
})
export class GridSelectionComponent implements OnInit, OnChanges {


  @Input() Data : any;
  @Input() modal: any;
  @Output() selectedTabAgain = new EventEmitter<any>();
  @Output() gridSelectionResponce = new EventEmitter<any>();
  

  selecteData:any=[];
  selectedData:any = [];
  field:any={};
  parentObject={};
  gridData:any=[];
  listOfGridFieldName:any =[]; 
  staticDataSubscriber:any;
  responseData:any;
  copyStaticData:any = [];

  editeMode:boolean=false;
  grid_row_selection:boolean = false;
  grid_row_refresh_icon:boolean = false;

  selectedTab:any = "new";
  showAllTab : boolean = true;

  expandicon: any = "assets/itc-labs/icon/expand-icon.png";

  data :any = [];
  readonly:boolean= false;
  updateMode:boolean= false;
  nogridDdata:boolean= false;
  samePageGridSelection=false;
  reloadBtn=false;


  constructor(    
    private modalController: ModalController,
    private notificationService:NotificationService,
    private dataShareService:DataShareService,
    private coreFunctionService: CoreFunctionService,
    private appDataShareService: AppDataShareService,
    private limsCalculationsService: LimsCalculationsService,
    private commonFunctionService: CommonFunctionService,
    private gridCommonFunctionService: GridCommonFunctionService,
    private checkIfService: CheckIfService
  ) { }
  

  ngOnInit() {
    this.samePageGridSelection = this.appDataShareService.getgridselectioncheckvalue();    
  }
  ngOnChanges(changes: SimpleChanges) {
    if(this.Data){
      this.onload();
      this.subscribe();
    } 
  }
  subscribe(){
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      this.reloadBtn = true;
      if(this.coreFunctionService.isNotBlank(this.field) && this.coreFunctionService.isNotBlank(this.field.ddn_field) && data[this.field.ddn_field]){
        this.responseData[this.field.ddn_field] = data[this.field.ddn_field];
        this.reloadBtn = false;
      }else{
        this.responseData = {};
      }
      this.setStaticData(data);
    })
  }
  reloadStaticData(){
    this.reloadBtn = true;
    let data:any = this.dataShareService.getStatiData();
    this.copyStaticData = data;
    if(this.field.ddn_field && data[this.field.ddn_field] && data[this.field.ddn_field] != null && data[this.field.ddn_field] != undefined){
      if((Array.isArray(data[this.field.ddn_field]) && data[this.field.ddn_field].length > 0)){
        this.setStaticData(data);
      }else if(!Array.isArray(data[this.field.ddn_field])){
        this.setStaticData(data);
      }else{
        this.resetReloadBtn();
      }
    }else{
      this.resetReloadBtn();      
    }
  }
  resetReloadBtn(){
    setTimeout(() => {
      this.reloadBtn = false;
    }, 1000);
  }
  ngOnDestroy(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
  }
  onload(){
    this.selecteData = [];  
    this.selecteData = JSON.parse(JSON.stringify(this.Data.selectedData)); 
    this.selectedData = JSON.parse(JSON.stringify(this.Data.selectedData));
    this.field = this.Data.field;
    if(this.Data.object){
      this.parentObject = this.Data.object;
    }
    if(this.Data.field.onchange_api_params == "" || this.Data.field.onchange_api_params == null){
      this.showAllTab = false;
      this.selectedTab = "added";
      this.gridData = JSON.parse(JSON.stringify(this.Data.selectedData));
    }
    else{
      this.gridData = [];
    }   
    if(this.field && this.field.grid_row_selection){
      this.grid_row_selection = true;
    }else{
      this.grid_row_selection = false;
    }
    if(this.field && this.field.grid_row_refresh_icon){
      this.grid_row_refresh_icon = true;
    }else{
      this.grid_row_refresh_icon = false;
    }
    if(this.Data?.updateMode && this.Data.updateMode){  
      this.selectedTab = "added";
      this.updateMode = this.Data.updateMode;
    }  
  }
  
  setStaticData(staticData) {
    if (staticData) {
      if (staticData) {
        staticData = staticData;
        Object.keys(staticData).forEach(key => {     
          if(staticData[key]){
            this.copyStaticData[key] = JSON.parse(JSON.stringify(staticData[key]));
          }
        })
      }
      if (this.field.ddn_field && staticData[this.field.ddn_field] && staticData[this.field.ddn_field] != null) {
        this.gridData = [];
        if (staticData[this.field.ddn_field] && staticData[this.field.ddn_field].length > 0) {
          staticData[this.field.ddn_field].forEach(element => {
            const gridData = JSON.parse(JSON.stringify(element))
            if (gridData.selected && this.selecteData.length < 0) {
              gridData.selected = false;
            }
            this.gridData.push(gridData);
          });
        }
        if (this.gridData && this.gridData.length > 0) {
          if (this.field.onchange_function && this.field.onchange_function_param != "") {
            switch (this.field.onchange_function_param) {
              case "calculateQquoteAmount":
                this.gridData = this.limsCalculationsService.calculateAutoEffRate(this.gridData);
                break;
            }
          }
          if(this.selecteData && this.selecteData.length > 0){
            this.updateSelectedDataInGridData(this.selecteData);            
          }
        }else{
          this.reloadBtn = false;
          this.nogridDdata=true;
        }
      }
    }
  }
  
  
  updateSelectedDataInGridData(selecteData){
    if(selecteData && selecteData.length > 0){
      selecteData.forEach(element => {
        for (let i = 0; i < this.gridData.length; i++) {
          const row = this.gridData[i];
          if (this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length > 0) {
            var validity = true;
            for (let index = 0; index < this.field.matching_fields_for_grid_selection.length; index++) {
              const matchcriteria = this.field.matching_fields_for_grid_selection[index];
              if (this.commonFunctionService.getObjectValue(matchcriteria, element) == this.commonFunctionService.getObjectValue(matchcriteria, row)) {
                validity = validity && true;
              }
              else {
                validity = validity && false;
                break;
              }
            };
            if (validity == true) {
              this.updateRowData(element,i);
              break;
            }
          }
          else {
            if (this.commonFunctionService.getObjectValue("_id", element) == this.commonFunctionService.getObjectValue('_id', row)) {
              this.updateRowData(element,i);
              break;
            }
          }
        };
      });  
    }
  }
  updateRowData(element,i){
    this.gridData[i] = element
    const grid_data = JSON.parse(JSON.stringify(this.gridData[i]));
    grid_data.selected = true;
    // if(this.editableGridColumns.length > 0){
    //   this.editableGridColumns.forEach(column => {
    //     grid_data[column.field_name] = element[column.field_name];
    //   });
    // }
    this.gridData[i] = grid_data;
  }

  getValueForGrid(field, object) {
    return this.gridCommonFunctionService.getValueForGrid(field, object);
  }
  isDisable(field, object) {
    const updateMode = false;
    let disabledrow = false;
    if (field.is_disabled) {
      return true;
    } 
    if(this.field.disableRowIf && this.field.disableRowIf != ''){
      disabledrow = this.checkRowIf(object);
    }
    if(disabledrow){
      this.readonly = true;
      return true;
    }
    if (field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != '') {
      return this.checkIfService.isDisable(field.etc_fields, updateMode, object);
    }   
    return false;
  }
  checkRowIf(data:any){
    let check = false;
    if(data.selected){
      let condition = '';
      if(this.field.disableRowIf && this.field.disableRowIf != ''){
        condition = this.field.disableRowIf;
      }
      if(condition != ''){
        if(this.checkIfService.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  checkRowDisabledIf(field,index){
    const data = this.selectedData[index];
    const condition = field.disableRowIf;
    if(condition){
      return !this.checkIfService.checkDisableRowIf(condition,data);
    }
    return true;    
  }
  calculateNetAmount(data, fieldName, index){

    this.limsCalculationsService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }

  async addremoveparticipant(data,index){
    if(this.field && this.field.add_new_enabled && data.customEntry){
      if(data.approvedStatus == !"Approved" || data.approvedStatus == !"Rejected"){
        this.addremoveitem(data,index);
      }else{
        this.edite(index);
      }
    }else{
      this.addremoveitem(data,index);
    }
  }
  async addremoveitem(data,index){
    let alreadyAdded = false;
    this.selectedData.forEach(element => {
      if(element && element._id == data._id){
        alreadyAdded = true;
      }
    });
    const modal = await this.modalController.create({
      component: GridSelectionDetailModalComponent,
      componentProps: {
        "Data": {"value":data,"column":this.field.gridColumns,"field":this.field,"alreadyAdded": alreadyAdded,"parentObject":this.parentObject},
        "index": index,
        "childCardType" : "demo1",
        "formInfo" : {"InlineformGridSelection" : this.appDataShareService.getgridselectioncheckvalue(), "type" : this.Data.formTypeName,"name":""}          
      },
      swipeToClose: false
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        const object = data['data']; // Here's your selected user!
        if(object['data'] && object['remove'] == true){
          this.toggle(object['data'],{'detail':{'checked':false}},index);
        }else if(object['data'] && object['remove'] == false){
          this.toggle(object['data'],{'detail':{'checked':true}},index);
        }else if(object['data'] && object['remove'] == "onlyupdate"){
          this.updateSelectedData(object['data'],index);
        }else{
          console.log("No action performed !");
        }              
    });
    return await modal.present();
  }
  toggle(data:any,event:any, indx:any) {
    let index:any = -1;
    if(data && data._id != undefined){
      index = this.commonFunctionService.getIndexInArrayById(this.gridData,data._id);
      this.gridData[index] = data;
    }else if(this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length > 0 && data){
      for (let i = 0; i < this.gridData.length; i++) {
          const row = this.gridData[i]; 
          for (let j = 0; j < this.field.matching_fields_for_grid_selection.length; j++) {
            const matchcriteria = this.field.matching_fields_for_grid_selection[j];          
            if(this.commonFunctionService.getObjectValue(matchcriteria,data) == this.commonFunctionService.getObjectValue(matchcriteria,row)){
              index = i;
              this.gridData[index] = data;
              break;
            }
          };
          if(index > -1){
            break;
          }
      };
    }else {      
      index = indx;
    }
    if(index > -1){
      if (event.detail.checked) {
        this.gridData[index].selected=true;
      } else{
        this.gridData[index].selected=false;
      }
    }
    this.getSelectedData();
    let obj =this.getSendData();
    this.gridSelectionResponce.emit(obj);
  }  
  getSelectedData(){
    this.selectedData = [];    
    if(this.gridData && this.gridData.length > 0){
      this.gridData.forEach(element => {
        if(element && element.selected){
          this.selectedData.push(element);
        }
      });
    }
    if(this.selecteData && this.selecteData.length > 0 && this.field.add_new_enabled){
      this.selecteData.forEach(element => {
        if(element && element.customEntry){
          this.selectedData.push(element);
        }
      });      
    }
    this.setSelectTab();
  }
  setSelectTab(){
    if(this.selecteData && this.selecteData.length > 0){
      this.selectedTab = "added";
    }else{
      this.selectedTab = "new";
    }
  }
  getFirstCharOfString(char:any){
    return this.commonFunctionService.getFirstCharOfString(char);
  }
  
  getName(object:any){
    let columns = this.field.gridColumns;
    let field_name : string = "";
    columns.forEach(element => {
      if(element.field_name == "plainCustomerName"){
        field_name = element.field_name;
      }else if(element.field_name == "sealSerialNumber"){
        field_name = element.field_name;
      }else {
        field_name = columns[0].field_name;
      }
    });
    if(field_name == ""){
      field_name = columns[0].field_name;
    }
    let value = this.commonFunctionService.getObjectValue(field_name,object);
    return value;
  }

  async delete(index:number){
    //confirmation alert
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete === "confirm"){
      this.selectedData.splice(index,1);
      this.setSelectTab();
      let obj =this.getSendData()
      this.gridSelectionResponce.emit(obj);
    }
  }
  edite(index:number){
    let obj =this.getSendData()
    obj['action'] = "edite";
    obj['index'] = index;
    this.gridSelectionResponce.emit(obj);
  }
  getSendData(){
    let obj ={
      "action":'',
      "index":-1,
      "data": this.selectedData
    }
    return obj;
  }
  updateSelectedData(data:any,index?:any){
    if(this.selectedData && this.selectedData.length > 0){
      if(data && (data.id || data._id)){
        this.selectedData.forEach((element:any, i:number) => {
          if(element._id == data._id) {
            element = data;
            let obj =this.getSendData()
            this.gridSelectionResponce.emit(obj);
          }
        });
      }else{
        if(this.selectedData.length > index){          
          this.selectedData[index] = data;
        }else{
          this.selectedData.push(data);
        }
        let obj =this.getSendData()
        this.gridSelectionResponce.emit(obj);
      }
    }else{
        this.selectedData.push(data);
      // if(this.gridData && this.gridData.length > 0){
        // this.gridData[index] = data;
        let obj =this.getSendData();
        this.gridSelectionResponce.emit(obj);
      // }
    }
  }
}
