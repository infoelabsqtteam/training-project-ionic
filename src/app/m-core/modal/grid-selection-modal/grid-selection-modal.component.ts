import { Component, Input, OnInit } from '@angular/core';
import { ApiService, CoreUtilityService, DataShareService, NotificationService, RestService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { GridSelectionDetailModalComponent } from '../grid-selection-detail-modal/grid-selection-detail-modal.component';

@Component({
  selector: 'app-grid-selection-modal',
  templateUrl: './grid-selection-modal.component.html',
  styleUrls: ['./grid-selection-modal.component.scss'],
})
export class GridSelectionModalComponent implements OnInit {

  @Input() Data : any;
  @Input() modal: any;

  selecteData:any=[];
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

  
  // test array
  data :any =
      [
          {"cardType":"demo","company_name":"abc pvt ltd","final_amount":0.00,"quotation_no":"B01-220405RQ00001","contact_person":"Aggregate Bedding Sand 2","mobile":"3887722","email":"jhduy@gmail.com","address1":"patel nagar/delhi","country":"india","state":"Delhi","department_name":"building","class_name":"test"}
      ]

  constructor(
    private modalController: ModalController,
    private coreFunctionService: CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private notificationService:NotificationService,
    private dataShareService:DataShareService
  ) { }

  ngOnInit() {
    this.onload();
    this.subscribe();

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
  onload(){
    this.selecteData = [];  
    this.selecteData = this.Data.selectedData; 
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
    if(this.field.gridColumns && this.field.gridColumns.length > 0){
      this.field.gridColumns.forEach(field => {
        if(this.coreFunctionService.isNotBlank(field.show_if)){
          if(!this.coreFunctionService.showIf(field,this.parentObject)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }                
        }else{
          field['display'] = true;
        }
      });
      this.listOfGridFieldName = this.field.gridColumns;  
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
    this.getStaticDataWithDependentData()
  }
  getStaticDataWithDependentData(){
    const staticModal = []
    let staticModalGroup = this.restService.commanApiPayload([],this.listOfGridFieldName,[],{});
    if(staticModalGroup.length > 0){
      staticModalGroup.forEach(element => {
        staticModal.push(element);
      });
    } 
    if(staticModal.length > 0){    
      this.apiService.getStatiData(staticModal);
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
        }
      }        
    }
  }

  async addremoveparticipant(){
    const modal = await this.modalController.create({
      component: GridSelectionDetailModalComponent,
      componentProps: {
        "Data": this.data,
        "childCardType" : "demo1"
      },
      swipeToClose: false
    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }
  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

}
