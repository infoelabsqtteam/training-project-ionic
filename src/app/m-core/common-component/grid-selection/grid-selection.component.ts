import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService, CoreUtilityService, DataShareService, NotificationService, RestService, StorageService } from '@core/ionic-core';
import { AlertController, ModalController } from '@ionic/angular';
import { GridSelectionDetailModalComponent } from '../../modal/grid-selection-detail-modal/grid-selection-detail-modal.component';

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
  copyStaticData:[] = [];

  editeMode:boolean=false;
  grid_row_selection:boolean = false;
  grid_row_refresh_icon:boolean = false;

  selectedTab:any = "new";
  // selectedTabAgain:any;

  expandicon: any = "assets/itc-labs/icon/expand-icon.png";

  data :any = [];
  formName:any= "default";
  readonly:boolean= false;
  updateMode:boolean= false;


  constructor(    
    private modalController: ModalController,
    private coreFunctionService: CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private notificationService:NotificationService,
    private dataShareService:DataShareService,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }
  

  ngOnInit() {
    if(this.Data && this.Data.formTypeName !=""){
      // this.formName = this.Data.formTypeName; 
      this.formName = "default";
      if(this.Data.formTypeName === "UPDATE"){  
        this.selectedTab = "added";
      }
    }else{
      this.formName = "default";
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    if(this.Data){
      this.onload();
      this.subscribe();
    } 
  }
  subscribe(){
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      if(this.coreFunctionService.isNotBlank(this.field) && this.coreFunctionService.isNotBlank(this.field.ddn_field)  && data[this.field.ddn_field]){
        this.responseData = data[this.field.ddn_field];
      }else{
        this.responseData = [];
      }
      this.copyStaticData = data;
      this.setStaticData(data);
    })
  }
  ngOnDestroy(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
  }
  onload(){
    this.selectedTab = "new";
    this.selecteData = [];  
    this.selecteData = JSON.parse(JSON.stringify(this.Data.selectedData)); 
    this.selectedData = JSON.parse(JSON.stringify(this.Data.selectedData));
    this.field = this.Data.field;
    if(this.Data.object){
      this.parentObject = this.Data.object;
    }
    if(this.Data.field.onchange_api_params == "" || this.Data.field.onchange_api_params == null){
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
  }
  
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
                this.gridData = this.coreFunctionService.calculateAutoEffRate(this.gridData);
                break;
            }
          }
          
          this.selecteData.forEach(element => {
            this.gridData.forEach((row, i) => {
              if(this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length>0){
                var validity = true;
                this.field.matching_fields_for_grid_selection.forEach(matchcriteria => {
                  if(this.coreFunctionService.getObjectValue(matchcriteria,element) == this.coreFunctionService.getObjectValue(matchcriteria,row)){
                    validity = validity && true;
                  }
                  else{
                    validity = validity && false;
                  }
                });
                if(validity == true){
                  this.gridData[i]= element
                const grid_data = JSON.parse(JSON.stringify(this.gridData[i]))
                grid_data.selected = true;
                this.gridData[i] = grid_data;
                }
              }
              else{
                 if(this.coreFunctionService.getObjectValue("_id",element) == this.coreFunctionService.getObjectValue('_id',row)){
                  this.gridData[i]= element
                  const grid_data = JSON.parse(JSON.stringify(this.gridData[i]))
                  grid_data.selected = true;
                  this.gridData[i] = grid_data;
                }
              }
            });
          });  
          this.getSelectedData();        
        }
      }        
    }
  }

  getValueForGrid(field, object) {
    return this.coreFunctionService.getValueForGrid(field, object);
  }
  isDisable(field, object) {
    this.updateMode = false;
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
      return this.coreFunctionService.isDisable(field.etc_fields, this.updateMode, object);
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
        if(this.coreFunctionService.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  checkRowDisabledIf(field,index){
    const data = this.Data.selectedData[index];
    const condition = field.disableRowIf;
    if(condition){
      return !this.coreFunctionService.checkDisableRowIf(condition,data);
    }
    return true;    
  }
  calculateNetAmount(data, fieldName, index){

    this.coreFunctionService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }

  async addremoveparticipant(data,index){
    // if(this.field && this.field.add_new_enabled){
    //   this.edite(index);
    // }else{
      let alreadyAdded = false;
      let toastMsg = ""
      this.selectedData.forEach(element => {
        if(element && element._id == data._id){
          alreadyAdded = true;
          // if(data && data.approvedStatus == "Approved"){
          //   toastMsg = "this record already added & approved";
          // }else{
          //   toastMsg = "this record already added";
          // }
        }
      });
      const modal = await this.modalController.create({
        component: GridSelectionDetailModalComponent,
        componentProps: {
          "Data": {"value":data,"column":this.field.gridColumns,"field":this.field,"alreadyAdded": alreadyAdded},
          "childCardType" : "demo1",
          "formInfo" : {"InlineformGridSelection" : this.dataShareService.getgridselectioncheckvalue(), "type" : this.Data.formTypeName,"name":""}          
        },
        swipeToClose: false
      });
      modal.componentProps.modal = modal;
      modal.onDidDismiss()
        .then((data) => {
          const object = data['data']; // Here's your selected user!
          if(object['data'] && object['remove']){
            this.toggle(object['data'],{'detail':{'checked':false}},0);
          }else if(object['data'] && object['remove'] == false){
            this.toggle(object['data'],{'detail':{'checked':true}},0);
          }else{
            console.log("No action performed.");
          }                 
      });
      return await modal.present();
    // }
  }
  
  toggle(data:any,event:any, indx:any) {
    let index:any = -1;
    if(data._id != undefined){
      index = this.coreFunctionService.getIndexInArrayById(this.gridData,data._id);
      this.gridData[index] = data;
    }else if(this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length>0 && data){
      for (let i = 0; i < this.gridData.length; i++) {
          const row = this.gridData[i]; 
          for (let j = 0; j < this.field.matching_fields_for_grid_selection.length; j++) {
            const matchcriteria = this.field.matching_fields_for_grid_selection[j];          
            if(this.coreFunctionService.getObjectValue(matchcriteria,data) == this.coreFunctionService.getObjectValue(matchcriteria,row)){
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
        // this.selectedTab = "added";
      } else{
        this.gridData[index].selected=false;
      }
    }
    this.getSelectedData();
    let obj =this.getSendData()
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
  }
  getFirstCharOfString(char:any){
    return this.coreFunctionService.getFirstCharOfString(char);
  }
  
  getName(object:any){
    let columns = this.field.gridColumns;
    let field_name = columns[0].field_name;
    let value = this.coreFunctionService.getObjectValue(field_name,object);
    return value;
  }

  async delete(index:number){
    //alerte if ture then
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete === "confirm"){
      this.selectedData.splice(index,1);
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
}
