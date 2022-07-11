import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService, CoreUtilityService, DataShareService, NotificationService, RestService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
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
  formName:any;


  constructor(    
    private modalController: ModalController,
    private coreFunctionService: CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private notificationService:NotificationService,
    private dataShareService:DataShareService,
    private coreUtilityService:CoreUtilityService
  ) { 
    // console.log(this.formNameTypeTravel);
    // this.formNameTypeTravel(data){
    //   console.log(data)
    }
  

  ngOnInit() {
    // this.onload();
    // this.subscribe();
    if(this.Data && this.Data.formTypeName !=""){
      this.formName = this.Data.formTypeName;
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
      this.listOfGridFieldName = [];
      let index = 0;
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
        if(index <= 5){
          this.listOfGridFieldName.push(field);
          index = index + 1;
        }
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

  getValueForGrid(field, object) {
    return this.coreFunctionService.getValueForGrid(field, object);
  }
  isDisable(field,object){
    const updateMode = false;
    if(field.is_disabled){
      return true;
    }else if(field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != ''){
      return this.coreFunctionService.isDisable(field.etc_fields,updateMode,object);
    }
    return false;
  }
  calculateNetAmount(data, fieldName, index){

    this.coreFunctionService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }

  async addremoveparticipant(data){
    const modal = await this.modalController.create({
      component: GridSelectionDetailModalComponent,
      componentProps: {
        "Data": {"value":data,"column":this.field.gridColumns},
        "childCardType" : "demo1",
        "InlineformGridSelection" : this.dataShareService.getgridselectioncheckvalue()
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
  }
  selectGridData(){
    this.selectedData = [];
    if(this.grid_row_selection == false){
      this.selectedData = [...this.gridData];
    }else{
      this.gridData.forEach((row:any) => {
        if(row.selected){
          this.selectedData.push(row);
        }
      });
    }
    this.closeModal();
  }
  closeModal(){
    this.dismissModal(this.selectedData);
    this.gridData=[];
    this.selectedData = [];
    this.selecteData=[];
    this.data = '';
  }
  dismissModal(data){
    this.modal.dismiss({
      'dismissed': true,
      'data':data
    });
  }
  toggle(data:any,event:any, indx:any) {
    let index:any;
    if(data._id != undefined){
      index = this.coreFunctionService.getIndexInArrayById(this.gridData,data._id);
    }else if(this.field.matching_fields_for_grid_selection && this.field.matching_fields_for_grid_selection.length>0 && data){
      this.gridData.forEach((row:any, i:any) => {        
          var validity = true;
          this.field.matching_fields_for_grid_selection.forEach(matchcriteria => {
            if(this.coreFunctionService.getObjectValue(matchcriteria,data) == this.coreFunctionService.getObjectValue(matchcriteria,row)){
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
      this.gridData[index].selected=true;
      this.getSelectedData();
    } else{
      this.gridData[index].selected=false;
    }
  }
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
  checkValidator(){
    // if(this.preSelectedData){
    //   let selectedItem = 0;
    //   this.gridData.forEach(element => {
    //     if(element.selected  && selectedItem == 0){
    //       selectedItem = 1;
    //     }
    //   });
    //   if(selectedItem == 1){
    //     return false;
    //   }else{
    //     return true;
    //   }
    // }
    return false;
  }

  segmentChanged(ev: any) {
    this.selectedTab = ev.target.value;
    // this.selectedTab.emit(ev);
  }
  segmentChangedEmit(selectedTab:any) {
    // this.selectedTab = ev.target.value;
    this.selectedTabAgain.emit(selectedTab);
  }
  // segmentChangedEmit(selectedTab:any) {
  //   // this.selectedTab = ev.target.value;
  //   this.selectedTabAgain.emit(selectedTab);
  // }
  getSelectedData(){
    const selectedData = [];
    if(this.gridData && this.gridData.length > 0){
      this.gridData.forEach(element => {
        if(element && element.selected){
          selectedData.push(element);
        }
      });
      this.gridSelectionResponce.emit(selectedData);
      return selectedData;
    }else{
      return selectedData;
    }
  }
  getFirstCharOfString(char:any){
    return this.coreUtilityService.getFirstCharOfString(char);
  }

}
