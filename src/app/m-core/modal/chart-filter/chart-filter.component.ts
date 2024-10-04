import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NotificationService, AppPermissionService, AppDownloadService, LoaderService, AppShareService } from '@core/ionic-core';
import * as XLSX from 'xlsx';
import { ModalController, Platform, isPlatform } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { utcToZonedTime, format} from 'date-fns-tz';
import { parseISO } from 'date-fns';
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { ApiService, CommonFunctionService, DataShareService, ChartService, StorageService, ApiCallService, FormCreationService } from '@core/web-core';
import { FileOpener } from '@capacitor-community/file-opener';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-chart-filter',
  templateUrl: './chart-filter.component.html',
  styleUrls: ['./chart-filter.component.scss'],
  providers: []
})
export class ChartFilterComponent implements OnInit {

  @Input() dashboardItem;
  @Input() selectedIndex;
  @Input() modal;
  @Input() dashletData;
  @Input() filter;
  @Input() staticData = {};
  @ViewChild('startDate', { static: false }) startDateSelected:ElementRef<any>;  
  @ViewChild('endDate', { static: false }) endDateSelected:ElementRef<any>;
  // @ViewChild('chartFilterModal') public chartFilterModal: ModalDirective;  

  // dashboardItem :any = {};
  //dashletData:any = {};

  dashboardFilter:UntypedFormGroup;

  public chartType:any = {};
  public chartDatasets:any = {};
  public chartLabels:any = {};
  public chartColors:any = {};
  public chartOptions:any = {};
  public chartLegend:any = {};
  public chartTitle:any = {};

  checkGetDashletData:boolean=true;
  //staticData: any = {};
  typeAheadData:any=[];
  showFilter:boolean=false;
  dashlet_call_back: any;
  // staticDataSubscription;
  typeaheadDataSubscription;
  dashletDataSubscription;

  minDate: Date;
  maxDate: Date;

  filename = "ExcelSheet.xlsx";
  tableData;
  tableHead;
  chartjsimg: any;
  userTimeZone:any;
  userLocale:any;
  selectedStartDate:any;
  selectedStartDateasMindate;
  selectedEndDate:any;
  CheckStartDate:boolean=false;
  accessToken:string='';
  createdChartList:any=[];
  staticDataSubscription:any;

  constructor(
    private platform: Platform,
    public formBuilder: UntypedFormBuilder,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private storageService:StorageService,
    private datePipe: DatePipe,
    private notificationService:NotificationService,
    private commonFunctionService: CommonFunctionService,
    private appDownloadService: AppDownloadService,
    private modalController: ModalController,
    private apiCallService: ApiCallService,
    private formCreationService: FormCreationService,
    private loaderService: LoaderService,
    private appShareService: AppShareService
  ) {
    this.accessToken = this.storageService.GetIdToken();
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
        this.setStaticData(data);
    })
    this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data =>{
      this.setTypeaheadData(data);
    })
    this.dashletDataSubscription = this.dataShareService.dashletData.subscribe(data =>{
      this.setDashLetData(data);
    }) 
    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date(currentYear + 1, 11, 31);
    this.setminmaxDate();
  }

  // Angular LifeCycle Function Handling Start --------------------
  ngOnInit() {
    this.showModal(this.dashboardItem);
  }
  ngOnDestroy(){
    this.checkGetDashletData = false;
    // if(this.staticDataSubscription){
    //   this.staticDataSubscription.unsubscribe();
    // }
    if(this.dashletDataSubscription){
      this.dashletDataSubscription.unsubscribe();
    }
    if(this.typeaheadDataSubscription){
      this.typeaheadDataSubscription.unsubscribe();
    }
  }
  // Angular LifeCycle Function Handling End --------------------

  // Initial Function Handling Start ---------------
  setminmaxDate(){
    let minDateFromToday:any;
    let maxDateFromToday:any;
    minDateFromToday = this.datePipe.transform(this.minDate, "yyyy-MM-dd") + "T00:00:00";
    maxDateFromToday = this.datePipe.transform(this.maxDate, "yyyy-MM-dd") + "T23:59:59";
    if(this.platform.is('hybrid')){
      let getToday: any  = (new Date()).toISOString();
      getToday = utcToZonedTime(getToday, this.userTimeZone);
      getToday = this.datePipe.transform(getToday, "yyyy-MM-ddThh:mm:ss");
      this.minDate = minDateFromToday;
      this.maxDate = maxDateFromToday;
    }else{
      this.minDate = minDateFromToday;
      this.maxDate = maxDateFromToday;
    }
  }
  showModal(object:any){
    if(this.dashboardItem){
      // this.dashboardItem = object.dashboardItem;
      // this.dashletData = object.dashletData;
      this.checkGetDashletData = true; 
      if(this.dashboardItem.call_back_field){
        this.dashlet_call_back = this.dashboardItem.call_back_field;
      } 
      if(this.filter){
        this.showFilter = true;
        this.setFilterForm(this.dashboardItem);
      }else{
        this.showFilter = false;
      }   
      if(this.dashletData && this.dashletData != ''){
        this.setDashLetData(this.dashletData);
      }
      // this.chartFilterModal.show();
      if(this.filter){
        this.dashboardFilter.reset();
      }
      if(this.dashboardItem.package_name == "mongodb_chart"){
        setTimeout(() => {
          this.populateMongodbChart(this.dashboardItem);
        }, 100);
      }
    } 
  }
  // Initial Function Handling End -------------

  // Subscriber Function Handling Start -----------------------
  setStaticData(staticDatas){
    if(Object.keys(staticDatas).length > 0) {
      Object.keys(staticDatas).forEach(key => {  
        let staticData = {};
        staticData[key] = staticDatas[key];  
        if(key && key != 'null' && key != 'FORM_GROUP' && key != 'CHILD_OBJECT' && key != 'COMPLETE_OBJECT' && key != 'FORM_GROUP_FIELDS'){
          if(staticData[key]) { 
            this.staticData[key] = JSON.parse(JSON.stringify(staticData[key]));
          }
        } 
      });
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
  setTypeaheadData(typeAheadData:any){
    if (typeAheadData && typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }
  // Subscriber Function Handling End -----------------------

  // Click Function Handling Start -----------------------
  dismissModal(item:any){
    this.close(item);
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({'dismissed': true},'closed');
    }else{        
      this.modalController.dismiss({'dismissed': true},'closed',);
    }
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
    this.createExcel(list)
  }
  dashletFilter(item:any){
    if(item.package_name == "mongodb_chart"){
      this.setFilterInMongodbChart(item);
    }else{
      this.getDashletData([item]);
    }
  }
  reset(item:any){
    if(this.dashboardFilter){
      this.dashboardFilter.reset();
    }    
    if(this.showFilter){      
      if(this.dashboardItem.package_name == "mongodb_chart"){
        this.setFilterInMongodbChart(item);
      }else{
        this.getDashletData([item]);
      }
    }    
  }
  updateData(event:any, field:any) {
    if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13 || event.keyCode == 27 || event.keyCode == 9){
      return false;
    }
    let objectValue:any = this.dashboardFilter.getRawValue();
    if(objectValue[field.field_name]){
      this.callTypeaheadData(field,objectValue);
    }else{
      objectValue[field.field_name] = event.target.value
      this.callTypeaheadData(field,objectValue);
    }
  }
  createExcel(list:any){    
    if(this.platform.is('hybrid')){
      if(this.platform.is('android')){
        const ws:XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);
        const wb:XLSX.WorkBook = {
          SheetNames:['excelData'],
          Sheets:{
            'excelData':ws
          }
        };
        const excelBuffer:any = XLSX.write(wb,{
          bookType:'xlsx',
          type:'array'
        });
        // console.log(excelBuffer);
        const fileExtension = "xlsx";
        this.downloadtomobile(excelBuffer, fileExtension);
      }
    }else{
      const ws:XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);
      const wb:XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Sheet1');
      XLSX.writeFile(wb,this.dashboardItem.name + '.xlsx');
    }
  }
  async canvasimg() {
    var canvas = document.getElementById('chartjs') as HTMLCanvasElement;
    this.chartjsimg = canvas.toDataURL('image/png');
    if(this.platform.is("android")){
      const b64Data = this.chartjsimg.split(',').pop();
      const [,type] = this.chartjsimg.split(';')[0].split('/');
      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      this.downloadtomobile(byteArray, type);
    }
  }
  dateonChange(e:any,fieldName){
    if(e.detail.value && e.target.id == "startDate"){
      this.selectedStartDateasMindate = this.datePipe.transform(e.detail.value, "yyyy-MM-dd") + "T00:00:00";
      this.CheckStartDate=true;
      const date = format(parseISO(e.detail.value), 'PP');
      this.dashboardFilter.get(fieldName).get("start").setValue(date)
      this.dashboardFilter.get(fieldName).get("end").setValue('');

    }else if(e.detail.value && e.target.id == "endDate"){
      if(this.CheckStartDate){
        const date = format(parseISO(e.detail.value), 'PP');
        this.dashboardFilter.get(fieldName).get("end").setValue(date)
      }else{
        this.dashboardFilter.get(fieldName).get("end").setValue('');
        this.notificationService.presentToastOnBottom("Please First select Start Date","danger")
      }
    }else{
      this.CheckStartDate= false;
    }
  }
  // Click Function Handling End -----------------------

  // Dependency Function Handling Start ------------
  populateMongodbChart(chart){
    if(this.accessToken != "" && this.accessToken != null){
      const sdk = new ChartsEmbedSDK({
        baseUrl: chart.chartUrl, // Optional: ~REPLACE~ with the Base URL from your Embed Chart dialog
        getUserToken: () => this.accessToken
      });
      if(chart && chart.chartId){        
        const id = "filter_"+chart.chartId;
        const idRef = document.getElementById(id);
        let height = "50vh"
        if(this.filter){
          height = "50vh";
        }else{
          height = "90vh";
        }
        if(idRef){
          let cretedChart = sdk.createChart({
            chartId: chart.chartId, // Optional: ~REPLACE~ with the Chart ID from your Embed Chart dialog
            height: height
          });
          this.createdChartList[id] = cretedChart;
          cretedChart
          .render(idRef)
          .catch(() => 
          console.log('Chart failed to initialise')
          //window.alert('Chart failed to initialise')
          );
        }        
      }
    }
  }
  getDashletData(elements:any){
    if(elements && elements.length > 0){
      let payloads = [];
      let value = {};
      if(this.showFilter){
        value = this.dashboardFilter.getRawValue();
      }
      elements.forEach(element => {
        const fields = element.fields;        
        //const filterData = this.getSingleCardFilterValue(element,value);
        const filterData = {
          'value':value
        };
        let crList = [];
        if(fields && fields.length > 0){
          crList = this.apiCallService.getfilterCrlist(fields,filterData);
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
  getddnDisplayVal(val:any) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  getSingleCardFilterValue(field:any,object:any){
    let value = {};
    if (object && object[field.name]) {
      value = object[field.name]
    }
    return value;
  }
  callTypeaheadData(field:any,objectValue:any){
    this.clearTypeaheadData();
    const field_name = field.field_name;
    const value = this.commonFunctionService.getObjectValue(field_name,objectValue);
    if(value && value != ''){
      const payload = [];
      const params = field.api_params;
      const criteria = field.api_params_criteria;
      payload.push(this.apiCallService.getPaylodWithCriteria(params, '', criteria, objectValue));
      this.apiService.GetTypeaheadData(payload);
    }
  }
  clearTypeaheadData() {
    this.apiService.clearTypeaheadData();
  }
  setFilterInMongodbChart(chart){
    let id = "filter_"+chart.chartId;
    let chartObject = this.createdChartList[id];
    let fields = chart.fields && chart.fields.length > 0 ? chart.fields : [];
    let formValue = this.dashboardFilter.getRawValue();
    let filterValue = this.getMongochartFilterValue(fields,formValue);
    let filterData = this.getMongodbFilterObject(filterValue);
    chartObject.setFilter(filterData);
  }
  getMongochartFilterValue(fields,object){
    let modifyObject = {};
    let objectCopy = JSON.parse(JSON.stringify(object));
    if(fields && fields.length > 0 && Object.keys(objectCopy).length > 0){
      fields.forEach(field => {
        let key = field.field_name;
        if(object && object[key] && object[key] != ''){
          let newDateObjec = {};
          let date = new Date();
          switch (field.type) {
            case 'typeahead':            
              if(objectCopy[key] && typeof objectCopy[key] == 'object'){
                modifyObject[key+'._id'] = objectCopy[key]._id;
              }            
              break;
            case 'date':
              let formateDate = this.datePipe.transform(objectCopy[key], 'yyyy-MM-dd');
              let selectedDate = new Date(formateDate);
              selectedDate.setTime(selectedDate.getTime()+(24*3600000));
              newDateObjec = {};
              date = new Date(formateDate);
              newDateObjec['$gt'] = date;
              newDateObjec['$lte'] = selectedDate;
              modifyObject[key] =  newDateObjec;
              break;
            case 'daterange':
              if(object[key].start && object[key].end && object[key].start != '' && object[key].end != ''){
                let startDate = this.datePipe.transform(object[key].start,'yyyy-MM-dd');
                let endDate = this.datePipe.transform(object[key].end,'yyyy-MM-dd');
                let modifyEndDate = new Date(endDate);
                modifyEndDate.setTime(modifyEndDate.getTime()+(24*3600000));
                newDateObjec = {};
                newDateObjec['$gt'] = new Date(startDate);
                newDateObjec['$lte'] = new Date(modifyEndDate);
                modifyObject[key] =  newDateObjec;
              }
              break;
            default:
              modifyObject[key] = objectCopy[key];
              break;
          }
        }
      });
    }
    return modifyObject;
  }
  getMongodbFilterObject(data){
    let object = {};
    if(Object.keys(data).length > 0){
      Object.keys(data).forEach(key => {
        if(data[key] && data[key] != ''){
          object[key] = data[key];
        }
      });
    }
    return object;
  }
  setFilterForm(dashlet:any){    
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
              this.formCreationService.createFormControl(forControl, field, '', "text")
                break; 
            case "daterange":
              const date_range = {};
              let list_of_dates = [
                {field_name : 'start'},
                {field_name : 'end'}
              ]
              if (list_of_dates.length > 0) {
                list_of_dates.forEach((data) => {                  
                  this.formCreationService.createFormControl(date_range, data, '', "text")
                });
              }
              this.formCreationService.createFormControl(forControl, field, date_range, "group")                                    
              break; 
                                      
            default:
              this.formCreationService.createFormControl(forControl, field, '', "text");
              break;
          }   
        });
      } 
      if(formField.length > 0){
        let staticModalGroup = this.apiCallService.commanApiPayload([],formField,[]);
        if(staticModalGroup.length > 0){  
          this.apiService.getStatiData(staticModalGroup);
        }
      }
      if (forControl) {
        this.dashboardFilter = this.formBuilder.group(forControl);              
      }
    } 
  }
  async downloadtomobile(excelBuffer:any, extentionType?:any){    
    const fileExtension = extentionType;
    let response:any = this.appDownloadService.getBlobTypeFromExtn(extentionType);
    const fileName = response?.filePrefix + '_' + new Date().getTime() + "." + fileExtension;
    const excelBlobData:Blob = new Blob([excelBuffer],{type:response?.mimeType});
    let downloadResponse:any =  this.appDownloadService.downloadAnyBlobData(excelBlobData,fileName,true);
    this.downloadResponseHandler(downloadResponse);   
  }
  async downloadResponseHandler(response:any){
    if(response?.haspermission && response?.status){
      await this.loaderService.hideLoader();
      if(response?.openfile && !response?.sharefile){
        const confirm:any = await this.notificationService.confirmAlert('Open file !',response.filename + " downloaded into " + response.directoryname.toLowerCase(), "Open", "Dismiss");
        if(response?.fileuri && confirm == "confirm"){
          FileOpener.open({filePath:response.fileuri, contentType:response?.mimetype}).then( res => {
            console.log("File Opened");
          }).catch((e)=>{
            console.error("File Opening error ", JSON.stringify(e));
            this.notificationService.presentToastOnBottom("No app found to open the file.");
          })
        }else{
          this.notificationService.presentToastOnBottom("File "+ response.filename + " is not availabe.")
        }
      }else if(!response?.openfile && response?.sharefile){
        const confirm:any = await this.notificationService.confirmAlert('Share file !',response.filename + " downloaded into " + response.directoryname.toLowerCase(), "Share", "Dismiss");
        if(response?.fileuri && confirm == "confirm"){
          const canShare = await this.appShareService.checkDeviceCanShare();
          if(canShare){
            let shareOption = {
              title: response?.filename ? response.filename : "Share",
              text: "Here is the file you requested.",
              url: response?.fileuri,
              dialogTitle: "Share " + response?.filename
            }
            this.appShareService.share(shareOption);
          }
        }else{
          this.notificationService.presentToastOnBottom("File "+ response.filename + " is not availabe.")
        }
      }else{
        this.notificationService.presentToastOnBottom("Downloaded into " + response.directoryname.toLowerCase(),"success")
      }
    }else{
      this.notificationService.presentToastOnBottom('Please allow media access in App setting, to Download')
    }
  } 
  close(item:any){
    this.checkGetDashletData = false;
    this.reset(item);
  //  this.chartFilterModal.hide();
  }

  
  
  // Dependency Function Handling End ------------
  
  // Not in Use functions Start----------------
  chartHover(e:any){}
  chartClicked(e:any){}
  // Not in Use functions End----------------

}
