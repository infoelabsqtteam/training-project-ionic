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
  userInputChipsData:any;
  alreadyAdded:boolean;
  toastMsg:string;

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
    this.updateModeRejectedGridReadOnly();
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
    if(this.Data){
      if(this.Data['column'].length > 0){
        this.columnList  = this.Data['column'];
      }
      if(this.Data['value'] !=""){
        this.data  = this.Data['value'];
      }
      if(this.Data['field'] != ""){
        this.field = this.Data['field'];
      }
      this.alreadyAdded  = this.Data['alreadyAdded'];      
    }
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
  updateModeRejectedGridReadOnly(){
    if(this.data && this.data.approvedStatus == "Approved"){
      this.readonly = true;
      if(this.isDisable(this.field, this.data)){
        this.storageService.presentToast("This record already added and approved")
      }
    }else if(this.data && this.data.rejectedCustomers){
      this.readonly = true;
    }
    // else if(this.data && this.data.selected && !this.data.rejectedCustomers){
    //   this.readonly = false;
    // }else if(this.data && !this.data.selected ){
    //   this.readonly = false;
    // }
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
  async select(){
    if(this.alreadyAdded){
      this.storageService.presentToast("Can't perform this action because this record already added");
    }else{
      // if(this.checkValidator()){
        this.storageService.presentToast("Record selected");
        this.dismissModal(this.data,false);
      // }
    }
  }
  remove(){
    if(!this.alreadyAdded){
      this.storageService.presentToast("Can't perform this action because this record not selected");
    }else{
      this.storageService.presentToast("Record removed");
      this.dismissModal(this.data,true);
    }
  }
  checkValidator(){
    if(this.data){
      let selectedItem = 0;
      this.Data['column'].forEach(element => {
        if(element.selected  && selectedItem == 0){
          selectedItem = 1;
        }
      });
      if(selectedItem == 1){
        return false;
      }else{
        return true;
      }
    }
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
  checkRowIf(data:any){
    let check = false;
    if(data.selected){
      let condition = '';
      if(this.field.disableRowIf && this.field.disableRowIf != ''){
        condition = this.field.disableRowIf;
      }
      if(condition != ''){
        if(this.CommonFunctionService.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
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
    this.addedDataInList = this.typeaheadObjectWithtext[field.field_name];
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
  setTypeaheadData(typeAheadData:any) {
    if (typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }
  setValue(option,field,data) {
    if(option != null){
      const alreadyAddedList = data[field.field_name];
      if (option.keyCode == 13 && option.target.value !=""){
        if(this.CommonFunctionService.checkDataAlreadyAddedInListOrNot("_id",option.target.value,alreadyAddedList)){
          this.storageService.presentToast( option.target.value + ' Already Added');
        }else{
          if(data[field.field_name] == null) data[field.field_name] = [];
            data[field.field_name].push(option.target.value);
        }
        option.target.value = "";
      }else{
        if(option !=""){
          if(this.CommonFunctionService.checkDataAlreadyAddedInListOrNot("_id",option,alreadyAddedList)){
            this.storageService.presentToast( option.name + ' Already Added');
          }else{
            if(data[field.field_name] == null) data[field.field_name] = [];
            data[field.field_name].push(option); 
          }
          this.userInputChipsData = "";
          this.chipsData = {};
          this.typeAheadData = [];
        }
      }
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
  resetVariables(){
    this.typeAheadData = [];
  }
 

}
