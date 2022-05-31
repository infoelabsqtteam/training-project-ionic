import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService, CoreUtilityService, DataShareService, RestService } from '@core/ionic-core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-chart-filter',
  templateUrl: './chart-filter.component.html',
  styleUrls: ['./chart-filter.component.scss'],
})
export class ChartFilterComponent implements OnInit {

  @Input() dashboardItem;
  @Input() selectedIndex;
  @Input() modal;
  @Input() dashletData;
  @Input() filter;
  @Input() staticData;

  // dashboardItem :any = {};
  //dashletData:any = {};

  dashboardFilter:FormGroup;

  public chartType:any = {};
  public chartDatasets:any = {};
  public chartLabels:any = {};
  public chartColors:any = {};
  public chartOptions:any = {};
  public chartLegend:any = {};
  public chartTitle:any = {};

  checkGetDashletData:boolean=true;
  //staticData: any = {};
  copyStaticData:any={};
  typeAheadData:any=[];
  showFilter:boolean=false;
  dashlet_call_back: any;
  // staticDataSubscription;
  // dashletDataSubscription;
  // typeaheadDataSubscription;
  typeaheadDataSubscription;

  minDate: Date;
  maxDate: Date;

  filename = "ExcelSheet.xlsx";
  tableData;
  tableHead;

  constructor(
    public formBuilder: FormBuilder,
    private restService: RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private commonFunctionService:CoreUtilityService,
  ) {
    this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data =>{
      this.setTypeaheadData(data);
    })
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
  }

  ngOnInit() {
    this.dashlet_call_back = this.dashboardItem.call_back_field;
    this.setDashLetData(this.dashletData);
    this.showModal(this.dashboardItem);
    this.dashboardFilter.reset();
  }


  ngOnDestroy(){
    this.checkGetDashletData = false;
    // if(this.staticDataSubscription){
    //   this.staticDataSubscription.unsubscribe();
    // }
    // if(this.dashletDataSubscription){
    //   this.dashletDataSubscription.unsubscribe();
    // }
    if(this.typeaheadDataSubscription){
      this.typeaheadDataSubscription.unsubscribe();
    }
  }


  setDashLetData(dashletData:any){
    if (dashletData) {
      let dashletValue = {};
      if(this.dashboardItem && this.dashboardItem.call_back_field && dashletData[this.dashboardItem.call_back_field]){
        dashletValue[this.dashboardItem.call_back_field] = dashletData[this.dashboardItem.call_back_field];
        Object.keys(dashletValue).forEach(key => { 
          this.chartDatasets[key] = JSON.parse(JSON.stringify(dashletValue[key]['dataSets']));  
          this.chartLabels[key] = JSON.parse(JSON.stringify(dashletValue[key]['label']));
          this.chartType[key]=JSON.parse(JSON.stringify(dashletValue[key]['type']));
          this.chartColors[key]=JSON.parse(JSON.stringify(dashletValue[key]['colors']));
          this.chartLegend[key]=JSON.parse(JSON.stringify(dashletValue[key]['legend']));
          this.chartOptions[key]=JSON.parse(JSON.stringify(dashletValue[key]['options']));
          this.tableData = this.chartDatasets[key]; 
          this.tableHead = this.chartLabels[key];
          if(dashletValue[key]['title']){
            this.chartTitle[key]=JSON.parse(JSON.stringify(dashletValue[key]['title']));
          }        
        })
      }
    }
  }

  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }

  chartHover(e){}
  chartClicked(e){}
  compareObjects(o1: any, o2: any): boolean {
    return o1._id === o2._id;
  }

  getDashletData(elements){
    if(elements && elements.length > 0){
      let payloads = [];
      let value = {};
      if(this.showFilter){
        value = this.dashboardFilter.getRawValue();
      }
      elements.forEach(element => {
        const fields = element.fields;        
        //const filterData = this.getSingleCardFilterValue(element,value);
        const filterData = 
        {
          'value':value
       };
        let crList = [];
        if(fields && fields.length > 0){
          crList = this.restService.getfilterCrlist(fields,filterData);
        }        
        let object = {}

        const data = {
          "data": object,
          "crList":crList
        }
        const payload={
          "_id" : element._id,
          "data" : data
        }
        payloads.push(payload);
      });
      if(payloads && payloads.length > 0 && payloads.length == elements.length){
        const key = elements[0].call_back_field;
        this.dataShareService.resetDashletDataByKey(key);
        this.apiService.GetDashletData(payloads);
      }
    }
  }
  getSingleCardFilterValue(field,object){
    let value = {};
    if (object && object[field.name]) {
      value = object[field.name]
    }
    return value;
  }
  getOptionText(option) {
    if (option && option.name) {
      return option.name;
    }else{
      return option;
    }
  }

  updateData(event, field) {
    if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13 || event.keyCode == 27 || event.keyCode == 9){
      return false;
    }    
    this.callTypeaheadData(field,this.dashboardFilter.getRawValue()); 
  }
  callTypeaheadData(field,objectValue){
    this.clearTypeaheadData();   
    const payload = [];
    const params = field.api_params;
    const criteria = field.api_params_criteria;
    payload.push(this.restService.getPaylodWithCriteria(params, '', criteria, objectValue));
    this.apiService.GetTypeaheadData(payload);    
  }
  clearTypeaheadData() {
    this.apiService.clearTypeaheadData();
  }




  dashletFilter(item){
    this.getDashletData([item]);
  }

  setFilterForm(dashlet){    
    if(this.checkGetDashletData && dashlet._id && dashlet._id != ''){
      this.checkGetDashletData = false;
      let forControl = {};
      let formField = [];      
      if(dashlet.fields && dashlet.fields.length > 0){
        dashlet.fields.forEach(field => {                    
          formField.push(field);
          switch(field.type){ 
            case "date":
              field['minDate'] = this.minDate
              field['maxDate'] = this.maxDate;
              this.commonFunctionService.createFormControl(forControl, field, '', "text")
                break; 
            case "daterange":
              const date_range = {};
              let list_of_dates = [
                {field_name : 'start'},
                {field_name : 'end'}
              ]
              if (list_of_dates.length > 0) {
                list_of_dates.forEach((data) => {                  
                  this.commonFunctionService.createFormControl(date_range, data, '', "text")
                });
              }
              this.commonFunctionService.createFormControl(forControl, field, date_range, "group")                                    
              break; 
                                      
            default:
              this.commonFunctionService.createFormControl(forControl, field, '', "text");
              break;
          }   
        });
      } 
      if(formField.length > 0){
        let staticModalGroup = this.restService.commanApiPayload([],formField,[]);
        if(staticModalGroup.length > 0){  
          this.apiService.getStatiData(staticModalGroup);
        }
      }
      if (forControl) {
        this.dashboardFilter = this.formBuilder.group(forControl);              
      }
    } 
  }


  setTypeaheadData(typeAheadData){
    if (typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }



  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

  exportexcel():void {
    let list = [];
    for (let index = 0; index < this.tableData.length; index++) {
      let row = this.tableData[index];
      const element = {};
      for (let j = 0; j < row.length; j++) {
        let col = this.tableHead[j];
        element[col] = row[j];
      }
      list.push(element);
    }
    const ws:XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);
    const wb:XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Sheet1');
    XLSX.writeFile(wb,this.filename);
  }

  chartjsimg: any;
  canvasimg() {
    var canvas = document.getElementById('chartjs') as HTMLCanvasElement;
    this.chartjsimg = canvas.toDataURL('image/png');
  }





  showModal(object:any){
    if(this.dashboardItem){
      this.dashboardItem = this.dashboardItem;
      this.dashletData = this.dashletData;
      this.checkGetDashletData = true;   
      if(this.filter){
        this.showFilter = true;
        this.setFilterForm(this.dashboardItem);
      }else{
        this.showFilter = false;
      }      
      this.setDashLetData(this.dashletData);
      //this.chartFilterModal.show();
      this.dashboardFilter.reset();
    }    
    
  }
  close(item){
    this.checkGetDashletData = false;
    this.reset(item);
   // this.chartFilterModal.hide();
  }

  reset(item){
    if(this.showFilter){
      this.dashboardFilter.reset();
      this.getDashletData([item]);
    }    
  }

  checkValidator(){    
    return !this.dashboardFilter.valid;     
  }






}
