import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from '@core/ionic-core';
import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo, GalleryImageOptions, GalleryPhoto, GalleryPhotos} from '@capacitor/camera';
import { ApiService, CommonFunctionService, DataShareService, LimsCalculationsService, CoreFunctionService, StorageService } from '@core/web-core';
import { DatePipe } from '@angular/common';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-grid-selection-detail-modal',
  templateUrl: './grid-selection-detail-modal.component.html',
  styleUrls: ['./grid-selection-detail-modal.component.scss'],
})
export class GridSelectionDetailModalComponent implements OnInit {
  
  @Input() childCardType: any;
  @Input() Data: any;
  @Input() index: number;
  @Input() modal: any;
  @Input() formInfo:any;
  @ViewChild('chipsInput',{ read: ElementRef,static: false }) chipsInput: ElementRef<HTMLInputElement>;
  @ViewChild('typeheadchips',{read:ElementRef}) typeheadchips: ElementRef<HTMLInputElement>;

  cardType:any;
  columnList :any = [];
  data:any={};
  gridSelctionTitle:any;
  gridselectionverticalbutton:any;
  selectedTab:string = "new";
  staticData: any = {};
  copyStaticData:any={};
  staticDataSubscription:any;
  addedDataInList: any;
  typeaheadDataSubscription:any;
  typeAheadData: any;
  chips:any;
  readonly:boolean = false;
  griddatasaved:boolean;
  chipsData:any;
  datasave:boolean;
  field:any = {};
  typeaheadObjectWithtext:any;
  userInputChipsData:any;
  alreadyAdded:boolean;
  toastMsg:string;
  grid_row_selection: boolean = false;
  action_button_SaveupdateData = false;
  grid_row_refresh_icon: boolean = false;
  // below ion-select changes 
  customAlertOptions:object = {
    backdropDismiss: false,
    translucent: true
  };
  ionSelectInterface:string = 'alert';
  //  Ion-select changes end

  constructor(
    private modalController: ModalController,
    private dataShareService: DataShareService,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private coreFunctionService: CoreFunctionService,
    private commonFunctionService: CommonFunctionService,
    private limsCalculationsService: LimsCalculationsService,
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService,
    private plt: Platform,
  ) { 
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })
    this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data => {
      this.setTypeaheadData(data);
    })
  }

  ngOnInit() {
    this.onload();
  }
  
  ionViewWillEnter(){
    this.setTopHeaderTitle();
    this.updateModeRejectedGridReadOnly();
  }
  ionViewDidEnter(){}
  ionViewWillLeave(){}  
  ionViewDidLeave(){}
  ngOnDestroy() {
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
    if(this.typeaheadDataSubscription){
      this.typeaheadDataSubscription.unsubscribe();
    }
    this.resetVariables();    
  }
  onload(){
    this.cardType = this.childCardType;
    if(this.Data && this.Data['column'] && this.Data['column'].length > 0){
      this.showModal(this.Data);
      this.alreadyAdded  = this.Data['alreadyAdded'];      
    }else{
      // this.notificationService.presentToastOnMiddle("Grid Columns are not available In This Field.","danger");
    }
    // this.getStaticDataWithDependentData();
  }
  setTopHeaderTitle(){
    if(this.formInfo){
      if(this.formInfo.name !=""){
        this.gridSelctionTitle = this.formInfo.name
      }else if(this.data && this.data.plainCustomerName && this.data.plainCustomerName !='' && this.data.plainCustomerName != null){
      this.gridSelctionTitle = this.data.plainCustomerName;
      this.gridselectionverticalbutton = this.formInfo.InlineformGridSelection;
      }else if(this.field && this.field.label && this.field.label !='' && this.field.label != null){
        this.gridSelctionTitle = this.field.label;
        this.gridselectionverticalbutton = this.formInfo.InlineformGridSelection;
      }
    }
  }
  showModal(alert) {
    // this.selecteData = [];
    // this.selecteData = alert.selectedData;
    this.field = alert.field;
    let parentObject:any={};
    if (alert.value) {
      this.data = alert.value;
    }
    if (alert.parentObject) {
      parentObject = alert.parentObject;
    }
    // if (alert.field.onchange_api_params == "" || alert.field.onchange_api_params == null) {
    //   this.gridData = JSON.parse(JSON.stringify(alert.selectedData));
    // }
    // else {
    //   this.setGridData = true;
    //   this.gridData = [];
    // }
    if (this.field.gridColumns && this.field.gridColumns.length > 0) {
      let gridColumns = this.commonFunctionService.updateFieldInList('display',this.field.gridColumns);
      gridColumns.forEach(field => {
        if (this.coreFunctionService.isNotBlank(field.show_if)) {
          if (!this.commonFunctionService.showIf(field, parentObject)) {
            field['display'] = false;
          } else {
            field['display'] = true;
          }
        } else {
          field['display'] = true;
        }
        if(field['field_class']){
          field['field_class'] = field['field_class'].trim();
        }
      });
      this.columnList = gridColumns;
    } else {
      this.notificationService.presentToastOnMiddle("Grid Columns are not available In This Field.","danger")
    }
    if (this.field && this.field.grid_row_selection) {
      this.grid_row_selection = true;
    } else {
      this.grid_row_selection = false;
    }
    if (this.field && this.field.grid_row_refresh_icon) {
      this.grid_row_refresh_icon = true;
    } else {
      this.grid_row_refresh_icon = false;
    }
    if(this.field && this.field.is_disabled){
      this.readonly = this.field.is_disabled;
    } 

    //For dropdown data in grid selection
    this.getStaticDataWithDependentData()

  }
  async updateModeRejectedGridReadOnly(){
    let msg = ""
    let checkRowDisabledIf = await !this.checkRowDisabledIf(this.field,this.data)
    if(checkRowDisabledIf){
      if(this.data && this.data.approvedStatus == "Approved" || this.data.approvedStatus == "Rejected"){
        this.readonly = true;
        msg = "This record already "+this.data.approvedStatus;
      }
    }else{
      if(this.data && this.data.rejectedCustomers && this.data.add_new_enabled){
        this.readonly = true;
        msg = "This record already rejected";        
      }
    }
    if(msg !==""){
      this.notificationService.presentToastOnBottom(msg);
    }
    if(!this.grid_row_selection && !this.field.add_new_enabled && !this.readonly) {
      this.action_button_SaveupdateData = true;
    }else {
      this.action_button_SaveupdateData = false;
    }
  }
  checkRowDisabledIf(field,data){
    const condition = field.disableRowIf;
    if(condition){
      return !this.commonFunctionService.checkDisableRowIf(condition,data);
    }
    return true;    
  }
  getStaticDataWithDependentData(){
    const staticModal = []
    let staticModalGroup = this.commonFunctionService.commanApiPayload([],this.columnList,[],this.data);
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
    return this.commonFunctionService.getValueForGrid(field, object);
  }
  closeModal(data?:any,remove?:any){
    this.data = '';
    this.dataShareService.setIsGridSelectionOpenOrNot(true);
    this.dismissModal();
  }
  dismissModal(data?:any,remove?:any){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
        'data':data,
        'dismissed': true,
        'remove':remove
      });
    }else{        
      this.modalController.dismiss({
        'data':data,
        'dismissed': true,
        'remove':remove
      },);
    }
  }
  async select(){
    if(this.selectGridData(true)){
      if(this.alreadyAdded){
        // this.notificationService.presentToastOnBottom("Can't perform this action because this record already added");
        this.dismissModal(this.data,false);
      }else{
        // if(this.checkValidator()){
          this.notificationService.presentToastOnBottom("Record selected");
          this.dismissModal(this.data,false);
        // }
      }
    }
  }
  remove(){
    if(!this.alreadyAdded){
      this.notificationService.presentToastOnBottom("Can't perform this action because this record not selected");
    }else{
      this.notificationService.presentToastOnBottom("Record removed");
      this.dismissModal(this.data,true);
    }
  }

  isDisable(field, object) {
    const updateMode = false;
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
      return this.commonFunctionService.isDisable(field.etc_fields, updateMode, object);
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
        if(this.commonFunctionService.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  calculateNetAmount(data, fieldName, index:number){
    this.limsCalculationsService.calculateNetAmount(data, fieldName, fieldName["grid_cell_function"]);
  }
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
  // getddnDisplayVal(val) {
  //   return this.commonFunctionService.getddnDisplayVal(val);
  // }
  searchTypeaheadData(field, currentObject,chipsInputValue) {
    this.typeaheadObjectWithtext = currentObject;
    this.addedDataInList = this.typeaheadObjectWithtext[field.field_name];
    this.typeaheadObjectWithtext[field.field_name] = chipsInputValue.target.value;
    let call_back_field = '';
    let criteria = [];
    const staticModal = []
    if (field.call_back_field && field.call_back_field != '') {
      call_back_field = field.call_back_field;
    }
    if(field.api_params_criteria && field.api_params_criteria != ''){
      criteria =  field.api_params_criteria;
    }
    let staticModalGroup = this.commonFunctionService.getPaylodWithCriteria(field.api_params, call_back_field, criteria, this.typeaheadObjectWithtext ? this.typeaheadObjectWithtext : {});
    staticModal.push(staticModalGroup);
    this.apiService.GetTypeaheadData(staticModal);

    this.typeaheadObjectWithtext[field.field_name] = this.addedDataInList;
  }
  setTypeaheadData(typeAheadData:any) {
    if (typeAheadData && typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }
  setValue(option:any,field,data,index,chipsInput,eventFire?:any) {
    let inputSelectValue:any;
    const alreadyAddedList = data[field.field_name];
    if(option != null && option != ""){
      if ((option.keyCode == 13 || option.keyCode == 9) || this.coreFunctionService.isNotBlank(option.target.value)){
        inputSelectValue = option.target.value;
      }else if(this.coreFunctionService.isNotBlank(option.label)){
        inputSelectValue = option.label;
      }else if(typeof option == 'string' || this.coreFunctionService.isNotBlank(option['_id'])){
        inputSelectValue = option
      }
    }
    if(inputSelectValue){
      if(this.commonFunctionService.checkDataAlreadyAddedInListOrNot("_id",option,alreadyAddedList)){
        if(typeof option == 'string'){
          this.notificationService.presentToastOnBottom( option + ' Already Added');
        }else{
          this.notificationService.presentToastOnBottom( option.name + ' Already Added');
        }
      }else{
        if(data[field.field_name] == null) data[field.field_name] = [];
        data[field.field_name].push(inputSelectValue); 
      }
      if(option?.target?.value){
        option.target.value = '';
      }      
      if(chipsInput && chipsInput.element && this.chipsInput.nativeElement){
        this.chipsInput.nativeElement.value = '';
        let ngInput = <HTMLInputElement>document.getElementById(field._id+'_'+field.field_name);
        ngInput.value = '';
      }
      if(this.userInputChipsData.label ){
        this.userInputChipsData.label = "";        
      }
      this.userInputChipsData = "";
      this.chipsData = {};
      this.typeAheadData = [];
    }
    //   if(option != null && option != "" && option.key !=""){
    //   if ((option.keyCode == 13 || option.keyCode == 9) && option.target.value !="" && option.target.value != undefined){
    //     if(this.commonFunctionService.checkDataAlreadyAddedInListOrNot("_id",option.target.value,alreadyAddedList)){
    //       this.notificationService.presentToastOnBottom( option.target.value + ' Already Added');
    //     }else{
    //       if(data[field.field_name] == null) {
    //         data[field.field_name] = [];
    //       }else{
    //         data[field.field_name].push(option.target.value);
    //         option.target.value = "";
    //       }
    //     }
    //   // option.target.value = "";
    //   }else if(option.target && option.target.value ==""){
    //     this.notificationService.presentToastOnBottom( "Please enter any " + field.label);
    //   }else{
    //     if(option !=""){
    //       if(this.commonFunctionService.checkDataAlreadyAddedInListOrNot("_id",option,alreadyAddedList)){
    //         this.notificationService.presentToastOnBottom( option.name + ' Already Added');
    //       }else{
    //         if(data[field.field_name] == null) data[field.field_name] = [];
    //         data[field.field_name].push(option); 
    //       }
    //       this.userInputChipsData = "";
    //       this.chipsData = {};
    //       this.typeAheadData = [];
    //     }
    //   }
    // }
  }
  // custmizedFormValueData(data, fieldName) {
  //   if (data && data[fieldName.field_name] && data[fieldName.field_name].length > 0) {
  //     return data[fieldName.field_name];
  //   }
  // }
  removeItem(data:any,column:any,i:number){
    this.commonFunctionService.removeItem(data,column,i);
  }
  resetVariables(){
    this.typeAheadData = [];
  }
  fieldButtonLabel(field){
    if(field && field.grid_selection_button_label != null && field.grid_selection_button_label != ''){
      return field.grid_selection_button_label;
    }else{
      return field.label;
    }
  }
  selectionFocus(tableField:any){
    let selectionmsg:string = '';
    let backdropdismiss:boolean = false;
    if(tableField?.interface && tableField?.interface != 'alert' && !tableField?.multi_select){
      this.ionSelectInterface = tableField.interface;
      backdropdismiss = true;
    }
    if(tableField?.multi_select){
      selectionmsg = 'Choose multiple';
    } else{
      selectionmsg = 'Choose only one';
    }
    this.customAlertOptions = {
      message: selectionmsg,
      backdropDismiss: backdropdismiss,
      translucent: true,
    };
  }
  clearDropdownField(e:any,field:any){
    if(e?.target.value || e?.target?.value.name){      
      e.target.value = "";
    }
    this.setValue(e,field,'','','',"clearDropDown");
  }
  selectGridData(addOrupdate?:boolean) {
    // this.selectedData = [];
    // if (this.grid_row_selection == false) {
    //   this.selectedData = [...this.gridData];
    // }
    // else {
    //   this.gridData.forEach(row => {
    //     if (row.selected) {
    //       this.selectedData.push(row);
    //     }
    //   });
    // }
    let check = 0;
    let validation = {
      'msg' : ''
    }
    if(this.field && this.field.mendetory_fields && this.field.mendetory_fields.length > 0){            
      // if(this.selectedData && this.selectedData.length > 0){
        this.field.mendetory_fields.forEach((mField:any) => {
          const fieldName = mField.field_name;
          if(mField.display){
          // this.selectedData.forEach((row,i) => {
            let checkDisable = this.isDisable(mField,this.data);
            if(this.data && !checkDisable && (this.data[fieldName] == undefined || this.data[fieldName] == '' || this.data[fieldName] == null)){
              if(validation.msg == ''){
                // const rowNo = i + 1;
                // validation.msg = mField.label+'( '+rowNo+' ) is required.';
                validation.msg = mField.label+' is required.';
              }
              check = 1;
            }
          // });
          }
        });        
      // }
    }
    if(check != 0){
      this.notificationService.presentToastOnBottom(validation.msg, "danger");
      if(addOrupdate){
        return false;
      }
    }else{
      if(addOrupdate){
        return addOrupdate;
      }else{
        this.dismissModal(this.data,"onlyupdate");

      }
    }
  }
 
  dataListForUpload:any = {};
  curFileUploadField:any={}
  curFileUploadFieldparentfield:any={};
  selectedphotos:any= [];
  downloadClick='';

  // camera upload files
  async selectImageSource(parent,field) {
    this.curFileUploadField = field;
    this.curFileUploadFieldparentfield = parent;
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.selectImage(CameraSource.Camera);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'images',
        handler: () => {
          this.selectMultipleImages();
        }
      }
    ];
 
    // Only allow file selection inside a browser
    // if (!this.plt.is('hybrid')) {
    //   buttons.push({
    //     text: 'Choose a File',
    //     icon: 'attach',
    //     handler: () => {
    //       this.fileInput.nativeElement.click();
    //     }
    //   });
    // }
 
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons
    });
    await actionSheet.present();
  }


  async selectImage(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: source,      
      correctOrientation: true,
      saveToGallery: true
    });

    console.log('Selected Image : ', image);
    let arrayimages:any = []; 
    arrayimages.push(image);
    if (arrayimages && arrayimages.length > 0) {
        this.saveImages(arrayimages)
    }
  }

  async selectMultipleImages(){
    
    const multipleImagesOption:GalleryImageOptions = {
      quality: 60,
      limit: 0,     
      correctOrientation: true,
      presentationStyle: "popover"
    } 
    await Camera.pickImages(multipleImagesOption).then(res => {
      let arrayimages = res.photos;
      this.saveImages(arrayimages)
    },
    error => {
         console.log(error)
      });
  }


  async saveImages(photos) {
    let base64Data:any;
    let kbytes:any;
    let fileName:any;
    this.selectedphotos=[];
    photos.forEach(async (img:any) => {
      base64Data = await this.readAsBase64(img);
      const dateTime = this.datePipe.transform(new Date(), 'yyyyMMdd') + "_" + this.datePipe.transform(new Date(), 'hhmmss');
      fileName = "IMG_" + dateTime + '.'+ img.format;
      this.selectedphotos.push({
        fileData: base64Data,
        fileName: fileName,
        fileExtn:  img.format,
        innerBucketPath: fileName,
        // rollName: fileName,
        log: this.storageService.getUserLog()
      }) 
      if(photos.length == this.selectedphotos.length){
        this.setFile();
      }     
    });
  }


  async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
            path: photo.path
        }); 
        return file.data;
    }
    else {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        return await this.convertBlobToBase64(blob);
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      let base64 = (<string>reader.result).split(',').pop();
        resolve(base64);
    }
    reader.readAsDataURL(blob);
});

  setFile(){
    let uploadData = [];
    if(this.curFileUploadField){
      if(this.curFileUploadFieldparentfield != ''){
        const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield);
        const data = this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]
        if(data && data.length > 0){
          uploadData = data;
        }        
      }else{ 
        const data = this.dataListForUpload[this.curFileUploadField.field_name];
        if(data && data.length > 0){
          uploadData = data;
        } 
      }
    }
    if(this.selectedphotos && this.selectedphotos.length > 0){
      this.selectedphotos.forEach(element => {
        uploadData.push(element);
      });
    }
    if(uploadData && uploadData.length > 0){
      this.fileUploadResponce(uploadData);    
      this.notificationService.presentToastOnBottom("Image Added", "success");
    }
  }


  fileUploadResponce(response) {
    if(this.curFileUploadFieldparentfield != ''){
      const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield);            
      if (!this.dataListForUpload[custmizedKey]) this.dataListForUpload[custmizedKey] = {};
      if (!this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]) this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] = [];
      this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] = response;
    }else{
      if (!this.dataListForUpload[this.curFileUploadField.field_name]) this.dataListForUpload[this.curFileUploadField.field_name] = [];
      this.dataListForUpload[this.curFileUploadField.field_name] = response;
    }
    
    if(this.curFileUploadFieldparentfield != ''){
      const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield); 
      if(this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] && this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name].length > 0){
        let fileName = this.commonFunctionService.modifyFileSetValue(this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]);        
       // this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
       // this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue('');
      }
    }else{    
      if(this.dataListForUpload[this.curFileUploadField.field_name] && this.dataListForUpload[this.curFileUploadField.field_name].length > 0){
        let fileName = this.commonFunctionService.modifyFileSetValue(this.dataListForUpload[this.curFileUploadField.field_name]);
      //  this.templateForm.get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
       // this.templateForm.get(this.curFileUploadField.field_name).setValue('');
      }
    }
  }
 

  async removeAttachedDataFromList(index:number,fieldName:any){
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete == "confirm"){
      this.dataListForUpload[fieldName].splice(index,1)
    }else{
     // this.cancel();
    }
  }


  imageDownload(img:any) {
    this.downloadClick = img.rollName;
    const payload = {
      path: 'download',
      data: img
    }
    this.apiService.DownloadFile(payload);
  }
 

}
