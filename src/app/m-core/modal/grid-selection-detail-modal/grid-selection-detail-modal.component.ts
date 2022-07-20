import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService, CoreUtilityService, DataShareService, NotificationService, RestService, StorageService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-grid-selection-detail-modal',
  templateUrl: './grid-selection-detail-modal.component.html',
  styleUrls: ['./grid-selection-detail-modal.component.scss'],
})
export class GridSelectionDetailModalComponent implements OnInit {
  
  @Input() childCardType: any;
  @Input() Data: any;
  @Input() modal: any;
  @Input() formInfo:any;

  cardType:any;
  columnList :any = [];
  data:any={};
  gridSelctionTitle:any;
  gridselectionverticalbutton:any;
  selectedTab:string = "new";
  staticData: any = {};
  copyStaticData:any={};
  staticDataSubscription:any;
  addedDataInList: any;
  typeaheadDataSubscription:any;
  typeAheadData: any;
  chips:any;
  readonly:boolean = false;
  griddatasaved:boolean;
  chipsData:any;
  datasave:boolean;
  field:any = {};
  typeaheadObjectWithtext:any;

  constructor(
    private modalController: ModalController,
    private CommonFunctionService:CoreUtilityService,
    private dataShareService: DataShareService,
    private apiService:ApiService,
    private restService:RestService,
    private storageService: StorageService
  ) { 
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })
    this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data => {
      this.setTypeaheadData(data);
    })
  }

  ngOnInit() {
    this.onload();
  }
  
  ionViewWillEnter(){
    // this.cardType = this.childCardType;
    // this.columnlistNew = this.Data[0];
    this.setTopHeaderTitle();
    // this.updateModeReadOnly();
  }
  ionViewDidEnter(){}
  ionViewWillLeave(){}  
  ionViewDidLeave(){}
  ngOnDestroy() {
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
    if(this.typeaheadDataSubscription){
      this.typeaheadDataSubscription.unsubscribe();
    }    
  }
  onload(){
    this.cardType = this.childCardType;
    this.columnList  = this.Data['column'];
    this.data = this.Data['value'];
    this.field = this.Data['field']; 
    this.getStaticDataWithDependentData();
  }
  setTopHeaderTitle(){
    if(this.formInfo){
      if(this.formInfo.name !=""){
        this.gridSelctionTitle = this.formInfo.name
      }else if(this.formInfo.InlineformGridSelection && this.formInfo.name == ""){
      this.gridSelctionTitle="Travel Management Details";
      this.gridselectionverticalbutton = this.formInfo.InlineformGridSelection;
      }else if(!this.formInfo.InlineformGridSelection && this.formInfo.name == "") {
        this.gridSelctionTitle="Quotation Details";
        this.gridselectionverticalbutton = false;
      }
    }
  }
  getStaticDataWithDependentData(){
    const staticModal = []
    let staticModalGroup = this.restService.commanApiPayload([],this.columnList,[],this.data);
    if(staticModalGroup.length > 0){
      staticModalGroup.forEach(element => {
        staticModal.push(element);
      });
    } 
    if(staticModal.length > 0){    
      this.apiService.getStatiData(staticModal);
    }
  }
  getValueForGrid(field, object) {
    return this.CommonFunctionService.getValueForGrid(field, object);
  }
  dismissModal(data?:any,remove?:any){
    this.modal.dismiss({
      'data':data,
      'dismissed': true,
      'remove':remove
    });
  }
  select(){
    this.dismissModal(this.data,false);
    this.datasave = false;
  }
  remove(){
    this.dismissModal(this.data,true);
  }
  checkValidator(){
    return false;
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
      return this.CommonFunctionService.isDisable(field.etc_fields, updateMode, object);
    }   
    return false;
  }
  checkRowIf(data){
    let check = false;
    if(data.selected){
      let condition = '';
      if(this.field.disableRowIf && this.field.disableRowIf != ''){
        condition = this.field.disableRowIf;
      }
      if(condition != ''){
        if(this.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  
  checkDisableRowIf(field,formValue){
    let check = false;
    if(this.CommonFunctionService.checkIfCondition(field,formValue)){
      check = true;
    }else{
      check = false;
    }
    return check;
  }

  calculateNetAmount(data, fieldName, index:number){

    this.CommonFunctionService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }
  doSomething(ev: any) {
    // this.selectedTab = ev.target.value;
    console.log(ev);
  }
  setStaticData(staticData){
    if (staticData) {
      this.staticData = staticData;
      Object.keys(this.staticData).forEach(key => {
        if(this.staticData[key]){       
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      } })
    }
  }
  // setValue(column,i){
  //   if(column.onchange_api_params && column.onchange_call_back_field){
  //     this.changeDropdown(column.onchange_api_params, column.onchange_call_back_field, column.onchange_api_params_criteria, this.elements[i],i);
  //   }
  // }
  // changeDropdown(params, callback, criteria, object,i) {    
  //   const paramlist = params.split(";");
  //   if(paramlist.length>1){
      
  //   }else{
  //     const staticModal = []
  //     const staticModalPayload = this.CommonFunctionService.(params, callback, criteria, object);
  //     // staticModalPayload['adkeys'] = {'index':i};
  //     staticModal.push(staticModalPayload)      
  //     if(params.indexOf("FORM_GROUP") >= 0){
  //       staticModal[0]["data"]=object;
  //     }
  //     // this.store.dispatch(
  //     //   new CusTemGenAction.GetStaticData(staticModal)
  //     // )
  //     this.apiService.getStatiData(staticModal);
  //  }
  // }
  getddnDisplayVal(val) {
    return this.CommonFunctionService.getddnDisplayVal(val);
  }

  searchTypeaheadData(field, currentObject,chipsInputValue) {
    this.typeaheadObjectWithtext = currentObject;

    this.addedDataInList = this.typeaheadObjectWithtext[field.field_name]

    this.typeaheadObjectWithtext[field.field_name] = chipsInputValue.target.value;

    let call_back_field = '';
    let criteria = [];
    const staticModal = []
    if (field.call_back_field && field.call_back_field != '') {
      call_back_field = field.call_back_field;
    }
    if(field.api_params_criteria && field.api_params_criteria != ''){
      criteria =  field.api_params_criteria;
    }
    let staticModalGroup = this.restService.getPaylodWithCriteria(field.api_params, call_back_field, criteria, this.typeaheadObjectWithtext ? this.typeaheadObjectWithtext : {});
    staticModal.push(staticModalGroup);
    this.apiService.GetTypeaheadData(staticModal);

    this.typeaheadObjectWithtext[field.field_name] = this.addedDataInList;
  }

  setTypeaheadData(typeAheadData) {
    if (typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }


  setValue(option,field,data) {
    if(option != null){
      const alreadyAddedList = data[field.field_name];
      if(this.checkDataAlreadyAddedInListOrNot("_id",option,alreadyAddedList)){
        this.storageService.presentToast( option.name + ' Already Added');
      }else{
        if(data[field.field_name] == null) data[field.field_name] = [];
        data[field.field_name].push(option); 
      }
      this.chipsData = {};
      this.typeAheadData = [];

    }  
      
  } 
  
  custmizedFormValueData(data, fieldName) {
    if (data && data[fieldName.field_name] && data[fieldName.field_name].length > 0) {
      return data[fieldName.field_name];
    }
  }
  removeItem(data:any,column:any,i:number){
    data[column.field_name].splice(i,1);
    return data[column.field_name];
  }

  checkDataAlreadyAddedInListOrNot(primary_key,incomingData,alreadyDataAddedlist){
    if(alreadyDataAddedlist == undefined){
      alreadyDataAddedlist = [];
    }
    let alreadyExist = "false";
    if(typeof incomingData == 'object'){
      alreadyDataAddedlist.forEach(element => {
        if(element._id == incomingData._id){
          alreadyExist =  "true";
        }
      });
    }
    else if(typeof incomingData == 'string'){
      alreadyDataAddedlist.forEach(element => {
        if(typeof element == 'string'){
          if(element == incomingData){
            alreadyExist =  "true";
          }
        }else{
          if(element[primary_key] == incomingData){
            alreadyExist =  "true";
          }
        }
      
      });
    }else{
      alreadyExist =  "false";
    }
    if(alreadyExist == "true"){
      return true;
    }else{
      return false;
    }
  }

  resetVariables(){
    this.typeAheadData = [];
  }

  

}
