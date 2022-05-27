import { Component, Input, OnInit } from '@angular/core';
import { CoreUtilityService } from '@core/ionic-core';
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

  cardType:any;
  columnList :any = [];
  data:any={};


  constructor(
    private modalController: ModalController,
    private CommonFunctionService:CoreUtilityService
  ) { }

  ngOnInit() {
    this.onload();
  }
  
  ionViewWillEnter(){
    // this.cardType = this.childCardType;
    // this.columnlistNew = this.Data[0];
  }
  ionViewDidEnter(){}
  ionViewWillLeave(){}  
  ionViewDidLeave(){}

  onload(){
    this.cardType = this.childCardType;
    this.columnList = this.Data['column'];
    this.data = this.Data['value'];
  }  
  getValueForGrid(field, object) {
    return this.CommonFunctionService.getValueForGrid(field, object);
  }
  dismissModal(data){
    this.modal.dismiss({
      'data':data,
      'dismissed': true
    });
  }
  select(){
    this.dismissModal(this.data);
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

}
