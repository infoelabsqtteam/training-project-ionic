import { Component, Input, OnInit } from '@angular/core';
import { AppDataShareService, NotificationService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { GridSelectionDetailModalComponent } from '../grid-selection-detail-modal/grid-selection-detail-modal.component';
import { ApiService, CommonFunctionService, DataShareService, LimsCalculationsService, CoreFunctionService, CheckIfService, ApiCallService, GridCommonFunctionService } from '@core/web-core';


@Component({
  selector: 'app-grid-selection-modal',
  templateUrl: './grid-selection-modal.component.html',
  styleUrls: ['./grid-selection-modal.component.scss'],
})
export class GridSelectionModalComponent implements OnInit {

  @Input() Data : any;
  @Input() modal: any;

  selecteData:any=[];
  selectedData:any = [];
  field:any={};
  parentObject={};
  gridData:any=[];
  listOfGridFieldName:any =[]; 
  staticDataSubscriber:any;
  responseData:any;
  copyStaticData:[] = [];

  editeMode:boolean=false;
  grid_row_selection:boolean = false;
  grid_row_refresh_icon:boolean = false;

  selectedTab:string = "new";
  setGridData:boolean=false;

  data :any = [];
  expandicon: any = "assets/itc-labs/icon/expand-icon.png";
  reloadBtn:boolean = false;

  onlySelected:boolean = true;
  onlySelectedData:boolean = false;
  checkSelectedData:boolean = false;
  editableGridColumns:any=[];
  modifiedGridData:any = [];
  editEnable:boolean=false;

  constructor(
    private modalController: ModalController,
    private apiService:ApiService,
    private notificationService:NotificationService,
    private coreFunctionService: CoreFunctionService,
    private commonFunctionService: CommonFunctionService,
    private limsCalculationService: LimsCalculationsService,
    private dataShareService: DataShareService,
    private appDataShareService: AppDataShareService,
    private checkIfService: CheckIfService,
    private apiCallService: ApiCallService,
    private gridCommonFunctionService: GridCommonFunctionService
  ) { }

  // Ionic LifeCycle Function Handling Start ------------------
  ionViewWillLeave(){
    // this.unsubscribe();
  }
  // Ionic LifeCycle Function Handling End ------------------

  // Angular LifeCycle Function Handling Start --------------------
  ngOnInit() {
    this.onload();
    this.subscribe();
  }
  ngOnDestroy() {
    //Above ionViewwillLeave is working fine.
    this.unsubscribe();
  }
  // Angular LifeCycle Function Handling End ---------------

  // Subscriber Functions Handling Start -------------------
  subscribe(){
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      if(this.coreFunctionService.isNotBlank(this.field) && this.coreFunctionService.isNotBlank(this.field.ddn_field)  && data[this.field.ddn_field]){
        this.responseData = data[this.field.ddn_field];
      }else{
        this.responseData = [];
      }
      if(data && Object.keys(data).length > 0){
        Object.keys(data).forEach(key => {     
          if(key && key != '' && data[key]){
            if(this.field && this.field.ddn_field && data[this.field.ddn_field] && this.field.ddn_field == key){
              //this.copyStaticData[key] = JSON.parse(JSON.stringify(data[key]));
            }else{
              this.copyStaticData[key] = JSON.parse(JSON.stringify(data[key]));
            }
          }
        })
      }
      if(this.setGridData && this.field.ddn_field && data[this.field.ddn_field] && data[this.field.ddn_field] != null){
        this.setStaticData(data);
        if(this.gridData.length > 0 && this.listOfGridFieldName.length > 0){
          this.modifiedGridData = this.gridCommonFunctionService.modifyGridData(this.gridData,this.listOfGridFieldName,this.field,this.editableGridColumns,[]);
          if(this.modifiedGridData && this.modifiedGridData.length < 50){
            this.editEnable = true;
          }
          this.checkSelectedDataLength();
          //this.getViewData();
        }else{
          // this.modifiedGridData = [];
        }
      }
    })
  }
  // Subscriber Functions Handling End -------------------

  // Initial Function Handling Start ---------------- 
  onload(){
    if(this.Data?.updateMode && this.Data.updateMode){      
      this.selectedTab = "added";
    }else{
      this.selectedTab = "new";
    }
    this.selecteData = [];  
    this.selecteData = JSON.parse(JSON.stringify(this.Data.selectedData)); 
    this.selectedData = JSON.parse(JSON.stringify(this.Data.selectedData));
    this.field = this.Data.field;
    if(this.Data.object){
      this.parentObject = this.Data.object;
    }
    if(this.field && this.field.grid_selection_button_label != null && this.field.grid_selection_button_label != ''){
      this.field.label = this.field.grid_selection_button_label;
    }
    if (this.field && this.field.grid_row_selection) {
      this.grid_row_selection = true;
    } else {
      this.grid_row_selection = false;
      this.checkSelectedData = true;
      this.onlySelectedData = true;
    }
    if(this.Data.field.onchange_api_params == "" || this.Data.field.onchange_api_params == null){
      this.gridData = this.selectedData;
      this.modifiedGridData = this.gridCommonFunctionService.modifyGridData(this.selecteData,this.listOfGridFieldName,this.field,this.editableGridColumns,[]);      
      if(this.grid_row_selection && this.modifiedGridData && this.modifiedGridData.length < 50){
        this.editEnable = true;
      }
    }
    else{
      this.setGridData = true;
      this.gridData = [];
      this.modifiedGridData = [];
    }
    if(this.field.gridColumns && this.field.gridColumns.length > 0){
      this.listOfGridFieldName = [];
      let index = 0;
      this.field.gridColumns.forEach(field => {
        if(this.coreFunctionService.isNotBlank(field.show_if)){
          if(!this.checkIfService.showIf(field,this.parentObject)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }                
        }else{
          field['display'] = true;
        }
        if(index <= 5){
          this.listOfGridFieldName.push(field);
          index = index + 1;
        }
        this.editableGridColumns = this.gridCommonFunctionService.getListByKeyValueToList(this.listOfGridFieldName,"editable",true);
      }); 
    }else{
      this.notificationService.showAlert("Grid Columns are not available In This Field.",'',['dismiss']);
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

    //For dropdown data in grid selection
    this.getStaticDataWithDependentData();
  }
  // Initial Function Handling End ------------

  // Click Functions Handling Start -------------------
  reloadStaticData(){
    this.reloadBtn = true;
    let data:any = this.dataShareService.getStatiData();
    this.copyStaticData = data;
    if(this.setGridData && this.field.ddn_field && data[this.field.ddn_field] && data[this.field.ddn_field] != null && data[this.field.ddn_field] != undefined){
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
  dismissModal(data){
    this.closeModal();
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
        'dismissed': true,
        'data':data
      });
    }else{        
      this.modalController.dismiss({
        'dismissed': true,
        'data':data
      },);
    }
  }
  // CD
  refreshRowWithMasterData(index) {
    let rowData = this.gridData[index];
    if (this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length > 0) {
      var validity = true;
      if (Array.isArray(this.responseData)) {
        this.responseData.forEach(element => {
          this.field.matching_fields_for_grid_selection.forEach(matchcriteria => {
            if (this.commonFunctionService.getObjectValue(matchcriteria, rowData) == this.commonFunctionService.getObjectValue(matchcriteria, element)) {
              validity = validity && true;
            }
            else {
              validity = validity && false;
            }
          });
          if (validity == true) {
            const grid_data = JSON.parse(JSON.stringify(element))
            grid_data.selected = this.gridData[index]['selected'];
            this.gridData[index] = grid_data;
          }
        });
      }

    }
  }
  async addremoveparticipant(data,index){
    let alreadyAdded = false;
      this.selectedData.forEach(element => {
        if(element && element._id == data._id){
          alreadyAdded = true;
        }
      });
    const modal = await this.modalController.create({
      component: GridSelectionDetailModalComponent,
      componentProps: {
        "Data": {"value":data,"column":this.field.gridColumns,"alreadyAdded": alreadyAdded,"field":this.field},
        "index": index,
        "childCardType" : "demo1",
        "formInfo" : {"InlineformGridSelection" : this.appDataShareService.getgridselectioncheckvalue(), "type" : this.Data.formTypeName,"updateMode":this.Data?.updateMode} 
      },
      swipeToClose: false
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        const object = data['data']; // Here's your selected user!
        if(object['data'] && object['data']._id){
          this.toggle(object['data'],{'detail':{'checked':true}},0);
        }               
    });
    return await modal.present();
  }
  // CD
  selectGridData(){
    this.selectedData = this.gridCommonFunctionService.updateGridDataToModifiedData(this.grid_row_selection,this.gridData,this.modifiedGridData,this.listOfGridFieldName,);
    let check = 0;
    let validation = {
      'msg' : ''
    }
    if(this.field && this.field.mendetory_fields && this.field.mendetory_fields.length > 0){            
      if(this.selectedData && this.selectedData.length > 0){
        this.field.mendetory_fields = this.gridCommonFunctionService.getModifiedGridColumns(this.field.mendetory_fields,this.parentObject)
        this.field.mendetory_fields.forEach((mField:any) => {
          const fieldName = mField.field_name;
          if(mField.display){
          this.selectedData.forEach((row,i) => {
            // let checkDisable = this.isDisable(mField,row);
            let checkDisable = this.checkIfService.isDisableRuntime(mField,row,i,this.gridData,this.field,'');
            if(row && !checkDisable && (row[fieldName] == undefined || row[fieldName] == '' || row[fieldName] == null)){
              if(validation.msg == ''){
                const rowNo = i + 1;
                validation.msg = mField.label+'( '+rowNo+' ) is required.';
              }
              check = 1;
            }
          });
          }
        });        
      }
    }
    if(check != 0){
      this.selectedData = [];
      this.notificationService.presentToastOnBottom(validation.msg);
    }else{
      // this.selectedData = this.gridCommonFunctionService.updateGridDataToModifiedData(this.grid_row_selection,this.gridData,this.modifiedGridData,this.listOfGridFieldName,);
      this.dismissModal(this.selectedData); 
    }
  }  
  calculateNetAmount(data, fieldName, index){
    this.limsCalculationService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }
  segmentChanged(ev: any) {
    this.selectedTab = ev.target.value;
    if(ev.target.value == 'added'){
      this.onlySelected = true;
    }else{
      this.onlySelected = false;
    }
  }
  // Click Functions Handling End -------------------

  // Dependency Functions Handling Start -------------------
  toggle(data:any,event:any, indx:any) {
    let index:any;
    if(data._id != undefined){
      index = this.commonFunctionService.getIndexInArrayById(this.gridData,data._id);
    }else if(this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length>0){
      this.gridData.forEach((row:any, i:any) => {        
          var validity = true;
          this.field.matching_fields_for_grid_selection.forEach(matchcriteria => {
            if(this.commonFunctionService.getObjectValue(matchcriteria,data) == this.commonFunctionService.getObjectValue(matchcriteria,row)){
              validity = validity && true;
            }
            else{
              validity = validity && false;
            }
          });
          if(validity == true){
            index = i;
          }
      });
    }else {      
      index = indx;
    }
    if (event.detail.checked) {
      this.gridData[index].selected = true;
      this.modifiedGridData[index].selected = true;
      if(this.editEnable && this.editableGridColumns && this.editableGridColumns.length > 1){
        this.modifiedGridData[index].column_edit = true;
      }
    } else{
      this.gridData[index].selected = false;
      this.modifiedGridData[index].selected = false;
      if(this.editableGridColumns && this.editableGridColumns.length > 1){
        this.modifiedGridData[index].column_edit = false;
      }
    }
    // this.getSelectedData();
    
    this.checkSelectedDataLength();
  }
  isDisable(field,object){
    const updateMode = false;
    if(field.is_disabled){
      return true;
    }else if(field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != ''){
      return this.checkIfService.isDisable(field.etc_fields,updateMode,object);
    }
    return false;
  }
  // CD
  setStaticData(staticData){
    if(staticData){
      if(this.field.ddn_field && staticData[this.field.ddn_field] && staticData[this.field.ddn_field] != null){
        this.gridData = [];
        if(staticData[this.field.ddn_field] && staticData[this.field.ddn_field].length>0){
          staticData[this.field.ddn_field].forEach(element => {
            const gridData = JSON.parse(JSON.stringify(element))
            if(gridData.selected && this.selecteData.length < 0){
              gridData.selected = false;
            }
            this.gridData.push(gridData);
          });
        }
       
        if(this.gridData && this.gridData.length > 0){

          if(this.field.onchange_function && this.field.onchange_function_param != ""){
            switch(this.field.onchange_function_param){
              case "calculateQquoteAmount":
                this.gridData = this.limsCalculationService.calculateAutoEffRate(this.gridData);
                break;
            }
          } 
          if(this.selecteData && this.selecteData.length > 0){
            this.updateSelectedDataInGridData(this.selecteData); 
          }
          this.setGridData = false; 
          this.reloadBtn = false;     
        }
      }        
    }
  }
  // CD
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
  // CD
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
    const selectedData = this.selectedData[i];
    selectedData.selected = true;
    this.selectedData[i] = selectedData;
  }
  // CD
  getStaticDataWithDependentData(){
    const staticModal = []
    let staticModalGroup = this.apiCallService.commanApiPayload([],this.listOfGridFieldName,[],{});
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
    return this.gridCommonFunctionService.getValueForGrid(field, object);
  }
  // CD
  checkSelectedDataLength(){
    if(this.modifiedGridData.length > 0){
      let count = 0;
      for (let i = 0; i < this.modifiedGridData.length; i++) {
        const data = this.modifiedGridData[i];        
        if(data.selected){
          count++;
        }
        if(count >= 2){
          if(this.editableGridColumns && this.editableGridColumns.length > 0){
            this.checkSelectedData = true;
            this.onlySelectedData = true;
          }else{
            this.checkSelectedData = false;
            this.onlySelectedData = true;
          }          
          break;
        }else if(count >= 1){
          this.onlySelectedData = true;
          this.checkSelectedData = false;
        }else{
          this.checkSelectedData = false;
          this.onlySelectedData = false;
        }
        
      }
    }
  }
  closeModal(){
    this.gridData=[];
    this.selectedData = [];
    this.selecteData=[];
    this.data = '';
    this.onlySelected=false;
    this.checkSelectedData = false;
    this.onlySelectedData = false;
    this.modifiedGridData = [];
    this.editEnable=false;
  }
  // NOt in use
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
  }
  // Dependency Functions Handling End -------------------  

  // Unsubscriber Functions Handling Start -------------------
  unsubscribe(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
  }
  // Unsubscriber Functions Handling End -------------------
  
  
  // exists(item) {
  //   return this.selectedData.indexOf(item) > -1;
  // };
  // isIndeterminate() {
  //   let check = 0;
  //   if(this.gridData.length > 0){
  //     this.gridData.forEach(row => {
  //       if(row.selected){
  //         check = check + 1;
  //       }
  //     });
  //   }
  //   return (check > 0 && !this.isChecked());
  // };
  // isChecked() {
  //   let check = 0;
  //   if(this.gridData.length > 0){
  //     this.gridData.forEach(row => {
  //       if(row.selected){
  //         check = check + 1;
  //       }
  //     });
  //   }
  //   return this.gridData.length === check;
  // };
  // toggleAll(event: MatCheckboxChange) {
  //   if ( event.checked ) {
  //     if(this.gridData.length > 0){
  //       this.gridData.forEach(row => {
  //         row.selected=true;
  //       });
  //     }
  //   }else{
  //     if(this.gridData.length > 0){
  //       this.gridData.forEach(row => {
  //         row.selected=false;
  //       });
  //     }
  //   }
  //   //console.log(this.selected3);
  // }
  
  // checkValidator(){
  //   // if(this.preSelectedData){
  //   //   let selectedItem = 0;
  //   //   this.gridData.forEach(element => {
  //   //     if(element.selected  && selectedItem == 0){
  //   //       selectedItem = 1;
  //   //     }
  //   //   });
  //   //   if(selectedItem == 1){
  //   //     return false;
  //   //   }else{
  //   //     return true;
  //   //   }
  //   // }
  //   // return false;
  // }  

  // updateGridDataToModifiedData(grid_row_selection,gridData,modifiedGridData,listOfGridFieldName){  
  //   let gridSelectedData = []; 
  //   let modifiedSelectedData = [];
  //   if (grid_row_selection == false) {
  //     gridSelectedData = [...gridData];
  //     modifiedSelectedData = [...modifiedGridData];
  //   }
  //   else {
  //     gridSelectedData = this.getListByKeyValueToList(gridData,"selected",true); 
  //     modifiedSelectedData = this.getListByKeyValueToList(modifiedGridData,"selected",true);
  //   } 
  //   if(listOfGridFieldName.length > 0){  
  //     gridSelectedData.forEach((data,i) => {
  //       listOfGridFieldName.forEach(column => {
  //         if(column.editable || column.type == 'number'){
  //           gridSelectedData[i][column.field_name] = modifiedSelectedData[i][column.field_name];
  //         }         
  //       });
  //     });
  //   }  
  //   return gridSelectedData;  
  // }
  
  // getListByKeyValueToList(list,key,value){
  //   let getlist = [];
  //   for (let i = 0; i < list.length; i++) {
  //     const element = list[i];
  //     if(element && element[key] == value){
  //       getlist.push(element);
  //     }
  //   }
  //   return getlist;
  // }

  // modifyGridData(gridData,gridColumns,field,editableGridColumns,typegrapyCriteriaList){
  //   let modifiedData = [];
  //   if(gridColumns.length > 0){      
  //     for (let i = 0; i < gridData.length; i++) {
  //       const row = gridData[i];
  //       let modifyRow = this.rowModify(row,field,gridColumns,editableGridColumns,typegrapyCriteriaList);     
  //       modifiedData.push(modifyRow);
  //     }
  //   }
  //   return modifiedData;
  // }

  // rowModify(row,field,gridColumns,editableGridColumns,typegrapyCriteriaList){
  //   let modifyRow = JSON.parse(JSON.stringify(row));
  //   modifyRow["disabled"] = this.checkRowIf(row,field);
  //   for (let j = 0; j < gridColumns.length; j++) {
  //     const column = gridColumns[j];  
  //     if(!column.editable || editableGridColumns.length == 0){        
  //       modifyRow[column.field_name] = this.gridCommonFunctionService.getValueForGrid(column,row);
  //     }          
  //     if(column.editable){
  //       modifyRow[column.field_name+"_disabled"] = this.isDisable(column,row);            
  //     }
  //   }
  //   if(editableGridColumns && (editableGridColumns.length == 1 || (field && !field.grid_row_selection) || row.selected)){
  //     modifyRow["column_edit"] = true;
  //   }else{
  //     modifyRow["column_edit"] = false;
  //   }  
  //   if(editableGridColumns && editableGridColumns.length == 0 && field && Object.keys(field).length > 0){
  //     modifyRow['actionBtnDisplay'] = this.gridCommonFunctionService.checkRowDisabledIf(field,row);
  //   } 
  //   // if(typegrapyCriteriaList && typegrapyCriteriaList.length > 0){
  //   //   modifyRow['background-color'] = this.checkTypgraphCondition(typegrapyCriteriaList,row,'background-color');
  //   // }
  //   return modifyRow;
  // }

  // checkRowIf(data,field){
  //   let check = false;
  //   if(data.selected || field.checkDisableRowIf){
  //     let condition = '';
  //     if(field.disableRowIf && field.disableRowIf != ''){
  //       condition = field.disableRowIf;
  //     }
  //     if(condition != ''){
  //       if(this.checkIfService.checkDisableRowIf(condition,data)){
  //         check = true;
  //       }else{
  //         check = false;
  //       }
  //     }
  //   }
  //   return check;
  // }

  // checkRowDisabledIf(field,data){  
  //   if(field && field.disableRowIf && field.disableRowIf != ''){  
  //     const condition = field.disableRowIf;
  //     if(condition){
  //       if(field.disableRowIfOnlySelection){
  //         return true;
  //       }else{
  //         return !this.checkIfService.checkDisableRowIf(condition,data);
  //       }      
  //     }
  //   }
  //   return true;    
  // }

}
