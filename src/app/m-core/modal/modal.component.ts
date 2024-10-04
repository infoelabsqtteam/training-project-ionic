import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@core/ionic-core';
import { ApiCallService, ApiService, CommonFunctionService, GridCommonFunctionService } from '@core/web-core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-modals',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() Data:any;
  @Input() modal: any;
  infoData:any;
  @Output() responceData = new EventEmitter();

  
  rateForm: UntypedFormGroup;
  public coloumName:any = '';
  public data=[];
  bulkDownload:boolean=false;
  editeMode:boolean=false;
  editedColumne:boolean=false;
  rateShow:boolean=false;
  gridColumns:any=[];
  public rateTotal:number=0;
  field:any={};
  public selectedData:any=[];
  multiGridDetails:any = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private apiService:ApiService,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private modalController: ModalController,
    private apiCallService: ApiCallService,
    private gridCommonFunctionService: GridCommonFunctionService
  ) {
  }

  // Angular LifeCycle Function Handling Start --------------------
  ngOnInit() { 
    this.rateForm = this.formBuilder.group( {} ); 
    this.setGridDetails(this.Data);
  }
  // Angular LifeCycle Function Handling End --------------------

  // Initial Function Handling Start --------------------
  
  setGridDetails(alert){
    let typeofData:string = "";
    this.field = alert.field;
    if(this.field.field_label){
      this.coloumName = this.field.field_label;
    }else if(this.field.label){
      this.coloumName = this.field.label;
    }else {
      this.coloumName = "";
    }
    this.data = JSON.parse(JSON.stringify(alert.data.data));
    typeofData = typeof (this.data);  //giving wrong type of array so set below stattement
    if(this.data.length > 0) typeofData = "array";
    // if data value is not array then it must be object.
    if(typeofData !== 'array'){
      this.data['object'] = true;
    }
    if(alert.data.gridColumns){
      this.gridColumns = JSON.parse(JSON.stringify(alert.data.gridColumns));
      if(this.gridColumns && this.gridColumns.length > 0){
        if(this.data.length > 0){
          this.gridColumns.forEach(element => {
            element['adkey'] = {'totalRows':this.data.length};
          });          
        }
        const staticModalGroup = this.apiCallService.commanApiPayload(this.gridColumns,[],[]);
        if (staticModalGroup.length > 0) {
          // this.store.dispatch(
          //   new CusTemGenAction.GetStaticData(staticModalGroup)
          // )
          this.apiService.getStatiData(staticModalGroup);
        }
      }      
      //Object.assign([],alert.data.gridColumns);
    }
    if(alert.editemode){
      this.editeMode = true;
    }
    if(alert.data.bulk_download){
      this.bulkDownload=true;
      if(this.data.length > 0){
        this.data['selected'] = false;
      }
    }
    if(alert.menu_name == 'request_qoute' && this.gridColumns.length == 0){
      const forControl = { };       
      this.data.forEach((element,i) => { 
        let mandatory = false;
        this.createFormControl(forControl,i,element.rate,"text",mandatory)     
      });                 
      if(forControl){
        this.rateForm = this.formBuilder.group( forControl );
      }
      this.rateShow=true;
      this.rateTotal=0;
      this.addRates();
    } 
  }
  // Initial Function Handling End --------------------

  // Click Function Handling Start -----------------------
  closeModal(role?:string){
      this.dismissModal(role);
      this.resetFlags();
    // }    
  }
  save(){
    this.responceData.emit(this.data);
    this.closeModal();
  }
  multipleDownload(){
    this.selectedData = [];
    if(this.data && this.data.length > 0){
      this.data.forEach(row => {
        if(row.selected){
          this.selectedData.push(row);
        }
      });
    }
    const alertData={
      field:this.coloumName,
      menu_name:this.field.field_name,
      data:this.selectedData
    }
    // this.modalService.open('multiple-download-modal',alertData)
  }
  // Click Function Handling End --------------------

  // Dependency Function Handling Start-------------------  
  createFormControl(forControl,fieldName,object,type,mandatory){
    switch (type) {
      case "text":
        if(mandatory){
          forControl[fieldName] = new UntypedFormControl(object, Validators.required)
        }else{
          forControl[fieldName] = new UntypedFormControl(object)
        }
      default:
        break;
    }    
  }
  addRates(){
    this.rateTotal=0;
    this.data.forEach((element,i) => {
      if(this.rateForm.value[i] != null){
        this.rateTotal=this.rateTotal + this.rateForm.value[i];
      }  
      this.data[i].rate =  this.rateForm.value[i]   
    })
  }
  dismissModal(role:string){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({'dismissed': true},role);
    }else{        
      this.modalController.dismiss({'dismissed': true},role,);
    }
  }
  multiDownloadResponce(event){
    if(this.data && this.data.length > 0){
      this.data.forEach(element => {
        if(element.selected){
          element.selected = false;
        }
      });
      this.notificationService.presentToastOnBottom(event.length +' File Downloaded.','success');
    }
  }
  resetFlags(){
    this.field = {};
    this.coloumName = "";
    this.data = [];
    // this.currentPage = "";
    this.editeMode=false;
    this.editedColumne=false;
    this.gridColumns=[];
  }
  // Dependency Function Handling End-------------------

  // HTML Dependency Function Handling Start-------------------
  toggle(index,event: any) {
    const data = JSON.parse(JSON.stringify(this.data))
    if (event.checked) {
      data[index].selected=true;
    } else {
      data[index].selected=false;
    }
    this.data = data;
    //console.log(this.selected3);
  }
  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  }
  isIndeterminate() {
    let check = 0;
    if(this.data.length > 0){
      this.data.forEach(row => {
        if(row.selected){
          check = check + 1;
        }
      });
    }
    return (check > 0 && !this.isChecked());
  };
  isChecked() {
    let check = 0;
    if(this.data.length > 0){
      this.data.forEach(row => {
        if(row.selected){
          check = check + 1;
        }
      });
    }
    return this.data.length === check;
  };
  toggleAll(event: any) {
    if ( event.checked ) {
      if(this.data.length > 0){
        this.data.forEach(row => {
          row.selected=true;
        });
      }
    }else{
      if(this.data.length > 0){
        this.data.forEach(row => {
          row.selected=false;
        });
      }
    }
  }
  getGridColumnWidth(column){
    if(column.width){
      return column.width;
    }else{
      if(this.gridColumns.length > 8){
        return '150px';
      }else{
        return '';
      }      
    }    
  }
  checkSelectedData(){
    let length = 0;
    if(this.data && this.data.length > 0){
      this.data.forEach(element => {
        if(element.selected){
          length = length + 1;
        }
      });
    }
    if(length >= 1){
      return true;
    }else{
      return false;
    }
  }
  // HTML Dependency Function Handling End-------------------

  // Not in Use Functions Start ----------------- 

  // storeGridDetails(){
  //   let object = {
  //     "data" : this.data,
  //     "gridColumns":this.gridColumns
  //   }
  //   const currentDetails = {
  //     "field": this.field,
  //     "data": object,
  //     // "menu_name": this.currentPage,
  //     'editemode': this.editeMode
  //   }
  //   this.multiGridDetails.push(currentDetails);
  // }
  // loadNextGrid(nextGridData){
  //   this.resetFlags();
  //   this.setGridDetails(nextGridData);
  // }
  // loadPreviousGrid(previousGridData){
  //   this.resetFlags();
  //   this.setGridDetails(previousGridData);
  // }
  
  
  // compareObjects(o1: any, o2: any): boolean {
  //   return o1._id === o2._id;
  // }
  // setValue(column,i){
  //   if(column.onchange_api_params && column.onchange_call_back_field){
  //     this.changeDropdown(column.onchange_api_params, column.onchange_call_back_field, column.onchange_api_params_criteria, this.data[i],i);
  //   }
  // }
  // changeDropdown(params, callback, criteria, object,i) {    
  //   const paramlist = params.split(";");
  //   if(paramlist.length>1){
      
  //   }else{
  //     const staticModal = []
  //     const staticModalPayload = this.apiCallService.getPaylodWithCriteria(params, callback, criteria, object);
  //     staticModalPayload['adkeys'] = {'index':i};
  //     staticModal.push(staticModalPayload)      
  //     if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
  //       staticModal[0]["data"]=object;
  //     }
  //     // this.store.dispatch(
  //     //   new CusTemGenAction.GetStaticData(staticModal)
  //     // )
  //     this.apiService.getStatiData(staticModal);
  //  }
  // }
  

  // Not in Use Functions End -----------------


}
