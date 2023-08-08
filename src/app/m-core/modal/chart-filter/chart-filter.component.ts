import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoreUtilityService, NotificationService, AppPermissionService, RestService, AppStorageService, AppDataShareService, AppApiService, DownloadService } from '@core/ionic-core';
import * as XLSX from 'xlsx';
import { File } from '@ionic-native/file/ngx';
import { Platform, isPlatform } from '@ionic/angular';
// import { Directory, Filesystem } from '@capacitor/filesystem';
// import { promise } from 'protractor';
// import { writeFile } from "capacitor-blob-writer";
// import * as FileSaver from 'file-saver';
import { DatePipe } from '@angular/common';
import { zonedTimeToUtc, utcToZonedTime, format} from 'date-fns-tz';
import { parseISO } from 'date-fns';
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { ApiService, CommonFunctionService, DataShareService, ChartService } from '@core/web-core';

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
  providers: [File]
})
export class ChartFilterComponent implements OnInit {

  @Input() dashboardItem;
  @Input() selectedIndex;
  @Input() modal;
  @Input() dashletData;
  @Input() filter;
  @Input() staticData;
  @ViewChild('startDate', { static: false }) startDateSelected:ElementRef<any>;  
  @ViewChild('endDate', { static: false }) endDateSelected:ElementRef<any>;
  // @ViewChild('chartFilterModal') public chartFilterModal: ModalDirective;  

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
    public formBuilder: FormBuilder,
    private restService: RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private coreUtilityService:CoreUtilityService,
    private file: File,
    private storageService:AppStorageService,
    private permissionService: AppPermissionService,
    private datePipe: DatePipe,
    private notificationService:NotificationService,
    private chartService:ChartService,
    private appDataShareService: AppDataShareService,
    private commonFunctionService: CommonFunctionService,
    private appApiService: AppApiService,
    private downloadService: DownloadService
  ) {
    this.accessToken = this.storageService.GetIdToken();
    this.staticDataSubscription = this.appDataShareService.staticData.subscribe(data =>{
      if(data && data !=''){
        this.setStaticData(data);
      }
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

  getddnDisplayVal(val:any) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }

  chartHover(e:any){}
  chartClicked(e:any){}
  compareObjects(o1: any, o2: any): boolean {
    return o1._id === o2._id;
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
          crList = this.commonFunctionService.getfilterCrlist(fields,filterData);
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
  getSingleCardFilterValue(field:any,object:any){
    let value = {};
    if (object && object[field.name]) {
      value = object[field.name]
    }
    return value;
  }
  getOptionText(option:any) {
    if (option && option.name) {
      return option.name;
    }else{
      return option;
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
  callTypeaheadData(field:any,objectValue:any){
    this.clearTypeaheadData();
    const field_name = field.field_name;
    const value = this.commonFunctionService.getObjectValue(field_name,objectValue);
    if(value && value != ''){
      const payload = [];
      const params = field.api_params;
      const criteria = field.api_params_criteria;
      payload.push(this.commonFunctionService.getPaylodWithCriteria(params, '', criteria, objectValue));
      this.apiService.GetTypeaheadData(payload);
    }
  }
  clearTypeaheadData() {
    this.apiService.clearTypeaheadData();
  }

  dashletFilter(item:any){
    if(item.package_name == "mongodb_chart"){
      this.setFilterInMongodbChart(item);
    }else{
      this.getDashletData([item]);
    }
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
        let staticModalGroup = this.commonFunctionService.commanApiPayload([],formField,[]);
        if(staticModalGroup.length > 0){  
          this.apiService.getStatiData(staticModalGroup);
        }
      }
      if (forControl) {
        this.dashboardFilter = this.formBuilder.group(forControl);              
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

  dismissModal(item:any){
    this.close(item);
    this.modal?.offsetParent.dismiss({'dismissed': true},'closed');
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
  
  async downloadtomobile(excelBuffer:any, extentionType?:any){ 
    
    const fileExtension = extentionType;
    let file_Type: any;
    let file_prefix: any;
    if(fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg" ){
      file_Type = "image/" + extentionType;
      file_prefix = "Image";
    }else if(fileExtension == "xlsx" || fileExtension == "xls"){
      file_Type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
      file_prefix = "Excel";
    }else if(fileExtension == "pdf"){
      file_Type = "application/" + extentionType;
      file_prefix = "PDF";
    }else{
      file_Type = "application/octet-stream";
      file_prefix = "TEXT";
    }
    const fileName = file_prefix + '_' + new Date().getTime() + "." + fileExtension;
    const excelBlobData:Blob = new Blob([excelBuffer],{type:file_Type});
    
    let readPermission = await this.permissionService.checkAppPermission("READ_EXTERNAL_STORAGE");
    let writePermission = await this.permissionService.checkAppPermission("WRITE_EXTERNAL_STORAGE");

    if(readPermission && writePermission){  

    // === using Write_blob
    // const fileDataBlob = await writeFile({
    //   path: fileName,
    //   directory: Directory.ExternalStorage,
    //   data: excelBlobData
    // }).then(() => {
    //     this.storageService.presentToast(this.dashboardItem.name + "Saved")
    //   }).catch( (error:any) =>{
    //     this.storageService.presentToast(error)
    //   })

    //=== using capacitor filesystem
    // const base64 = await this.convertBlobToBase64(excelBlobData);
    // console.log(base64);
    // Filesystem.writeFile({
    //   path: fileName,
    //   directory: Directory.Documents,
    //   data: <string>base64
    // }).then(() => {
    //     this.storageService.presentToast(fileName + " Saved")
    //   }).catch( (error:any) =>{
    //     if(error && error.message){
    //       this.storageService.presentToast(error.message);
    //     }else{
    //       this.storageService.presentToast(error);
    //     }
    //   })


    // ==========using native file
    
      this.file.checkDir(this.file.externalRootDirectory, "Download").then(() => {

        this.file.writeFile(this.file.externalRootDirectory + '/Download/',fileName,excelBlobData,{replace:true}).then(() => {
          this.storageService.presentToast(fileName + " Saved in Downloads");
        }).catch( (error:any) =>{
          if(error && error.message){
            this.storageService.presentToast(error.message);
          }else{
            this.storageService.presentToast(error);
          }
        })
        
      }).catch( (error:any) =>{
        if(error && error.message == "NOT_FOUND_ERR" || error.message == "PATH_EXISTS_ERR"){
        this.file.createDir(this.file.externalRootDirectory, "Download", true).then(() => {
          
          this.file.writeFile(this.file.externalRootDirectory + "/Download/",fileName,excelBlobData,{replace:true}).then(() => {
            this.storageService.presentToast(fileName + " Saved in Download");
          })

        }).catch( (error:any) =>{
          if(error && error.message){
            this.storageService.presentToast(error.message);
          }else{
            this.storageService.presentToast(error);
          }
        })
        }
      });

    }

    // ======using filesaver
    // FileSaver.saveAs(excelBlobData,fileName);
    // FileSaver.saveAs(excelBlobData,fileName).then(() => {
    //   this.storageService.presentToast(this.dashboardItem.name + "Saved");
    //   // alert("Excel file saved in device");
    // }).catch( (error:any) =>{
    //   if(error && error.message){
    //     this.storageService.presentToast(error.message);
    //   }else{
    //     this.storageService.presentToast(error);
    //   }
    //   // alert(error);
    // })

    
  }

  public async getDownloadPath() {
    if (this.platform.is('android')) {    
      const ReadWritePermission = await this.permissionService.checkAppPermission("READ_EXTERNAL_STORAGE");
      if(ReadWritePermission){
        return this.file.externalRootDirectory + '/Download/';
      }      
    }else{
      return this.file.documentsDirectory;
    }
  }

  // Helper Function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader:FileReader = new FileReader();
    reader.onerror = reject;
    reader.onabort = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

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
  async download(object){
    let chartId = "filter_"+object.chartId;
    let chart = this.createdChartList[chartId];    
    let blobData:any = await this.chartService.getDownloadData(chart,object);
    if(isPlatform('hybrid')){
      this.downloadService.downloadBlobData(blobData.url, blobData.name)
    }else{
      this.chartService.downlodBlobData(blobData.url, blobData.name)
    }
  } 
  close(item:any){
    this.checkGetDashletData = false;
    this.reset(item);
  //  this.chartFilterModal.hide();
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

  checkValidator(){    
    return !this.dashboardFilter.valid;     
  }

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
  checkStartDateValue(){
    if(this.startDateSelected["el"].value){
      this.CheckStartDate=true;
    }else{
      this.notificationService.presentToastOnBottom("Please First select Start Date","danger")
    }
  }
  setStaticData(staticData?:any){
    if (staticData) {
      this.staticData = staticData;
      Object.keys(this.staticData).forEach(key => {        
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      }) 
    }
  }



}
