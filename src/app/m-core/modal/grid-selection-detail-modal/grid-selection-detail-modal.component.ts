import { Component, Input, OnInit } from '@angular/core';
import { ApiService, CoreUtilityService, DataShareService, RestService } from '@core/ionic-core';
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
  @Input() InlineformGridSelection:any;

  cardType:any;
  columnList :any = [];
  data:any={};
  gridSelctionTitle:any;
  gridselectionverticalbutton:any;
  selectedTab:string = "new";
  staticData: any = {};
  copyStaticData:any={};
  staticDataSubscription;

  constructor(
    private modalController: ModalController,
    private CommonFunctionService:CoreUtilityService,
    private coreFunctionService: CoreUtilityService,
    private dataShareService: DataShareService,
    private apiService:ApiService,
    private restService:RestService
  ) { 
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })
  }

  ngOnInit() {
    this.onload();
  }
  
  ionViewWillEnter(){
    // this.cardType = this.childCardType;
    // this.columnlistNew = this.Data[0];
    let samePageGridSelection = this.dataShareService.getgridselectioncheckvalue();
    if(samePageGridSelection){
      this.gridSelctionTitle="Travel Management Details"
    }else{
      this.gridSelctionTitle="Quotation Details"
    }
    if(samePageGridSelection  && this.InlineformGridSelection){
      this.gridselectionverticalbutton = this.InlineformGridSelection;
    }else{ 
      this.gridselectionverticalbutton = false;
    }
  }
  ionViewDidEnter(){}
  ionViewWillLeave(){}  
  ionViewDidLeave(){}
  ngOnDestroy() {
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
    
  }


  onload(){
    this.cardType = this.childCardType;
    this.columnList  = this.Data['column'];
    this.data = this.Data['value'];
    this.getStaticDataWithDependentData();
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
    return this.coreFunctionService.getValueForGrid(field, object);
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
  }
  remove(){
    this.dismissModal(this.data,true);
  }
  checkValidator(){
    return false;
  }
  isDisable(field,object){
    const updateMode = false;
    if(field.is_disabled){
      return true;
    }else if(field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != ''){
      return this.CommonFunctionService.isDisable(field.etc_fields,updateMode,object);
    }
    return false;
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
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      })
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
  

}
