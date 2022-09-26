import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AsyncValidatorFn, FormArray, FormControl } from "@angular/forms";
import { DOCUMENT, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common'; 
import { Router } from '@angular/router';
import { ApiService, CommonDataShareService, CoreUtilityService, DataShareService, EnvService, NotificationService, PermissionService, RestService, StorageService,  } from '@core/ionic-core';
import { ItemReorderEventDetail, ModalController, ToastController  } from '@ionic/angular';
import { GridSelectionModalComponent } from '../../modal/grid-selection-modal/grid-selection-modal.component';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo, GalleryImageOptions, GalleryPhoto, GalleryPhotos} from '@capacitor/camera';
import { ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { finalize, last } from 'rxjs';
import { CameraService } from 'src/app/service/camera-service/camera.service';
import { HttpClient } from '@angular/common/http';
import { zonedTimeToUtc, utcToZonedTime} from 'date-fns-tz';
import { parseISO, format, hoursToMilliseconds, isToday } from 'date-fns';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
// import { isArray } from 'util';

interface User {
  id: number;
  first: string;
  last: string;
}

declare var tinymce: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {



//https://www.npmjs.com/package/@kolkov/angular-editor
editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '100px',
  minHeight: '0',
  maxHeight: 'auto',
  width: 'auto',
  minWidth: '0',
  translate: 'yes',
  enableToolbar: true,
  showToolbar: true,
  placeholder: 'Enter text here...',
  defaultParagraphSeparator: '',
  defaultFontName: '',
  defaultFontSize: '',
  fonts: [
    { class: 'arial', name: 'Arial' },
    { class: 'times-new-roman', name: 'Times New Roman' },
    { class: 'calibri', name: 'Calibri' },
    { class: 'comic-sans-ms', name: 'Comic Sans MS' }
  ],
  customClasses: [
    {
      name: 'quote',
      class: 'quote',
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'titleText',
      class: 'titleText',
      tag: 'h1',
    },
  ],
  uploadUrl: 'v1/image',
  uploadWithCredentials: false,
  sanitize: true,
  toolbarPosition: 'top',
  toolbarHiddenButtons: [
    [],
    ['fontSize', 'insertImage', 'insertVideo',]
  ]
};

minieditorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '100px',
  minHeight: '0',
  maxHeight: 'auto',
  width: 'auto',
  minWidth: '0',
  translate: 'yes',
  enableToolbar: true,
  showToolbar: true,
  placeholder: 'Enter text here...',
  defaultParagraphSeparator: '',
  defaultFontName: '',
  defaultFontSize: '',
  fonts: [
    { class: 'arial', name: 'Arial' },
    { class: 'times-new-roman', name: 'Times New Roman' },
    { class: 'calibri', name: 'Calibri' },
    { class: 'comic-sans-ms', name: 'Comic Sans MS' }
  ],
  customClasses: [
    {
      name: 'quote',
      class: 'quote',
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'titleText',
      class: 'titleText',
      tag: 'h1',
    },
  ],
  uploadUrl: 'v1/image',
  uploadWithCredentials: false,
  sanitize: true,
  toolbarPosition: 'top',
  toolbarHiddenButtons: [
    [],
    ['fontSize',
    'textColor',
    'backgroundColor',
    'customClasses',
    'link',
    'unlink',
    'insertImage',
    'insertVideo',
    'insertHorizontalRule',
    'toggleEditorMode',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'justifyFull',
    'indent',
    'outdent',
    'insertUnorderedList',
    'insertOrderedList',
    'heading',
    'fontName',
    'removeFormat',      
    'strikeThrough']
  ]
};
htmlViewConfig:AngularEditorConfig = {
  editable: false,
  showToolbar: false,
}
tinymceConfig = {}


  @Output() filledFormData = new EventEmitter();
  @Output() addAndUpdateResponce = new EventEmitter();
  @Output() formDetails = new EventEmitter();
  @Input() editedRowIndex: number;
  @Input() formName: string;
  @Input() childData: any;  
  @Input() addform: any;
  @Input() formTypeName:string;
  @Input() modal: any;

  
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  selectedphotos:any= [];  
  downloadClick='';
  
  ionicForm: FormGroup;
  defaultDate = "1987-06-30";
  isSubmitted = false;

  templateForm!: FormGroup;

  forms:any={};
  form:any ={};
  formIndex:number=0;
  tableFields:any=[];
  formFieldButtons:any=[];
  currentMenu:any={};
  elements:any=[];
  showIfFieldList:any=[];
  disableIfFieldList:any=[];
  createFormgroup:boolean=false;
  checkBoxFieldListValue:any=[];
  selectedRowIndex: any = -1;
  minDate: Date;
  maxDate: Date;
  filePreviewFields:any=[];
  isStepper:boolean = false;
  getTableField:boolean = true;
  staticData: any = {};
  copyStaticData:any={};
  dinamic_form:any={};
  currentActionButton:any={};
  close_form_on_success:boolean=false;
  getSavePayload:boolean=false;
  updateMode: boolean = false;
  dataSaveInProgress: boolean = true;
  showNotify: boolean = false;
  submitted:boolean=false;
  complete_object_payload_mode:boolean=false;
  selectedRow: any={};
  dataListForUpload:any = {};
  saveResponceData:any={};
  nextIndex:boolean = false;
  custmizedFormValue: any = {};
  multipleFormCollection:any=[];
  donotResetFieldLists:any={};
  typeAheadData: string[] = [];
  treeViewData: any = {};
  curFileUploadField:any={}
  curFileUploadFieldparentfield:any={};
  public curTreeViewField: any = {};
  currentTreeViewFieldParent:any = {};
  public tempVal = {};

  dinamicFormSubscription:any;
  staticDataSubscriber:any;
  nestedFormSubscription:any;
  saveResponceSubscription:any;
  typeaheadDataSubscription:any;
  fileDataSubscription:any;
  fileDownloadUrlSubscription:any;
  nextFormSubscription:any;
  gridSelectionOpenOrNotSubscription:any;
  isGridSelectionOpen: boolean = true;
  deleteGridRowData: boolean = false;
  clickFieldName:any={};

  dateValue:any;
  public deleteIndex:any = '';
  public deletefieldName = {};
  public alertData = {};

  samePageGridSelectionData:any;
  samePageGridSelection : boolean = false;
  userTimeZone: any;
  userLocale:any;
  mendetoryIfFieldList: any[];
  gridSelectionMendetoryList: any[];
  customValidationFiels: any[];
  canUpdateIfFieldList: any[];
  list_of_fields: any[];
  pageLoading: boolean;
  isLinear: boolean;
  listOfFieldUpdateMode: boolean;
  listOfFieldsUpdateIndex: number;
  checkFormFieldAutfocus: boolean;

  public nextFormData:any ={};
  public lastTypeaheadTypeValue="";
  public addNewRecord:boolean = false;
  enableNextButton:boolean = false;
  updateAddNew:boolean = false;
  nextFormUpdateMode:boolean = false;
  previousFormFocusField:any = {};
  customEntryData:any={};
  public onchangeNextForm:boolean = false;
  // for open next same form

  focusFieldParent:any={};
  currentForm_id = "";
  chipsData:any;  
  typeaheadObjectWithtext:any;
  addedDataInList: any;
  readonly:boolean = false;
  selectedIndex= -1;
  hide = true;
  checkForDownloadReport:boolean = false;
  	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
     files: any[] = [];
     public xtr: any;
     public obj: any = {};
     public uploadData: any = []
     public uploadFilesData: any = [];

  constructor(
    public formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private commonFunctionService:CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private commonDataShareService:CommonDataShareService,
    private permissionService:PermissionService,
    private storageService:StorageService,
    private notificationService:NotificationService,
    private modalController: ModalController,
    private cameraService: CameraService, 
    private plt: Platform, 
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private dataShareServiceService: DataShareServiceService,
    private envService: EnvService
    ) {


      this.tinymceConfig = {
        height: 500,
        menubar: false,
        branding: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | \ table tabledelete | image | code | removeformat | help',
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: function (cb, value, meta) {
          let input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
      
          /*
            Note: In modern browsers input[type="file"] is functional without
            even adding it to the DOM, but that might not be the case in some older
            or quirky browsers like IE, so you might want to add it to the DOM
            just in case, and visually hide it. And do not forget do remove it
            once you do not need it anymore.
          */
      
          input.onchange = function () {
            var file;
      
            var reader:any = new FileReader();
            reader.onload = function () {
              /*
                Note: Now we need to register the blob in TinyMCEs image blob
                registry. In the next release this part hopefully won't be
                necessary, as we are looking to handle it internally.
              */
              var id = 'blobid' + (new Date()).getTime();
              var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
              var base64 = reader.result.split(',')[1];
              var blobInfo = blobCache.create(id, file, base64);
              blobCache.add(blobInfo);
      
              /* call the callback and populate the Title field with the file name */
              cb(blobInfo.blobUri(), { title: file.name });
            };
            reader.readAsDataURL(file);
          };
      
          input.click();
        },
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }


      this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
        this.setStaticData(data);
      });
      this.dinamicFormSubscription = this.dataShareService.form.subscribe(form =>{
        this.setDinamicForm(form);
      });
      this.nestedFormSubscription = this.dataShareService.nestedForm.subscribe(form => {
        if(this.multipleFormCollection && this.multipleFormCollection.length > 0){
          this.loadNextForm(form);
        }else{
          this.form = form;
          this.resetFlag();
          this.setForm();
          if(this.editedRowIndex >= 0 ){
            this.editedRowData(this.childData);
          }
        }
      });
      this.fileDataSubscription = this.dataShareService.getfileData.subscribe(data =>{
        this.setFileData(data);
      })
      this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
        this.setSaveResponce(responce);
      });
      this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data =>{
        this.setTypeaheadData(data);
      });
      this.fileDownloadUrlSubscription = this.dataShareService.fileDownloadUrl.subscribe(data =>{
        this.setFileDownloadUrl(data);
      });
      this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.userLocale = Intl.DateTimeFormat().resolvedOptions().locale;

      this.gridSelectionOpenOrNotSubscription = this.dataShareService.getIsGridSelectionOpen.subscribe(data =>{
        this.isGridSelectionOpen= data;
      })
      this.nextFormSubscription = this.dataShareService.nextFormData.subscribe(data => {
        if(!this.enableNextButton && !this.onchangeNextForm && data && data.data && data.data.length > 0){
          this.enableNextButton = true;
          this.nextFormData = data.data[0];
        }else if(this.onchangeNextForm && data && data.data && data.data.length > 0){
          this.onchangeNextForm = false;        
          this.nextFormData = data.data[0];
          this.openNextForm(false);
        }
      })
      this.onLoadVariable();
  }

  resetFlag(){
    this.createFormgroup = true;
  }

  unsubscribeVariabbles(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
    if(this.dinamicFormSubscription){
      this.dinamicFormSubscription.unsubscribe();
    }
    if(this.nestedFormSubscription){
      this.nestedFormSubscription.unsubscribe();
    }
    if(this.templateForm){
      this.templateForm.reset(); 
    }
    if(this.saveResponceSubscription){
      this.saveResponceSubscription.unsubscribe();
    }
    if(this.fileDataSubscription){
      this.fileDataSubscription.unsubscribe();
    }
    if(this.typeaheadDataSubscription){
      this.typeaheadDataSubscription.unsubscribe();
    }
    if(this.fileDownloadUrlSubscription){
      this.fileDownloadUrlSubscription.unsubscribe();
    }

  }

  ionViewWillEnter() {
    this.onLoadVariable();
  }
  onLoadVariable() {
    this.dataSaveInProgress = true;
  }
  
  ionViewWillLeave(){
    this.unsubscribeVariabbles();
  }
  ngOnDestroy() {
    //Abobe ionViewwillLeave is working fine.
    // this.unsubscribeVariabbles();
  }
  ngOnInit() {
    
    const id:any = this.commonDataShareService.getFormId();
    this.getNextFormById(id);
    this.handleDisabeIf();
    this.formControlChanges();
  }
  getNextFormById(id: string) {
    const params = "form";
    const criteria = ["_id;eq;" + id + ";STATIC"];
    const payload = this.restService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetNestedForm(payload);
  }

  setTypeaheadData(typeAheadData){
    if (typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }
  setStaticData(staticData:any){
    // if(staticData['staticDataMessgae'] != null && staticData['staticDataMessgae'] != ''){
    //   this.storageService.presentToast(staticData['staticDataMessgae']);
    //   const fieldName = {
    //     "field" : "staticDataMessgae"
    //   }
    //   this.apiService.ResetStaticData(fieldName);
    // }
    this.staticData = staticData;
    Object.keys(this.staticData).forEach(key => { 
      if(this.staticData[key]){   
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      }
    })
    
    this.tableFields.forEach(element => {
      switch (element.type) {              
        case 'pdf_view':
          // if(isArray(this.copyStaticData[element.ddn_field]) && this.copyStaticData[element.ddn_field] != null){
          //   const data = this.copyStaticData[element.ddn_field][0];
          //   if(data['bytes'] && data['bytes'] != '' && data['bytes'] != null){
          //     const arrayBuffer = data['bytes'];
          //     // this.pdfViewLink = encodeURIComponent(escape(window.atob( arrayBuffer )));
          //     // this.pdfViewLink = decodeURIComponent(escape(window.atob( arrayBuffer )));
          //     this.pdfViewLink = arrayBuffer;
          //     this.pdfViewListData = JSON.parse(JSON.stringify(this.copyStaticData[element.ddn_field]))
          //   }
          // }else{
          //   this.pdfViewLink = '';
          // }             
          break;
        case 'info_html':
        case 'html_view':
          if(this.copyStaticData[element.ddn_field] && this.copyStaticData[element.ddn_field] != null){
            this.templateForm.controls[element.field_name].setValue(this.copyStaticData[element.ddn_field])
          }
          break;
        default:              
          break;
      }
    })  
    if(this.staticData["FORM_GROUP"] && this.staticData["FORM_GROUP"] != null){          
      this.updateDataOnFormField(this.staticData["FORM_GROUP"]);          
      const fieldName = {
        "field" : "FORM_GROUP"
      }
      this.apiService.ResetStaticData(fieldName);
    }

    if(this.staticData["CHILD_OBJECT"] && this.staticData["CHILD_OBJECT"] != null){
      this.updateDataOnFormField(this.staticData["CHILD_OBJECT"]); 
      const fieldName = {
        "field" : "CHILD_OBJECT"
      }
      this.apiService.ResetStaticData(fieldName);
      
    }

    if(this.staticData["COMPLETE_OBJECT"] && this.staticData["COMPLETE_OBJECT"] != null){
      this.updateDataOnFormField(this.staticData["COMPLETE_OBJECT"]);          
      this.selectedRow = this.staticData["COMPLETE_OBJECT"];
      this.complete_object_payload_mode = true;
      const fieldName = {
        "field" : "COMPLETE_OBJECT"
      }
      this.apiService.ResetStaticData(fieldName);
      
    }

    if(this.staticData["FORM_GROUP_FIELDS"] && this.staticData["FORM_GROUP_FIELDS"] != null){
      this.updateDataOnFormField(this.staticData["FORM_GROUP_FIELDS"]);
      const fieldName = {
        "field" : "FORM_GROUP_FIELDS"
      }
      this.apiService.ResetStaticData(fieldName);

    }
    if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {

      this.setCheckboxFileListValue();
    }    
  }
  setCheckboxFileListValue() {
    this.checkBoxFieldListValue.forEach(element => {
      let checkCreatControl: any;
      if (element.parent) {
        checkCreatControl = this.templateForm.get(element.parent).get(element.field_name);
      } else {
        checkCreatControl = this.templateForm.get(element.field_name);
      }
      if (this.staticData[element.ddn_field] && checkCreatControl.controls && checkCreatControl.controls.length == 0) {
        let checkArray: FormArray;
        if (element.parent) {
          checkArray = this.templateForm.get(element.parent).get(element.field_name) as FormArray;
        } else {
          checkArray = this.templateForm.get(element.field_name) as FormArray;
        }
        this.staticData[element.ddn_field].forEach((data, i) => {
          if (this.updateMode) {
            let arrayData;
            if (element.parent) {
              arrayData = this.selectedRow[element.parent][element.field_name];
            } else {
              arrayData = this.selectedRow[element.field_name];
            }
            let selected = false;
            if (arrayData != undefined && arrayData != null) {
              for (let index = 0; index < arrayData.length; index++) {
                if (this.checkObjecOrString(data) == this.checkObjecOrString(arrayData[index])) {
                  selected = true;
                  break;
                }
              }
            }
            if (selected) {
              checkArray.push(new FormControl(true));
            } else {
              checkArray.push(new FormControl(false));
            }
          } else {
            checkArray.push(new FormControl(false));
          }
        });
      }
    });
  }
  setDinamicForm(form:any){
    if(form && form.DINAMIC_FORM){
      this.dinamic_form = form.DINAMIC_FORM;
      if(this.formName == 'DINAMIC_FORM' && this.getTableField){
        this.form = this.dinamic_form
        this.setForm();
      }        
    }
  }
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '' && this.showNotify) {
        if (saveFromDataRsponce.success == 'success' && !this.updateMode) {
          if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick.success_msg && this.currentActionButton.onclick.success_msg != ''){
            this.notificationService.showAlert(this.currentActionButton.onclick.success_msg,'',['Dismiss']);
          }else if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }else{
            this.notificationService.showAlert(" Form Data Save successfull !!!" ,'',['Dismiss']);
          }
          //this.templateForm.reset();
          //this.formGroupDirective.resetForm()
          
          this.resetForm();
          // this.custmizedFormValue = {};
          this.dataListForUpload = {}
          //this.addAndUpdateResponce.emit('add');
          this.saveResponceData = saveFromDataRsponce.data;
        } else if (saveFromDataRsponce.success == 'success' && this.updateMode) {
          if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick.success_msg && this.currentActionButton.onclick.success_msg != ''){
            this.notificationService.showAlert(this.currentActionButton.onclick.success_msg,'',['Dismiss']);
          }else if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }else{
            this.notificationService.showAlert(" Form Data Update successfull !!!",'',['Dismiss']);
          }
          //this.templateForm.reset();
          //this.formGroupDirective.resetForm()
          if(this.nextIndex){              
            //this.next();
          }else{
            this.resetForm();
            //this.addAndUpdateResponce.emit('update'); 
            this.updateMode = false;
          }                     
          this.custmizedFormValue = {};  
          this.dataListForUpload = {} 
          this.saveResponceData = saveFromDataRsponce.data;
        }
        if(this.close_form_on_success){
          this.close_form_on_success=false;
          this.close();
        }
        else if(this.multipleFormCollection.length > 0){
          this.close();
        }
        else{
          //this.commonFunctionService.getStaticData();
          const payload = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,this.getFormValue(false));
          this.apiService.getStatiData(payload);
        }
        // if(this.isStepper){
        //   this.stepper.reset();
        // }

        // if(this.envService.getRequestType() == 'PUBLIC'){
        //   this.complete_object_payload_mode = false;
        //   let _id = this.saveResponceData["_id"];
        //   if(this.commonFunctionService.isNotBlank(this.form["details"]) && this.commonFunctionService.isNotBlank(this.form["details"]["on_success_url_key"] != "")){
        //     let public_key = this.form["details"]["on_success_url_key"]
        //     const data = {
        //       "obj":public_key,
        //       "key":_id,
        //       "key1": "key2",
        //       "key2" : "key3",
        //     }
        //     let payloaddata = {};
        //     this.storageService.removeDataFormStorage();
        //     const getFormData = {
        //       data: payloaddata,
        //       _id:_id
        //     }
        //     getFormData.data=data;
        //     this.apiService.GetForm(getFormData);
        //     let navigation_url = "template/"+public_key+"/"+_id+"/ie09/cnf00v";
        //     this.router.navigate([navigation_url]);
        //   }else{
        //     this.router.navigate(["home_page"]);
        //   }
         
        // }
        
        //this.close()
        this.showNotify = false;
        this.dataSaveInProgress = true;
        this.apiService.ResetSaveResponce()
        this.checkOnSuccessAction();
      }
      else if (saveFromDataRsponce.error && saveFromDataRsponce.error != '' && this.showNotify) {
        this.notificationService.showAlert(saveFromDataRsponce.error,'',['Dismiss']);
        this.showNotify = false;
        this.dataSaveInProgress = true;
        this.apiService.ResetSaveResponce()
      }
      else{
        this.notificationService.showAlert("No data return",'',['Dismiss']);
        this.dataSaveInProgress = true;
      }
    }
  }
  
  setForm(){
    if(this.form.details && this.form.details.collection_name && this.form.details.collection_name != ''){
      if(this.currentMenu == undefined){
        this.currentMenu = {};
      }
      this.currentMenu['name'] = this.form.details.collection_name;
    }else{
      const collectionName = this.dataShareServiceService.getCollectionName();
      if(collectionName !=''){
        if(this.currentMenu == undefined){
          this.currentMenu = {};
        }
        this.currentMenu['name'] = collectionName;
      }      
    }
    
    // if(this.form){
    //   if(this.form.details && this.form.details.bulk_update){
    //     this.bulkupdates = true;
    //   }
    //   else{
    //     this.bulkupdates = false;
    //   }
    //   this.formDetails.emit(this.form);
    // }
    if(this.form['tableFields'] && this.form['tableFields'] != undefined && this.form['tableFields'] != null){
      this.tableFields = JSON.parse(JSON.stringify(this.form['tableFields']));
      this.getTableField = false;
    }else{
      this.tableFields = [];
    }  
    if(this.form.tab_list_buttons && this.form.tab_list_buttons != undefined && this.form.tab_list_buttons.length > 0){
      this.formFieldButtons = this.form.tab_list_buttons; 
    } 

    this.showIfFieldList=[];
    this.disableIfFieldList=[];
    this.mendetoryIfFieldList = [];
    this.gridSelectionMendetoryList=[];
    this.customValidationFiels = [];
    if (this.tableFields.length > 0 && this.createFormgroup) {
      this.createFormgroup = false;
      const forControl = {};
      this.checkBoxFieldListValue = []
      // this.filePreviewFields=[];
      this.tableFields.forEach(element => {
        if(element.type == 'pdf_view'){
          const object = this.elements[this.selectedRowIndex];
          staticModalGroup.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object))
        } 
        if(element.field_name && element.field_name != ''){             
          switch (element.type) {
            case "list_of_checkbox":
              this.commonFunctionService.createFormControl(forControl, element, [], "list")
              this.checkBoxFieldListValue.push(element);
              break;
            case "checkbox":
              this.commonFunctionService.createFormControl(forControl, element, false, "checkbox")
              break; 
            case "typeahead":
              this.commonFunctionService.createFormControl(forControl, element, null, "text")
              break;
            case "date":
              let currentYear = new Date().getFullYear();
              if(element.datatype == 'object'){
                this.minDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.minDate){
                    if(element.etc_fields.minDate == '-1'){
                      this.minDate = new Date(currentYear - 100, 0, 1);
                    }else{
                      this.minDate.setDate(new Date().getDate() - Number(element.etc_fields.minDate));
                    }
                  }
                }
                this.maxDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.maxDate){
                    if(element.etc_fields.maxDate == '-1'){
                      this.maxDate = new Date(currentYear + 1, 11, 31);
                    }else{
                      this.maxDate.setDate(new Date().getDate() + Number(element.etc_fields.maxDate));
                    }
                  }
                }
              }else{
                this.minDate = new Date(currentYear - 100, 0, 1);
                this.maxDate = new Date(currentYear + 1, 11, 31);
              }
              if(this.plt.is('hybrid')){
                let getToday: any  = (new Date()).toISOString();
                getToday = utcToZonedTime(getToday, this.userTimeZone);
                getToday = this.datePipe.transform(getToday, "yyyy-MM-ddThh:mm:ss");
                let minDateToday:any;
                let maxDateFromToday:any;                
                minDateToday = this.datePipe.transform(this.minDate, "yyyy-MM-dd") + "T00:00:00";
                maxDateFromToday = this.datePipe.transform(this.maxDate, "yyyy-MM-dd") + "T23:59:59";
                // if(this.formTypeName == "default"){
                //     element['minDate'] = getToday;
                // }else{
                //   minDateToday = this.datePipe.transform(this.minDate, "yyyy-MM-dd") + "T00:00:00";
                //   element['minDate'] = minDateToday;
                // }
                element['minDate'] = minDateToday;
                element['maxDate'] = maxDateFromToday;
              }else{
                element['minDate'] = this.minDate;
                element['maxDate'] = this.maxDate;
              }
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break; 
            case "daterange":
              const date_range = {};
              let list_of_dates = [
                {field_name : 'start'},
                {field_name : 'end'}
              ]
              if (element.list_of_dates.length > 0) {
                list_of_dates.forEach((data) => {
                  
                  this.commonFunctionService.createFormControl(date_range, data, '', "text")
                });
              }
              this.commonFunctionService.createFormControl(forControl, element, date_range, "group")                                    
              break;            
            case "list_of_fields":
            case "group_of_fields":
              const list_of_fields = {};
              if (element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((data) => {
                  let modifyData = JSON.parse(JSON.stringify(data));
                  modifyData.parent = element.field_name;
                  //show if handling
                  if(data.show_if && data.show_if != ''){
                    this.showIfFieldList.push(modifyData);
                  }
                  //disable if handling
                  if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null)){                          
                    this.disableIfFieldList.push(modifyData);
                  }                      
                  if(element.type == 'list_of_fields'){
                    modifyData.is_mandatory=false;
                  }
                  if(data.field_name && data.field_name != ''){
                    switch (data.type) {
                      case "list_of_checkbox":
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, [], "list")
                        this.checkBoxFieldListValue.push(modifyData);
                        break;
                      case "date":
                        let currentYear = new Date().getFullYear();
                        if(data.datatype == 'object'){
                          this.minDate = new Date();
                          if(data.etc_fields && data.etc_fields != null){
                            if(data.etc_fields.minDate){
                              if(data.etc_fields.minDate == '-1'){
                                this.minDate = new Date(currentYear - 100, 0, 1);
                              }else{
                                this.minDate.setDate(new Date().getDate() - Number(data.etc_fields.minDate));
                              }
                            }
                          }
                          this.maxDate = new Date();
                          if(data.etc_fields && data.etc_fields != null){
                            if(data.etc_fields.maxDate){
                              if(data.etc_fields.maxDate == '-1'){
                                this.maxDate = new Date(currentYear + 1, 11, 31);
                              }else{
                                this.maxDate.setDate(new Date().getDate() + Number(data.etc_fields.maxDate));
                              }
                            }
                          }
                        }else{
                          this.minDate = new Date(currentYear - 100, 0, 1);
                          this.maxDate = new Date(currentYear + 1, 11, 31);
                        }
                        if(this.plt.is('hybrid')){
                          let minDateToday:any;
                          let maxDateFromToday:any;                
                          minDateToday = this.datePipe.transform(this.minDate, "yyyy-MM-dd");
                          maxDateFromToday = this.datePipe.transform(this.maxDate, "yyyy-MM-dd");
                          data['minDate'] = minDateToday
                          data['maxDate'] = maxDateFromToday;
                        }else{
                          data['minDate'] = this.minDate;
                          data['maxDate'] = this.maxDate;
                        }                        
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, '', "text")
                        break; 
                    
                      default:
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, '', "text")
                        break;
                    } 
                  }                 
                });
              }
              this.commonFunctionService.createFormControl(forControl, element, list_of_fields, "group");                
              break;
            case "stepper":                  
              if(element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((step) => {                      
                  if(step.list_of_fields != undefined){
                    const stepper_of_fields = {};
                    step.list_of_fields.forEach((data) =>{
                      let modifyData = JSON.parse(JSON.stringify(data));
                      modifyData.parent = step.field_name;
                      //show if handling
                      if(data.show_if && data.show_if != ''){
                        this.showIfFieldList.push(modifyData);
                      }
                      //disable if handling
                      if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null)){                          
                        this.disableIfFieldList.push(modifyData);
                      }                     
                      
                      this.commonFunctionService.createFormControl(stepper_of_fields, modifyData, '', "text")
                      if(data.tree_view_object && data.tree_view_object.field_name != ""){
                        let treeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));                
                        treeModifyData.is_mandatory=false;
                        this.commonFunctionService.createFormControl(stepper_of_fields, treeModifyData , '', "text")
                      }
                    });
                    this.commonFunctionService.createFormControl(forControl, step, stepper_of_fields, "group")
                  } 
                }); 
                this.isStepper = true;
              }                    
              break;
            case "pdf_view" : 
              const object = this.elements[this.selectedRowIndex];
              staticModalGroup.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object))
            break;
            case "input_with_uploadfile":
              element.is_disabled = true;
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break;
            case "grid_selection":
                if(element && element.gridColumns && element.gridColumns.length > 0){
                  let colParField = JSON.parse(JSON.stringify(element));
                  colParField['mendetory_fields'] = [];
                  element.gridColumns.forEach(colField => {
                    if(colField && colField.is_mandatory){
                      colParField['mendetory_fields'].push(colField);
                    }
                  });
                  if(colParField && colParField['mendetory_fields'] && colParField['mendetory_fields'].length > 0){
                    this.gridSelectionMendetoryList.push(colParField);
                    element['mendetory_fields'] = colParField['mendetory_fields'];
                  }
                }
                this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break;
            default:
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break;
          }
          

          if(element.tree_view_object && element.tree_view_object.field_name != ""){
            let treeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));                
            treeModifyData.is_mandatory=false;
            this.commonFunctionService.createFormControl(forControl, treeModifyData , '', "text")
          }
        }
        //show if handling
        if(element.show_if && element.show_if != ''){
          this.showIfFieldList.push(element);
        }
        //mandatory if handling
        if(element.mandatory_if && element.mandatory_if != ''){
          this.mendetoryIfFieldList.push(element);
        }
        //Customvalidation handling
        if(element.compareFieldName && element.compareFieldName != ''){
          this.customValidationFiels.push(element);
        }
        //disable if handling
        if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null)){                  
          this.disableIfFieldList.push(element);
        }
        // if(element.type && element.type == 'pdf_view'){
        //   this.filePreviewFields.push(element)
        // }
        if(element.type && element.type == 'info_html'){
          this.filePreviewFields.push(element)
        }
      });
      if(this.formFieldButtons.length > 0){
        this.formFieldButtons.forEach(element => {
          if(element.field_name && element.field_name != ''){              
            switch (element.type) {
              case "dropdown":
                this.commonFunctionService.createFormControl(forControl, element, '', "text")
                break;
              default:
                break;
            }
          }
          if(element.show_if && element.show_if != ''){
            this.showIfFieldList.push(element);
          }
          if(element.mandatory_if && element.mandatory_if != ''){
            this.mendetoryIfFieldList.push(element);
          }
          if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null)){                  
            this.disableIfFieldList.push(element);
          }
        });
      }
      if (forControl) {
        let validators = {};
        validators['validator'] = [];
        if(this.customValidationFiels && this.customValidationFiels.length > 0){
          this.customValidationFiels.forEach(field => {
            switch (field.type) {
              case 'date':
                validators['validator'].push(this.checkDates(field.field_name,field.compareFieldName));
                break;
              default:
                break;
            }

          });
        }
        this.templateForm = this.formBuilder.group(forControl,validators);
        if(this.nextIndex){
          this.nextIndex = false;
          this.next();
        }
      }
      
      let staticModal=[];
     
      
      let object =this.templateForm.getRawValue();
      let staticModalGroup = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,object);
      if(staticModalGroup != undefined && staticModalGroup != null){
        if(staticModalGroup.length > 0){
          staticModalGroup.forEach(data =>{
            staticModal.push(data);
          })
        }
      }
      
      if(this.form && this.form.api_params && this.form.api_params != null && this.form.api_params != "" && this.form.api_params != undefined && this.selectedRowIndex == -1){            
                  
        let criteria = [];
        if(this.form.api_params_criteria && this.form.api_params_criteria != null){
          criteria=this.form.api_params_criteria
        }
        staticModal.push(this.restService.getPaylodWithCriteria(this.form.api_params,this.form.call_back_field,criteria,this.templateForm.getRawValue()))
        
      }
      if(staticModal.length > 0 && this.editedRowIndex == -1){
        this.apiService.getStatiData(staticModal);        
      }
      

    }
  }

  getDate(e) {
    let date = new Date(e.target.value).toISOString().substring(0, 10);
    this.ionicForm.get('dob').setValue(date, {
      onlyself: true
    })
  }
  get errorControl() {
    return this.ionicForm.controls;
  }
  submitForm() {
    this.isSubmitted = true;
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.ionicForm.value)
      this.router.navigate(['home']);
    }
  }

  compareFn(o1: any, o2: any):boolean {
    return o1 && o2 ? o1._id === o2._id : o1 === o2;
  }
  // compareFn(e1: User, e2: User): boolean {
  //   return e1 && e2 ? e1.id === e2.id : e1 === e2;
  // }
  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  take_action_on_click(action_button){
    let api='';
    this.currentActionButton=action_button;
    if(this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.api && this.currentActionButton.onclick.api != null){
      if(this.currentActionButton.onclick.close_form_on_success){
        this.close_form_on_success = this.currentActionButton.onclick.close_form_on_success;
      } 
      api = this.currentActionButton.onclick.api        
      switch (api.toLowerCase()) {
        case "save":
        case "update":
          this.close_form_on_success = true;
          this.saveFormData();
          break; 
          case "preview":
            if(this.currentActionButton.onclick.action_name != ''){
              this.currentMenu.name = this.currentActionButton.onclick.action_name;
              this.selectedRow = this.saveResponceData;
            }
            this.previewModal(this.selectedRow,this.currentMenu,'form-preview-modal')
            break;  
          case "download_report":
             this.downloadReport();
            break;
          case "public_download_report":
             this.publicDownloadReport();
            break;
          case "reset":
            this.createFormgroup = true;
            this.getTableField = true;
            this.pageLoading = true;
            this.dataSaveInProgress = true;
            this.ngOnInit();
            break;
          case "previous":        
            this.previous();
            break;
          case "updateandnext":
            this.saveFormData();
            this.close_form_on_success = false;
            this.nextIndex = true;
            break;
          case "cancel":
            this.dismissModal();
            break;
          case "close":
            this.close();
            break;
          case "send_email":
            this.saveFormData();
            break;
          case "redirect_to_home_page":
            this.router.navigate(['home_page'])
            break;
          case "add":
            this.setListoffieldData();         
            break;
          case "delete_row":
             this.deleteGridData();
            break; 
          default:
             this.partialDataSave(action_button.onclick,null)
            break;
      } 
    } 
  }

  downloadReport(){
    const downloadReportFromData = this.getSavePayloadData();
    if(downloadReportFromData != null){
      downloadReportFromData['_id'] = this.childData._id;
    }
    this.checkForDownloadReport = true;
    this.apiService.GetFileData(downloadReportFromData);
  }

  deleteGridData(){
    let checkValidatiaon = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(false),true,this.getFormValue(true));
    if(typeof checkValidatiaon != 'object'){
      this.deleteGridRowData = true;
      const saveFromData = this.getSavePayloadData();
      if(this.getSavePayload){
          this.apiService.deleteGridRow(saveFromData);
      }
    }else{
      this.notificationService.showAlert('bg-danger','',checkValidatiaon.msg);
    } 
  }


  publicDownloadReport(){
    this.checkForDownloadReport = true;
    let publicDownloadReportFromData = {};
    let payload = {};
    if(this.commonFunctionService.isNotBlank(this.selectedRow["_id"]) && this.commonFunctionService.isNotBlank(this.selectedRow["value"])){
      publicDownloadReportFromData["_id"] = this.selectedRow["_id"];
      publicDownloadReportFromData["value"] = this.selectedRow["value"];
      payload["_id"] = this.selectedRow["_id"];
      payload["data"] = publicDownloadReportFromData;
      this.apiService.GetFileData(payload);
    }

  }


  partialDataSave(feilds,tableField){       
    const payload = {
      data:{}
    };
    //for gsd call*************************
    if(feilds.action_name == 'GSD_CALL'){
      this.envService.setRequestType("PUBLIC");
      if(feilds.api != undefined && feilds.api != null && feilds.api != ''){
        payload['path'] = feilds.api;
      }

      let list = [];
      list.push(this.restService.getPaylodWithCriteria(tableField.api_params,tableField.call_back_field,tableField.api_params_criteria,this.getFormValue(false)));
       payload['data'] = list;
      this.apiService.DynamicApiCall(payload);
      this.saveCallSubscribe();
      //console.log();
      
    }

    //for deafult call (like save)*******************
    else{
      if(feilds.api != undefined && feilds.api != null && feilds.api != ''){
        payload['path'] = feilds.api+'/'+this.currentMenu.name
      }    
      if(this.updateMode){
        const _id = this.selectedRow._id;    
        payload.data['_id'] = _id;
      }  
      if(Array.isArray(feilds.payloads_fields) && feilds.payloads_fields.length > 0){
          if(feilds.payloads_fields[0].toUpperCase() == 'FORM_OBJECT'){
            const saveFromData = this.getSavePayloadData();
            if(this.getSavePayload){
              payload.data = saveFromData.data;
              if(payload['path'] && payload['path'] != undefined && payload['path'] != null && payload['path'] != ''){
                this.apiService.DynamicApiCall(payload);
                this.saveCallSubscribe();
              } 
            }
          }else{
            feilds.payloads_fields.forEach(feild => {
              if(feild in this.custmizedFormValue){
                  payload.data[feild] = this.custmizedFormValue[feild];
                }
                else if(feild in this.templateForm.value){
                  payload.data[feild] = this.templateForm.value[feild]
                }
            });
            if(payload['path'] && payload['path'] != undefined && payload['path'] != null && payload['path'] != ''){
              this.apiService.DynamicApiCall(payload);
              this.saveCallSubscribe();
            }
          }
      } 
    }
     
      
  }


  saveCallSubscribe(){
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    })
  }

  getFormValue(check){    
    let formValue = this.templateForm.getRawValue();
    let selectedRow = { ...this.selectedRow };     
    let modifyFormValue = {};   
    let valueOfForm = {};
    if (this.updateMode || this.complete_object_payload_mode){      
      this.tableFields.forEach(async element => {
        switch (element.type) {
          case 'stepper':
            element.list_of_fields.forEach(step => {
              if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                step.list_of_fields.forEach(data => {
                  selectedRow[data.field_name] = formValue[step.field_name][data.field_name]
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){                  
                    const treeViewField = data.tree_view_object.field_name;
                    selectedRow[treeViewField] = formValue[step.field_name][treeViewField]
                  }
                });
              }
            });
            break;
          case 'group_of_fields':
            element.list_of_fields.forEach(data => {
              switch (data.type) {
                case 'date':
                  if(data && data.date_format && data.date_format != ''){
                    if(typeof formValue[element.field_name][data.field_name] != 'string'){
                      selectedRow[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                    }else{
                      selectedRow[element.field_name] = formValue[element.field_name];
                    }
                  }else{
                    selectedRow[element.field_name] = formValue[element.field_name];
                  }            
                  break;
              
                default:
                  selectedRow[element.field_name] = formValue[element.field_name];
                  break;
              }
            });
            break;
          // case 'gmap':
          //   selectedRow['latitude'] = this.latitude;
          //   selectedRow['longitude'] = this.longitude;
          //   selectedRow['address'] = this.address;
          //   break;
          case 'date':
            if(element && element.date_format && element.date_format != ''){
              selectedRow[element.field_name] = this.datePipe.transform(selectedRow[element.field_name],element.date_format);
            }else{
              // required format 2022-06-30T00:00:00+05:30 (client) and 2022-06-29T18:30:00.000Z (server)
              let Mdate = formValue[element.field_name];
              if(Mdate && Mdate.length > 10){
                Mdate = formValue[element.field_name].substring(0,11) + "00:00:00" + formValue[element.field_name].substring(19);
                let utcDate:any = zonedTimeToUtc(Mdate, this.userTimeZone);
                // const formattedString = format(parseISO(utcDate), 'yyyy-MM-ddHH:mm:ss.SSS');
                // const pattern = 'yyyy-MM-dd HH:mm:ss.SSS \'GMT\' XXX (z)';
                // const output = format(utcDate, pattern, { timeZone: this.userTimeZone });
                utcDate = this.datePipe.transform(utcDate,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", 'UTC');
                selectedRow[element.field_name] = utcDate;
              }
            }
            break;
          default:
            selectedRow[element.field_name] = formValue[element.field_name];
            break;
        }
      });
    }else{
      this.tableFields.forEach(async element => {
        switch (element.type) {
          case 'stepper':
            element.list_of_fields.forEach(step => {
              if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                step.list_of_fields.forEach(data => {
                  modifyFormValue[data.field_name] = formValue[step.field_name][data.field_name]
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){                  
                    const treeViewField = data.tree_view_object.field_name;
                    modifyFormValue[treeViewField] = formValue[step.field_name][treeViewField]
                  }
                });
              }
            });
            break;
          case 'group_of_fields':
            element.list_of_fields.forEach(data => {
              switch (data.type) {
                case 'date':
                  if(data && data.date_format && data.date_format != ''){
                    modifyFormValue[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                  }            
                  break;
              
                default:
                  modifyFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name];
                  break;
              }
            });
            break;
          // case 'gmap':
          //   modifyFormValue['latitude'] = this.latitude;
          //   modifyFormValue['longitude'] = this.longitude;
          //   modifyFormValue['address'] = this.address;
          //   break;
          case 'date':
            if(element && element.date_format && element.date_format != ''){
              modifyFormValue[element.field_name] = this.datePipe.transform(formValue[element.field_name],element.date_format);
            }  else{
              // modifyFormValue[element.field_name] = formValue[element.field_name];

              //required format 2022-06-30T00:00:00+05:30 (client) and 2022-06-29T18:30:00.000Z (server)
              // let Mdate = new Date(formValue[element.field_name]).toISOString();
              if(formValue[element.field_name]){
                let  Mdate = formValue[element.field_name].substring(0,11) + "00:00:00" + formValue[element.field_name].substring(19);

                // date-fns
                let utcDate:any = zonedTimeToUtc(Mdate, this.userTimeZone);
                utcDate = this.datePipe.transform(utcDate,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", 'UTC');

                // const pattern = "yyyy-MM-dd'T'hh:mm:ss.SSS'Z"
                // const output = format(utcDate, pattern, { timeZone: this.userTimeZone })
                // console.log("Output : ", output)
                modifyFormValue[element.field_name] = utcDate;
              }else{
                modifyFormValue[element.field_name] = formValue[element.field_name];
              }

            }          
            break;
          default:
            modifyFormValue = formValue;
            break;
        }
      });
    }
    if(check){
      Object.keys(this.custmizedFormValue).forEach(key => {
        if (this.updateMode || this.complete_object_payload_mode) {
          if(this.custmizedFormValue[key] && this.custmizedFormValue[key] != null && !Array.isArray(this.custmizedFormValue[key]) && typeof this.custmizedFormValue[key] === "object"){
            this.tableFields.forEach(element => {            
              if(element.field_name == key){
                if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
                  selectedRow[key] = this.custmizedFormValue[key];
                }else{
                  Object.keys(this.custmizedFormValue[key]).forEach(child =>{
                    selectedRow[key][child] = this.custmizedFormValue[key][child];
                  })
                }
              }
            });          
          }else{
              selectedRow[key] = this.custmizedFormValue[key];
          }
        } else {
          if(this.custmizedFormValue[key] && this.custmizedFormValue[key] != null && !Array.isArray(this.custmizedFormValue[key]) && typeof this.custmizedFormValue[key] === "object"){
            this.tableFields.forEach(element => {
              if(element.field_name == key){
                if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
                  modifyFormValue[key] = this.custmizedFormValue[key];
                }else{
                  Object.keys(this.custmizedFormValue[key]).forEach(child =>{
                    modifyFormValue[key][child] = this.custmizedFormValue[key][child];
                  })
                }
              }
            });          
          }else{
            modifyFormValue[key] = this.custmizedFormValue[key];
          }       
          
        }
      })
    //   if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
    //     this.checkBoxFieldListValue.forEach(element => {
    //       if (this.staticData[element.ddn_field]) {
    //         const listOfCheckboxData = [];
    //         let data = [];
    //         if(this.updateMode || this.complete_object_payload_mode){
    //           if(element.parent){
    //             data = selectedRow[element.parent][element.field_name];
    //           }else{
    //             data = selectedRow[element.field_name];
    //           }
    //         }else{
    //           if(element.parent){
    //             data = modifyFormValue[element.parent][element.field_name];
    //           }else{
    //             data = modifyFormValue[element.field_name];
    //           }
    //         }
    //         let currentData = this.staticData[element.ddn_field];
    //         if(data && data.length > 0){
    //           data.forEach((data, i) => {
    //             if (data) {
    //               listOfCheckboxData.push(currentData[i]);
    //             }
    //           });
    //         }
    //         if (this.updateMode || this.complete_object_payload_mode) {
    //           if(element.parent){
    //             selectedRow[element.parent][element.field_name] = listOfCheckboxData;
    //           }else{
    //             selectedRow[element.field_name] = listOfCheckboxData;
    //           }
    //         } else {
    //           if(element.parent){
    //             modifyFormValue[element.parent][element.field_name] = listOfCheckboxData;
    //           }else{
    //             modifyFormValue[element.field_name] = listOfCheckboxData
    //           }
    //         }
    //       }
    //     });
    //   }
      Object.keys(this.dataListForUpload).forEach(key => {
        if (this.updateMode || this.complete_object_payload_mode) {
          if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
            this.tableFields.forEach(element => {            
              if(element.field_name == key){                
                Object.keys(this.dataListForUpload[key]).forEach(child =>{
                  selectedRow[key][child] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key][child]);
                })
              }
            });          
          }else{
              selectedRow[key] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key]);
          }
        } else {
          if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
            this.tableFields.forEach(element => {
              if(element.field_name == key){                
                Object.keys(this.dataListForUpload[key]).forEach(child =>{
                  modifyFormValue[key][child] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key][child]);
                })
              }
            });          
          }else{
            modifyFormValue[key] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key]);
          }       
          
        }
      })
    } 

    valueOfForm = this.updateMode || this.complete_object_payload_mode ? selectedRow : modifyFormValue;
       
       
    return valueOfForm;
  }
  getSavePayloadData() {
    this.getSavePayload = false;
    this.submitted = true;
    let hasPermission;
    if(this.currentMenu && this.currentMenu.name){
      hasPermission = this.permissionService.checkPermission(this.currentMenu.name.toLowerCase( ),'add');
    }
    if(this.updateMode){
      hasPermission = this.permissionService.checkPermission(this.currentMenu.name.toLowerCase( ),'edit')
    }
    // if(this.envService.getRequestType() == 'PUBLIC'){
    //   hasPermission = true;
    // }
    let formValue;
    if(this.deleteGridRowData){
      formValue = this.templateForm.getRawValue();
    }else{
      formValue = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(true),false);
    }
    this.deleteGridRowData = false;
       
    if(hasPermission){
      let gridSelectionValidation:any = this.checkGridSelectionMendetory(); 
      if(this.templateForm.valid && gridSelectionValidation.status){
        if(this.commonFunctionService.checkCustmizedValuValidation(this.tableFields,formValue)){
          if (this.dataSaveInProgress) {
            this.showNotify = true;
            this.dataSaveInProgress = false;            
            formValue['log'] = this.storageService.getUserLog();
            if(!formValue['refCode'] || formValue['refCode'] == '' || formValue['refCode'] == null){
              formValue['refCode'] = this.storageService.getRefcode();
            } 
            if(!formValue['appId'] || formValue['appId'] == '' || formValue['appId'] == null){
              //formValue['appId'] = this.commonFunctionService.getAppId();
              formValue['appId'] = this.storageService.getRefcode();
              
            }            
            // this.custmizedFormValue.forEach(element => {
            //   this.templateForm.value[element.name] = element.value;
            // });
            
            // formValue = this.commonFunctionService.sanitizeObject(this.tableFields,formValue);
            if (this.updateMode) {              
              if(this.formName == 'cancel'){
                formValue['status'] = 'CANCELLED';
              }                                          
            }              

            const saveFromData = {
              curTemp: this.currentMenu.name,
              data: formValue
            }
            this.getSavePayload = true;
            return saveFromData;
            
          }
        }else{
          this.getSavePayload = false;
        }
      }else{
        this.getSavePayload = false;
        if(gridSelectionValidation.msg && gridSelectionValidation.msg != ''){
          this.notificationService.showAlert(gridSelectionValidation.msg,'Mandatory Fields *',['Dismiss']);
        }else{
          this.notificationService.showAlert("Some fields are mendatory",'Mandatory Field *',['Dismiss']);
        }
      }
    }else{
      this.getSavePayload = false;
      this.notificationService.showAlert("Permission denied !!!",'',['Dismiss']);
    }
  }
  saveFormData(){
    let checkValidatiaon = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(false),true,this.getFormValue(true));
    if(typeof checkValidatiaon != 'object'){
      const saveFromData = this.getSavePayloadData();
      // if(this.bulkupdates){
      //   saveFromData.data['data'] = this.bulkDataList;
      //   saveFromData.data['bulk_update'] = true;
      // }
      if(this.getSavePayload){
        if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.api && this.currentActionButton.onclick.api != null && this.currentActionButton.onclick.api.toLowerCase() == 'send_email'){
          this.apiService.SendEmail(saveFromData)
        }else{
          this.apiService.SaveFormData(saveFromData);
        }        
      }
    }else{
      this.notificationService.showAlert(checkValidatiaon.msg,'',['Dismiss']);
    }     
  }
  

  resetForm(){
    //this.formGroupDirective.resetForm();
    //this.setPreviousFormTargetFieldData();
    this.donotResetFieldLists = this.commonFunctionService.donotResetField(this.tableFields,this.getFormValue(true));
    this.templateForm.reset()
    if(Object.keys(this.donotResetFieldLists).length > 0){
      this.custmizedFormValue = {};

      //this.commonFunctionService.updateDataOnFormField(this.templateForm,this.tableFields,this.formFieldButtons,this.donotResetFieldLists,this.selectedRow,this.custmizedFormValue,this.dataListForUpload,this.treeViewData,this.copyStaticData);
      this.donotResetFieldLists = {};
    }else{
      this.custmizedFormValue = {};
    }    
    this.tableFields.forEach(element => {
      switch (element.type) {
        case 'checkbox':
          this.templateForm.controls[element.field_name].setValue(false)
          break; 
        case 'list_of_checkbox':
          const controls:any = this.templateForm.get(element.field_name)['controls'];
          if(controls && controls.length > 0){
            controls.forEach((child,i) => {
              controls.at(i).patchValue(false);
              //this.templateForm.get(element.field_name).at(i).patchValue(false);
              //(<FormArray>this.templateForm.controls[element.field_name]).controls[i].patchValue(false);
            });
          }
          break;     
        default:
          break;
      }
    });
  }
  close(){    
    this.apiService.resetStaticAllData();
    this.copyStaticData = {};
    this.typeAheadData = [];
    //this.commonFunctionService.resetStaticAllData();
    this.selectedRow = {};
    this.checkFormAfterCloseModel();
  }
  checkFormAfterCloseModel(){
    if(this.multipleFormCollection.length > 0){
      this.loadPreviousForm();
    }else{      
      this.templateForm.reset();
      // this.dismissModal();
      this.addAndUpdateResponce.emit('close');
      this.modal.dismiss();
      this.templateForm.reset();
    }
  }
  checkOnSuccessAction(){
    let actionValue = ''
    let index = -1;
    if(this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.action_name && this.currentActionButton.onclick.action_name != null){
      if(this.currentActionButton.onclick.action_name != ''){
        actionValue = this.currentActionButton.onclick.action_name;
        if(actionValue != ''){
          Object.keys(this.forms).forEach((key,i) => {
            if(key == actionValue){
              index = i;
            }
          });
          if(index != -1) {
            //this.changeNewForm(actionValue,index)
          }    
        }
      }
    }
  };
  editedRowData(object) {
    this.selectedRow = JSON.parse(JSON.stringify(object)); 
    this.updateMode = true;
    this.updateDataOnFormField(this.selectedRow); 
    this.getStaticDataWithDependentData(); 
     
    if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
      this.setCheckboxFileListValue();
      // this.checkBoxFieldListValue.forEach(element => {
      //   if (this.staticData[element.ddn_field]) {
      //     const arrayData = this.selectedRow[element.field_name];
      //     const checkArray: FormArray = this.templateForm.get(element.field_name) as FormArray;
      //     this.staticData[element.ddn_field].forEach((data, i) => {
      //       let selected = false;
      //       if (arrayData != undefined && arrayData != null) {
      //         for (let index = 0; index < arrayData.length; index++) {
      //           if (this.checkObjecOrString(data) == this.checkObjecOrString(arrayData[index])) {
      //             selected = true;
      //             break;
      //           }
      //         }
      //       }
      //       if (selected) {
      //         checkArray.push(new FormControl(true));
      //       } else {
      //         checkArray.push(new FormControl(false));
      //       }
      //     });
      //   }
      // });
    }
  }
  getStaticDataWithDependentData(){
    const staticModal = []
    this.tableFields.forEach(element => {
      if(element.field_name && element.field_name != ''){
        if (element.onchange_function && element.onchange_function_param && element.onchange_function_param != "") {
          switch (element.onchange_function_param) {        
              case 'autopopulateFields':
                this.commonFunctionService.autopopulateFields(this.templateForm);
                break;
            default:
             this.inputOnChangeFunc('',element);
          }
        }
      }
    });
    this.tableFields.forEach(element => {
      if(element.field_name && element.field_name != ''){
        let fieldName = element.field_name;
        let object = this.selectedRow[fieldName];        
        if (element.onchange_api_params && element.onchange_call_back_field && !element.do_not_auto_trigger_on_edit) {
          const checkFormGroup = element.onchange_call_back_field.indexOf("FORM_GROUP");
          if(checkFormGroup == -1){

            const payload = this.restService.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, this.selectedRow)
            if(element.onchange_api_params.indexOf('QTMP') >= 0){
              if(element && element.formValueAsObjectForQtmp){
                payload["data"]=this.getFormValue(false);
              }else{
                payload["data"]=this.getFormValue(true);
              }
            } 
            staticModal.push(payload);
          }
        }
        switch (element.type) {
          case "stepper":
            if (element.list_of_fields.length > 0) {
              element.list_of_fields.forEach((step) => {                
                if (step.list_of_fields.length > 0) {
                  step.list_of_fields.forEach((data) => {
                    if (data.onchange_api_params && data.onchange_call_back_field && !data.do_not_auto_trigger_on_edit) {
                      const checkFormGroup = data.onchange_call_back_field.indexOf("FORM_GROUP");
                      if(checkFormGroup == -1){
            
                        const payload = this.restService.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, this.selectedRow)
                        if(data.onchange_api_params.indexOf('QTMP') >= 0){
                          if(element && element.formValueAsObjectForQtmp){
                            payload["data"]=this.getFormValue(false);
                          }else{
                            payload["data"]=this.getFormValue(true);
                          }
                        } 
                        staticModal.push(payload);
                      }
                    }
                    if(data.tree_view_object && data.tree_view_object.field_name != ""){
                      let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                      if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
                        staticModal.push(this.restService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, this.selectedRow));
                      }
                    }
                  });
                }
              });
            }
            break;
        }
        if(element.tree_view_object && element.tree_view_object.field_name != ""){
          let editeTreeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
          if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
            staticModal.push(this.restService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, this.selectedRow));
          }
        }
      }
      if(element.type && element.type == 'pdf_view'){
        staticModal.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,this.selectedRow))
      }
    });
    let staticModalGroup = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,this.selectedRow);
    if(staticModalGroup.length > 0){
      staticModalGroup.forEach(element => {
        staticModal.push(element);
      });
    } 
    if(this.form.api_params && this.form.api_params != null && this.form.api_params != "" && this.form.api_params != undefined){
      
      let criteria = [];
      if(this.form.api_params_criteria && this.form.api_params_criteria != null){
        criteria=this.form.api_params_criteria
      }
      staticModal.push(this.restService.getPaylodWithCriteria(this.form.api_params,this.form.call_back_field,criteria,this.getFormValue(true)))
      
    }
    if(staticModal.length > 0){    
      this.apiService.getStatiData(staticModal);
    }
  }
  updateDataOnFormField(formValue){
    const checkDataType = typeof formValue;
    if(checkDataType == 'object' && !this.commonFunctionService.isArray(formValue)){
      this.tableFields.forEach(element => {
        let fieldName = element.field_name;
        let object = formValue[fieldName];
        if(element && element.field_name && element.field_name != ''){
          switch (element.type) { 
            case "grid_selection":
            case 'grid_selection_vertical':
            case "list_of_string":
            case "drag_drop":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                this.templateForm.controls[element.field_name].setValue('')
              }
              break;
            case "file":
            case "input_with_uploadfile":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                this.dataListForUpload[element.field_name] = JSON.parse(JSON.stringify(formValue[element.field_name]));
                const value = this.commonFunctionService.modifyFileSetValue(formValue[element.field_name]);
                this.templateForm.controls[element.field_name].setValue(value);
              }
              break;
            case "list_of_fields":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                if(this.commonFunctionService.isArray(formValue[element.field_name])){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                }else if(typeof formValue[element.field_name] == "object" && element.datatype == 'key_value'){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                }else{
                  element.list_of_fields.forEach(data => {
                    switch (data.type) {
                      case "list_of_string":
                      case "grid_selection":
                      case 'grid_selection_vertical':
                      case "drag_drop":                    
                        if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                          this.custmizedFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name]
                          this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                        }
                        break;
                      case "typeahead":
                        if(data.datatype == "list_of_object" || element.datatype == 'chips'){
                          if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                            this.custmizedFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name]
                            this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                            //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                          }
                        }else{
                          if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                            const value = formValue[element.field_name][data.field_name];
                            this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                            //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                          }
                        }
                        break;
                      default:
                        if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                          const value = formValue[element.field_name][data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                        }
                        break;
                    }
                  });
                }
              }
              break; 
            case "typeahead":
              if(element.datatype == "list_of_object" || element.datatype == 'chips'){
                if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                  this.templateForm.controls[element.field_name].setValue('')
                }
              }else{
                if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){                  
                  const value = formValue[element.field_name];
                  this.typeAheadData = [value];
                  this.templateForm.controls[element.field_name].setValue(value)
                }
              }  
              break;
            case "group_of_fields":
              element.list_of_fields.forEach(data => {
                let ChildFieldData = formValue[element.field_name];
                if(data && data.field_name && data.field_name != ''){
                  switch (data.type) {
                    case "list_of_string":
                    case "grid_selection":
                    case 'grid_selection_vertical':
                    case "drag_drop": 
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        if (!this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = {};
                        const value = ChildFieldData[data.field_name];
                        this.custmizedFormValue[element.field_name][data.field_name] = value;
                        this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                      }
                      break;   
                    case "typeahead":
                      if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                        if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                          if (!this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = {};
                          const value = ChildFieldData[data.field_name];
                          this.custmizedFormValue[element.field_name][data.field_name] = value;
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                        }
                      }else{
                        if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                          const value = ChildFieldData[data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                        }
                      }  
                      break;               
                    case "number":
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        let gvalue;
                        const value = ChildFieldData[data.field_name];
                        if(value != null && value != ''){
                          gvalue = value;
                        }else{
                          gvalue = 0;
                        }
                        this.templateForm.get(element.field_name).get(data.field_name).setValue(gvalue)
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(gvalue);
                      }
                      break;
                    case "list_of_checkbox":
                      this.templateForm.get(element.field_name).get(data.field_name).patchValue([])
                      if(element.parent){
                        this.selectedRow[element.parent] = {}
                        this.selectedRow[element.parent][element.field_name] = ChildFieldData;
                      }else{
                        this.selectedRow[element.field_name] = ChildFieldData;
                      }
                      //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue([]);
                      break;
                    case "date":
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        if(data.date_format && data.date_format !="" && typeof ChildFieldData[data.field_name] === 'string'){
                          const date = ChildFieldData[data.field_name];
                          const dateMonthYear = date.split('/');
                          const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
                          const value = new Date(formatedDate);
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                        }else{                  
                          const value = formValue[element.field_name][data.field_name] == null ? null : formValue[element.field_name][data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value);              
                        }
                      }
                      break;
                    default:
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        const value = ChildFieldData[data.field_name];
                        this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                      }
                      break;
                  }
                }
              });
              break;
            case "tree_view_selection":
              this.treeViewData[fieldName] = [];            
              let treeDropdownValue = object == null ? null : object;
              this.treeViewData[fieldName].push(JSON.parse(JSON.stringify(treeDropdownValue)));
              this.templateForm.controls[fieldName].setValue(treeDropdownValue)
              break;
            case "stepper":
              element.list_of_fields.forEach(step => {
                step.list_of_fields.forEach(data => {
                  switch (data.type) {
                    case "list_of_string":
                    case "grid_selection":
                    case 'grid_selection_vertical':
                      if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){                                             
                        this.custmizedFormValue[data.field_name] = formValue[data.field_name]                    
                      }
                      this.templateForm.get(step.field_name).get(data.field_name).setValue('')
                      //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue('');
                      break;
                    case "typeahead":
                      if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                        if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){                      
                          this.custmizedFormValue[data.field_name] = formValue[data.field_name]
                          this.templateForm.get(step.field_name).get(data.field_name).setValue('')
                          //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue('');
                        }
                      }else{
                        if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){
                          const value = formValue[data.field_name];
                          this.templateForm.get(step.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(value);
                        }
                      }
                      break;
                    case "number":
                        let gvalue;
                        const value = formValue[data.field_name];
                        if(value != null && value != ''){
                          gvalue = value;
                        }else{
                          gvalue = 0;
                        }
                        this.templateForm.get(step.field_name).get(data.field_name).setValue(gvalue)
                        //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(gvalue);
                      break;
                    case "list_of_checkbox":
                      this.templateForm.get(step.field_name).get(data.field_name).patchValue([])
                      //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue([]);
                      break;
                    default:
                      if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){
                        const value = formValue[data.field_name];
                        this.templateForm.get(step.field_name).get(data.field_name).setValue(value)
                        //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(value);
                      }
                      break;
                  }
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){
                    let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                    const treeObject = this.selectedRow[editeTreeModifyData.field_name];
                    this.templateForm.get(step.field_name).get(editeTreeModifyData.field_name).setValue(treeObject)
                    //(<FormGroup>this.templateForm.controls[step.field_name]).controls[editeTreeModifyData.field_name].patchValue(treeObject);
                  } 
                });
              });
              break;            
            case "number":
              let value;
              if(object != null && object != ''){
                value = object;
                this.templateForm.controls[element.field_name].setValue(value)
              }else if(object == 0){
                value = object;
                this.templateForm.controls[element.field_name].setValue(value)
             }
            break; 
            case "daterange":
                let list_of_dates = [
                  {field_name : 'start'},
                  {field_name : 'end'}
                ]
                if (list_of_dates.length > 0) {
                  list_of_dates.forEach((data) => { 
                    this.templateForm.get(element.field_name).get(data.field_name).setValue(value);
                    //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(object[data.field_name]);
                  });
                }                                   
                break;
            case "date":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                if(element.date_format && element.date_format != '' && typeof object === 'string'){
                  const date = object[element.field_name];
                  const dateMonthYear = date.split('/');
                  const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
                  const value = new Date(formatedDate);
                  this.templateForm.controls[element.field_name].setValue(value)
                }else{        
                  const value = formValue[element.field_name] == null ? null : formValue[element.field_name];
                  //need in this format 2022-06-30T00:00:00+05:30
                  // let isoString = new Date(value).toISOString()
                  let transformzonedTime :any;
                  let zonedTime:any;
                  if(value !=''){
                    zonedTime = utcToZonedTime(value, this.userTimeZone);
                    // let transformzonedTime = (parseISO(zonedTime), "yyyy-MM-dd'T'HH:mm:ssZ");
                    transformzonedTime = this.datePipe.transform(zonedTime,"yyyy-MM-dd'T'HH:mm:ssZZZZZ", this.userTimeZone);
                    // let pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'";
                    // let output = format(zonedTime, pattern, { timeZone: userTimeZone })

                  }else{
                    transformzonedTime='';
                  }

                  this.templateForm.controls[element.field_name].setValue(transformzonedTime);                  
                }
              }
              break;
            case "tabular_data_selector":   
              if(object != undefined && object != null){
                this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));     
              } 
              if(Array.isArray(this.copyStaticData[element.ddn_field]) && Array.isArray(this.custmizedFormValue[fieldName])){
                this.custmizedFormValue[fieldName].forEach(staData => {
                  if(this.copyStaticData[element.ddn_field][staData._id]){
                    this.copyStaticData[element.ddn_field][staData._id].selected = true;
                  }
                });
              }          
              break;
            case "list_of_checkbox":
              this.templateForm.controls[element.field_name].setValue([]);
              break;
            default:
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                const value = formValue[element.field_name] == null ? null : formValue[element.field_name];
                this.templateForm.controls[element.field_name].setValue(value)
              }
              break;
          } 
        }  
        if(element.tree_view_object && element.tree_view_object.field_name != ""){
          let editeTreeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
          const object = this.selectedRow[editeTreeModifyData.field_name];
          this.templateForm.controls[editeTreeModifyData.field_name].setValue(object)
        }   
      });
      if(this.formFieldButtons.length > 0){
        this.formFieldButtons.forEach(element => {
          let fieldName = element.field_name;
          let object = this.selectedRow[fieldName];
          if(element.field_name && element.field_name != ''){              
            switch (element.type) {
              case "dropdown":
                let dropdownValue = object == null ? null : object;
                this.templateForm.controls[element.field_name].setValue(dropdownValue);
                break;
              default:
                break;
            }
          }
        });
      }
    }
  }
  
  
  checkValidator(action_button){
    const field_name = action_button.field_name.toLowerCase();
    switch (field_name) {
      case "save":
      case "update":
      case "updateandnext":
      case "send_email":
        return !this.templateForm.valid;
      default:
        return;
    }      
  }


  responceData(data) {
    if(this.clickFieldName.type){
      switch (this.clickFieldName.type) {
        case "grid_selection":
        case 'grid_selection_vertical':
          if(this.clickFieldName.datatype == 'grid_review'){
            this.custmizedFormValue[this.clickFieldName.field_name] = data;
          }          
          break;      
        default:
          break;
      }
    }
    this.clickFieldName = {};
  }

  resetFlagsForNewForm(){    
    //this.tableFields = [];
    this.showIfFieldList=[];
    this.disableIfFieldList=[];
    this.mendetoryIfFieldList = [];
    this.gridSelectionMendetoryList=[];
    this.customValidationFiels = [];
    this.canUpdateIfFieldList=[];
    this.custmizedFormValue = {};
    this.dataListForUpload = {};
    this.checkBoxFieldListValue = [];
    this.selectedRow = {}
    this.formFieldButtons=[];
    this.list_of_fields = [];
    this.typeAheadData = [];
    this.createFormgroup = true;    
    this.getTableField = true;
    this.pageLoading = true;
    this.dataSaveInProgress = true; 
    this.isLinear=true;
    this.isStepper = false;
    this.listOfFieldUpdateMode=false; 
    this.listOfFieldsUpdateIndex = -1; 
    this.checkFormFieldAutfocus = true;
    this.filePreviewFields = [];
    this.nextFormUpdateMode=false;
  }





  getGridSelectedData(data,field){
    let gridSelectedData = [];
    if (!this.customEntryData[field.field_name]) this.customEntryData[field.field_name] = [];
    this.customEntryData[field.field_name] = []
    if(data && data.length > 0){
      data.forEach(grid => {
        if(grid && grid.customEntry && field.add_new_enabled){
          this.customEntryData[field.field_name].push(grid);
        }else{
          gridSelectedData.push(grid);
        }
      });
    }
    return gridSelectedData;
  }







  getTypeahead(event, parentfield, field) { 
    const value = event.target.value;
    this.templateForm.get(field.field_name).setValue(value);
    let objectValue = this.getFormValue(false); 
    // if(field.datatype == 'text'){
    //   let typeaheadTextControl:any = {}
    //   if(parentfield != ''){
    //     typeaheadTextControl = this.templateForm.get(parentfield.field_name).get(field.field_name);    
    //   }else{
    //     typeaheadTextControl = this.templateForm.controls[field.field_name];
    //   }  
    //   if(objectValue[field.field_name] == null || objectValue[field.field_name] == '' || objectValue[field.field_name] == undefined){
    //     if(field.is_mandatory){
    //       typeaheadTextControl.setErrors({ required: true });
    //     }else{
    //       typeaheadTextControl.setErrors(null);
    //     }        
    //   }else{        
    //     typeaheadTextControl.setErrors({ validDataText: true });
    //   }      
    // }
    this.callTypeaheadData(field,objectValue);       

  }
  get templateFormControl() {
    return this.templateForm.controls;
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
  // setValue(){
  //   this.typeAheadData = [];
  // }

  custmizedKey(parentfield){
    let custmizedKey = parentfield.field_name;
    switch (parentfield.type) {
      case "list_of_fields":
      case "group_of_fields":
        custmizedKey = parentfield.field_name+'_'+parentfield.type                
        break;          
      default:
        custmizedKey = parentfield.field_name;
        break;
    }
    return custmizedKey;
  }

  checkDataAlreadyAddedInListOrNot(primary_key,incomingData,alreadyDataAddedlist){
    if(alreadyDataAddedlist == undefined){
      alreadyDataAddedlist = [];
    }
    let alreadyExist = "false";
    if(typeof incomingData == 'object'){
      alreadyDataAddedlist.forEach(element => {
        if(element._id == incomingData._id){
          alreadyExist =  "true";
        }
      });
    }
    else if(typeof incomingData == 'string'){
      alreadyDataAddedlist.forEach(element => {
        if(typeof element == 'string'){
          if(element == incomingData){
            alreadyExist =  "true";
          }
        }else{
          if(element[primary_key] == incomingData){
            alreadyExist =  "true";
          }
        }
      
      });
    }else{
      alreadyExist =  "false";
    }
    if(alreadyExist == "true"){
      return true;
    }else{
      return false;
    }
  }


  checkFieldShowOrHide(field){    
    for (let index = 0; index < this.showIfFieldList.length; index++) {
      const element = this.showIfFieldList[index];
      if(element.field_name == field.field_name){
        if(element.show){
          return true;
        }else{
          return false;
        }
      }
      
    }
  } 


  modifyUploadFiles(files){
    const fileList = [];
    if(files && files.length > 0){
      files.forEach(element => {
        if(element._id){
          fileList.push(element)
        }else{
          fileList.push({uploadData:[element]})
        }
      });
    }                  
    return fileList;
  }
  modifyFileSetValue(files){
    let fileName = '';
    let fileLength = files.length;
    let file = files[0];
    if(fileLength == 1){
      fileName = file.fileName || file.rollName;
    }else if(fileLength > 1){
      fileName = fileLength + " Files";
    }
    return fileName;
  }

  setValue(parentfield:any,field:any, add?:any, event?:any) {
    let formValue = this.templateForm.getRawValue()    
    switch (field.type) {
      case "list_of_string":
        if (add) {
          if(parentfield != ''){
            const custmizedKey = this.custmizedKey(parentfield);   
            const value = formValue[parentfield.field_name][field.field_name]
            if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][field.field_name] && this.checkDataAlreadyAddedInListOrNot(field.field_name,value, this.custmizedFormValue[custmizedKey][field.field_name])){
              //this.notificationService.showAlert('bg-danger','Entered value for '+field.label+' is already added. !!!');
              this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
            }else{
              if (!this.custmizedFormValue[custmizedKey]) this.custmizedFormValue[custmizedKey] = {};
              if (!this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
              const custmizedFormValueParant = Object.assign([],this.custmizedFormValue[custmizedKey][field.field_name])
              if(value != '' && value != null){
                custmizedFormValueParant.push(value)            
                this.custmizedFormValue[custmizedKey][field.field_name] = custmizedFormValueParant;
              }
              if(event){
                event.value = '';
              }
              this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
              //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
              this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
            }
            
          }else{
            const value = formValue[field.field_name];
            if(this.custmizedFormValue[field.field_name] && this.checkDataAlreadyAddedInListOrNot(field.field_name,value,this.custmizedFormValue[field.field_name])){
              //this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
              this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
            }else{
              if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
              const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
              if(formValue[field.field_name] != '' && formValue[field.field_name] != null){
                custmizedFormValue.push(formValue[field.field_name])
                this.custmizedFormValue[field.field_name] = custmizedFormValue;
              }
              if(event){
                event.value = '';
              }
              this.templateForm.controls[field.field_name].setValue("");
              this.tempVal[field.field_name + "_add_button"] = true;
            }
          }  
        } else {
          if(parentfield != ''){
            if(formValue && formValue[parentfield.field_name] && formValue[parentfield.field_name][field.field_name].length > 0){
              this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = false;
            }else{
              this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
            }            
          }else{
            if(formValue && formValue[field.field_name] && formValue[field.field_name].length > 0){
              this.tempVal[field.field_name + "_add_button"] = false;
            }else{
              this.tempVal[field.field_name + "_add_button"] = true;
            }
          } 
        }
        break;
      case "typeahead":
        if(field.datatype == 'list_of_object' || field.datatype == 'chips' || field.datatype == 'object'){
          if (add) {
            if(parentfield != ''){
              const value = formValue[parentfield.field_name][field.field_name]
              const custmizedKey = this.custmizedKey(parentfield);
              if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][field.field_name] && this.checkDataAlreadyAddedInListOrNot(field.field_name,value, this.custmizedFormValue[custmizedKey][field.field_name])){
                //this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
                this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
              }else{
                if (!this.custmizedFormValue[custmizedKey]) this.custmizedFormValue[custmizedKey] = {};
                if (!this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
                const custmizedFormValueParant = Object.assign([],this.custmizedFormValue[custmizedKey][field.field_name])
                custmizedFormValueParant.push(value)            
                this.custmizedFormValue[custmizedKey][field.field_name] = custmizedFormValueParant;
                if(event){
                  event.value = '';
                }
                this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
                //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
                this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
              }
              
            }else{
              const value = formValue[field.field_name];
                if(this.custmizedFormValue[field.field_name] && this.checkDataAlreadyAddedInListOrNot(field.field_name,value,this.custmizedFormValue[field.field_name])){
                  //this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
                  this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
                }else{
                  if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
                  const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
                  custmizedFormValue.push(value)
                  this.custmizedFormValue[field.field_name] = custmizedFormValue;
                  if(event){
                    event.value = '';
                  }             
                  this.templateForm.controls[field.field_name].setValue('');
                  this.tempVal[field.field_name + "_add_button"] = true;
                }
            }  
          }else {
            if(parentfield != ''){
              const value = formValue[parentfield.field_name][field.field_name]  
              if(value == "add_new"){
                this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
                //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
                this.storeFormDetails(parentfield,field);
              }else{            
                this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = false;
              }
            }else{  
              const value = formValue[field.field_name]; 
              if(value == "add_new"){
                this.templateForm.controls[field.field_name].setValue('');
                this.storeFormDetails(parentfield,field);
              }else if(field.datatype == 'object' && field.onchange_get_next_form){
                this.onchangeNextForm = true;
                const reqCriteria = ["_id;eq;" + value._id + ";STATIC"];
                const reqParams = field.api_params;
                this.getDataForNextForm(reqParams,reqCriteria);
                this.tempVal[field.field_name + "_add_button"] = false;
              }else{           
                this.tempVal[field.field_name + "_add_button"] = false;
              }
            }          
          }
        }else if(field.datatype == 'text'){
          let typeaheadTextControl:any = {}
          if(parentfield != ''){
            typeaheadTextControl = this.templateForm.get(parentfield.field_name).get(field.field_name);    
          }else{
            typeaheadTextControl = this.templateForm.controls[field.field_name];
          } 
          typeaheadTextControl.setErrors(null);
        }
        break;
      case "dropdown":
        if(!add){
          let value:any='';
          if(parentfield != ''){            
            if(field.multi_select){
              const fValue:any = formValue[parentfield.field_name][field.field_name];
              if(fValue && fValue.length > 0){
                fValue.forEach(element => {
                  if(element == "add_new"){
                    value = "add_new";
                  }
                });
              }
            }else{
              if(field.datatype == 'object'){
                value = formValue[parentfield.field_name][field.field_name]['value'];               

              }else{
                value = formValue[parentfield.field_name][field.field_name];
              }
            } 
            if(value == "add_new"){
              this.storeFormDetails(parentfield,field);
              this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
              //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");              
            }             
          }else{ 
            if(field.multi_select){
              const fValue:any = formValue[field.field_name];
              if(fValue && fValue.length > 0){
                fValue.forEach(element => {
                  if(element == "add_new"){
                    value = "add_new";
                  }
                });
              }
            }else{
              if(field.datatype == 'object'){
                value = formValue[field.field_name]['value'];               

              }else{
                value = formValue[field.field_name];
              }
            } 
            if(value == "add_new"){
              this.storeFormDetails(parentfield,field);
              this.templateForm.controls[field.field_name].setValue('');              
            }            
          }
        }
        break;
      case "list_of_fields":
        let checkValue = 0;
        let list_of_field_data = formValue[field.field_name]
        let field_control = this.templateForm.get(field.field_name);        
        for (let index = 0; index < field.list_of_fields.length; index++) {
          const element = field.list_of_fields[index];
          const custmizedKey = this.custmizedKey(field);
          let custmizedData = '';
          let mendatory = false;
          if(element.is_mandatory){
            if(element && element.show_if && element.show_if != ''){
              if(this.checkFieldShowOrHide(element)){
                mendatory = true;
              }else{
                mendatory = false;
              }
            }else{
              mendatory = true;
            }            
          }
          if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][element.field_name]){
            custmizedData = this.custmizedFormValue[custmizedKey][element.field_name]
          }         
          switch (element.datatype) {
            case 'list_of_object':              
              if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                if(mendatory && custmizedData == ''){
                  if(custmizedData.length == 0){
                    checkValue = 1;
                   // this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                    this.notificationService.showAlert("bg-danger", "Please Enter " + element.label ,['Dismiss']);
                    return;
                  }
                }
              }else{
               // this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
                this.notificationService.showAlert('bg-danger','Entered value for '+element.label+' is not valid. !!!' ,['Dismiss']);
                return;
              }
              break; 
            case 'object':
              if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                if(mendatory){                  
                  checkValue = 1;
                  //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                  this.notificationService.showAlert("bg-danger", "Please Enter " + element.label ,['Dismiss']);
                  return;    
                }
              }else if(typeof list_of_field_data[element.field_name] != 'object'){
                //this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
                this.notificationService.showAlert('bg-danger','Entered value for '+element.label+' is not valid. !!!' ,['Dismiss']);
                return;
              }
              break;         
            default:
              break;
          }
          switch (element.type) {
            case 'list_of_string':
              if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                if(mendatory && custmizedData == ''){
                  if(custmizedData.length == 0){
                    checkValue = 1;
                    this.notificationService.showAlert("bg-danger", "Please Enter " + element.label, ['Dismiss']);
                    
                    return;
                  }
                }
              }else{
                this.notificationService.showAlert('bg-danger','Entered value for '+element.label+' is not valid. !!!', ['Dismiss']);
                return;
              }
              break;  
            case 'typeahead':
              if(element.datatype == "text"){
                if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                  if(mendatory){
                    if(custmizedData.length == 0){
                      checkValue = 1;
                      this.notificationService.showAlert("bg-danger", "Please Enter " + element.label, ['Dismiss']);
                      return;
                    }
                  }
                }else if(field_control.get(element.field_name).errors?.required || field_control.get(element.field_name).errors?.validDataText){
                  this.notificationService.showAlert('bg-danger','Entered value for '+element.label+' is invalidData. !!!', ['Dismiss']);
                  return;
                }

              }
              break;        
            default:
              if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                if(mendatory ){
                  checkValue = 1;
                  this.notificationService.showAlert("bg-danger", "Please Enter " + element.label, ['Dismiss']);
                }
              }
              break;
          }


          if(element.primary_key_for_list){
            let primary_key_field_name = element.field_name;
            let primary_key_field_value = formValue[field.field_name][element.field_name];            
            let alreadyAdded = false;
            if(this.custmizedFormValue[field.field_name]){
              let list = this.custmizedFormValue[field.field_name];
              alreadyAdded = this.checkDataAlreadyAddedInListOrNot(primary_key_field_name,primary_key_field_value,list);
            }
            if(alreadyAdded){
              this.notificationService.showAlert('bg-danger','Entered value for '+element.label+' is already added. !!!', ['Dismiss']);
              return;
            }
          }
          
        };
        if (checkValue == 0) {
          if(this.listOfFieldsUpdateIndex != -1){
            //if(this.updateMode){
              let updateCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
              Object.keys(formValue[field.field_name]).forEach(key => {
                updateCustmizedValue[this.listOfFieldsUpdateIndex][key] = formValue[field.field_name][key];
              })
// pending for review by vikash (from)
              const keyName=field.field_name+'_'+field.type;
              if(this.custmizedFormValue[keyName]){
                Object.keys(this.custmizedFormValue[keyName]).forEach(childkey => {
                  updateCustmizedValue[this.listOfFieldsUpdateIndex][childkey] = this.custmizedFormValue[keyName][childkey];
                })
              }
              if(this.dataListForUpload[keyName]){
                Object.keys(this.dataListForUpload[keyName]).forEach(childkey => {                  
                  updateCustmizedValue[childkey] = this.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);;
                })
              }
              if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
                this.checkBoxFieldListValue.forEach(listofcheckboxfield => {
                  const fieldName = listofcheckboxfield.field_name;
                  if (this.staticData[listofcheckboxfield.ddn_field] && formValue[field.field_name][fieldName]) {                    
                    const listOfCheckboxData = [];
                    let data = formValue[field.field_name][fieldName];                    
                    let currentData = this.staticData[listofcheckboxfield.ddn_field];
                    if(data && data.length > 0){
                      data.forEach((data, i) => {
                        if (data) {
                          listOfCheckboxData.push(currentData[i]);
                        }
                      });
                    }
                    updateCustmizedValue[this.listOfFieldsUpdateIndex][fieldName] = listOfCheckboxData;                    
                  }
                });
              }
              // pending for review by vikash (to)
              this.custmizedFormValue[field.field_name] =   updateCustmizedValue; 
              this.custmizedFormValue[keyName] = {}
            // }else{
            //   const updateCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
            //   updateCustmizedValue[this.listOfFieldsUpdateIndex] = JSON.parse(JSON.stringify(formValue[field.field_name]))
            //   this.custmizedFormValue[field.field_name] =   updateCustmizedValue  ;  
            //   const keyName=field.field_name+'_'+field.type;
            //   this.custmizedFormValue[keyName] = {}        
            // }
            this.refreshListofField(field,false);            
          }else{
            if(field.datatype == 'key_value'){
              if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = {};
              const listOfFieldData = formValue[field.field_name]
              if(listOfFieldData.key && listOfFieldData.key != '' && listOfFieldData.value && listOfFieldData.value != ''){
                this.custmizedFormValue[field.field_name][listOfFieldData.key] = listOfFieldData.value;
              }              
            }else{
              if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
              const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
              const listOfFieldData = JSON.parse(JSON.stringify(formValue[field.field_name]))
              const keyName=field.field_name+'_'+field.type;
              if(this.custmizedFormValue[keyName]){
                Object.keys(this.custmizedFormValue[keyName]).forEach(childkey => {
                  listOfFieldData[childkey] = this.custmizedFormValue[keyName][childkey];
                })
              }
              if(this.dataListForUpload[keyName]){
                Object.keys(this.dataListForUpload[keyName]).forEach(childkey => {                 
                  listOfFieldData[childkey] = this.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);
                })
              }
              if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
                this.checkBoxFieldListValue.forEach(listofcheckboxfield => {
                  const fieldName = listofcheckboxfield.field_name;
                  if (this.staticData[listofcheckboxfield.ddn_field] && formValue[field.field_name][fieldName]) {                    
                    const listOfCheckboxData = [];
                    let data = formValue[field.field_name][fieldName];                    
                    let currentData = this.staticData[listofcheckboxfield.ddn_field];
                    if(data && data.length > 0){
                      data.forEach((data, i) => {
                        if (data) {
                          listOfCheckboxData.push(currentData[i]);
                        }
                      });
                    }
                    listOfFieldData[fieldName] = listOfCheckboxData;                    
                  }
                });
              }
              
              custmizedFormValue.push(listOfFieldData);
              this.custmizedFormValue[field.field_name] = custmizedFormValue;
              // if (field.onchange_api_params && field.onchange_call_back_field) {
              //   const value = this.getFormValue(false);
              //   this.changeDropdown(field.onchange_api_params, field.onchange_call_back_field, field.onchange_api_params_criteria, value,field.onchange_data_template);
              // }
              this.custmizedFormValue[keyName] = {}              
            }
            this.refreshListofField(field,true);
          }
          if(field.do_not_refresh_on_add && this.listOfFieldsUpdateIndex == -1){
            this.tableFields.forEach(tablefield => {
              if(tablefield.field_name == field.field_name){
                tablefield.list_of_fields.forEach(fld => {
                  if(!fld.do_not_refresh_on_add){
                    this.templateForm.get(tablefield.field_name).get(fld.field_name).setValue('');
                  }
                });
              }
            });
          }else{
            this.templateForm.get(field.field_name).reset(); 
          }         
        }
        break;
      case 'grid_selection':
      case 'grid_selection_vertical':
        //----------------------this is for confirm modal to add or remove (form component confirm modal) when grid selection field is open.
        this.dataShareService.setIsGridSelectionOpenOrNot(false);
        this.curTreeViewField = field;
        this.currentTreeViewFieldParent = parentfield;
        if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
        let selectedData = this.getGridSelectedData(this.custmizedFormValue[field.field_name],field);
        const gridModalData = {
          "field": this.curTreeViewField,
          "selectedData":selectedData,
          "object": this.getFormValue(true)
        }
        //this.modalService.open('grid-selection-modal', gridModalData);
        this.openGridSelectionModal(field);
        break;
      default:
        break;
    }
    
    if (field.onchange_api_params && field.onchange_call_back_field) {
      // if(field.type == 'list_of_fields' && field.onchange_api_params.indexOf("CLTFN") >= 0){
      //   let formValue = this.getFormValue(true);
      //   this.changeDropdown(field.onchange_api_params, field.onchange_call_back_field, field.onchange_api_params_criteria, formValue,field.onchange_data_template);
      // }else if(field.type != 'list_of_fields'){
        let formValue = this.getFormValue(false);
        this.changeDropdown(field, formValue,field.onchange_data_template);
      // }
    }

    if (field.onchange_function && field.onchange_function_param && field.onchange_function_param != "") {
      switch (field.onchange_function_param) {        
          case 'autopopulateFields':
            this.commonFunctionService.autopopulateFields(this.templateForm);
            break;
        default:
         this.inputOnChangeFunc('',field);
      }
    }
    let objectValue:string = "";
    let supporting_field_type = "";
    if(typeof formValue[field.field_name] == 'object'){
      if('COMPLETE_OBJECT' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["COMPLETE_OBJECT"];
        delete formValue[field.field_name]["COMPLETE_OBJECT"]
        this.selectedRow = objectValue;
        this.complete_object_payload_mode = true;
        supporting_field_type = "COMPLETE_OBJECT";
      } 
      if('FORM_FIELDS' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["FORM_FIELDS"];
        delete formValue[field.field_name]["FORM_FIELDS"]
      }
      if('STATIC_FIELDS' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["STATIC_FIELDS"];
        delete formValue[field.field_name]["STATIC_FIELDS"]
      }
      if(objectValue != '' && typeof objectValue == 'object'){
        this.updateDataOnFormField(objectValue);   
        if(supporting_field_type == "COMPLETE_OBJECT") {
          this.getStaticDataWithDependentData();     
        }    
      }      
    }  
    else if(parentfield && typeof formValue[parentfield.field_name][field.field_name] == 'object'){
      if('COMPLETE_OBJECT' in formValue[parentfield.field_name][field.field_name]){
        objectValue =formValue[parentfield.field_name][field.field_name]["COMPLETE_OBJECT"];
        delete formValue[parentfield.field_name][field.field_name]["COMPLETE_OBJECT"]
        this.selectedRow = objectValue;
        this.complete_object_payload_mode = true;
      } 
      if('FORM_FIELDS' in formValue[parentfield.field_name][field.field_name]){
        objectValue =formValue[parentfield.field_name][field.field_name]["FORM_FIELDS"];
        delete formValue[parentfield.field_name][field.field_name]["FORM_FIELDS"]
      }
     if(objectValue != '' && typeof objectValue == 'object'){

      Object.keys(objectValue).forEach(key => {
        this.templateForm.get(parentfield.field_name).get(key).setValue(objectValue[key]);
        //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[key].patchValue(objectValue[key]);
      });
        // this.updateDataOnFormField(objectValue);   
        // this.getStaticDataWithDependentData();     
      }      
    }  
 
    if (field.type == 'typeahead') {
      this.clearTypeaheadData();
    }

  } 



  refreshListofField(field,updatemode){    
    if(field.do_not_refresh_on_add && updatemode){
      this.tableFields.forEach(tablefield => {
        if(tablefield.field_name == field.field_name){
          tablefield.list_of_fields.forEach(fld => {
            if(!fld.do_not_refresh_on_add){
              this.templateForm.get(tablefield.field_name).get(fld.field_name).setValue('');
            }
          });
        }
      });
    }else{
      this.templateForm.get(field.field_name).reset(); 
    } 
    this.listOfFieldsUpdateIndex = -1
    this.listOfFieldUpdateMode = false;
  }

  modifiedGridColumns(gridColumns){
    if(gridColumns.length > 0){     
      gridColumns.forEach(field => {
        if(this.commonFunctionService.isNotBlank(field.show_if)){
          if(!this.showIf(field)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }                
        }else{
          field['display'] = true;
        }
      });
    }
    return gridColumns;
  }
  
  storeFormDetails(parent_field:any,field:any,index?){
    let targetFieldName ={}
    targetFieldName['form'] = {}
    targetFieldName['custom'] = [];

    let updateMode =  this.updateMode;
    let formData = this.getFormValue(true);
    if(field && field.form_field_name){
      const nextFormReference = {
        '_id':this.nextFormData._id,
        'name':this.nextFormData.name
      }
      formData[field.form_field_name] = nextFormReference;
      //targetFieldName = formData[field.field_name]
      updateMode = true;
    }
    if(this.commonFunctionService.isNotBlank(field.add_new_target_field)){
      targetFieldName['form'][field.add_new_target_field] = this.lastTypeaheadTypeValue
    }else if(field){
      switch (field.type) {
        case "list_of_fields":
        case "grid_selection":
          let currentFieldData = formData[field.field_name];
          if(currentFieldData){
              if(index != undefined && index >= 0){        
                targetFieldName['form'] = currentFieldData[index];
                targetFieldName['updataModeInPopupType'] = true;
              }else {
                targetFieldName['custom'] = currentFieldData;
              }
          }
          break;      
        default:
          break;
      }
      
     
        
      // const listOfFields = field.list_of_fields;
      // let element:any = {}
      // if(listOfFields && listOfFields.length > 0){
      //   element = listOfFields[0]
      // }
      // if(element && element.field_name){
      //   targetFieldName[element.field_name] = "";
      // }      
    } 
    if(this.commonFunctionService.isNotBlank(field.moveFieldsToNewForm)){
      if(field.moveFieldsToNewForm && field.moveFieldsToNewForm.length > 0){
        field.moveFieldsToNewForm.forEach(keyValue => {
          const sourceTarget = keyValue.split("#");
          let key = sourceTarget[0];
          let valueField = sourceTarget[1];
          let formValue = {};
          if(field && field.form_value_index >= 0 && this.multipleFormCollection.length >= 1){
            const storeFormData = this.multipleFormCollection[field.form_value_index];
            const formData = storeFormData['form_value'];            
            formValue = formData;            
          }else{
            formValue = this.getFormValue(false)
          }
          let multiCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
          formValue = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,this.getFormValue(false));
          let value = this.commonFunctionService.getObjectValue(valueField,formValue);
          targetFieldName['form'][key] = value;
        });
      }
    }   
    let form = {
      "collection_name":this.currentMenu.name,
      "data":formData,
      "form":this.form,
      "parent_field":parent_field,
      "current_field":field,
      "next_form_data":targetFieldName,
      "updateMode" : updateMode,
      "form_value" : this.getFormValue(false)
    }
    if(field){
      switch (field.type) {
        case "list_of_fields":
        case "grid_selection":
          form['index'] = index;
          break;      
        default:
          break;
      }
      
    }
    this.multipleFormCollection.push(form);
    let id = '';
    if(field && field.type == "list_of_fields"){
      let buttonLabel = "";
      if(index != undefined && index >= 0){
        buttonLabel = 'Update';
      }else{
        buttonLabel = 'Add';
      }
      if(field.list_of_fields && field.list_of_fields.length > 0){
        let fieldList:any = JSON.parse(JSON.stringify(field.list_of_fields));
        if(fieldList && fieldList.length > 0 && index == undefined){
          let curField = JSON.parse(JSON.stringify(field));
          curField['add_list_field'] = 'add';
          fieldList.push(curField);
        }
        let form = {
          "details": {
              "class": "",
              "collection_name":"",
              "bulk_update":false
              },
          "tab_list_buttons": [
              {
                  "label": buttonLabel,
                  "onclick": {
                          "api": "add", 
                          "action_name": "", 
                          "close_form_on_succes": false
                      },
                  "type": "button",
                  "field_name": "save",
                  "api_params": "",
                  "show_if":"",
                  "disable_if":""
              },
              {
                "label": "Ok",
                "onclick": {
                        "api": "close", 
                        "action_name": "", 
                        "close_form_on_succes": false
                    },
                "type": "button",
                "field_name": "",
                "api_params": "",
                "show_if":"",
                "disable_if":""
            }
          ],
          "tableFields": fieldList,
          "api_params": null,
          "label": field.label
          }
        this.loadNextForm(form);
      }else{

      }
    }else{
      if(field.add_new_form && field.add_new_form._id){
        id = field.add_new_form._id;
      }
      this.getNextFormById(id);
      this.addNewRecord = false;
      if(!this.enableNextButton && field && field.find_child_form){
        const reqCriteria = ["collection.name;eq;" + this.currentMenu.name + ";STATIC"];
        const reqParams = 'scheduled_task_form';
        this.getDataForNextForm(reqParams,reqCriteria);
      }      
    }    
  }

  private getDataForNextForm(reqParams,reqCriteria) {    
    const request = this.restService.getDataForGrid(1, {}, { 'name': reqParams }, [], {}, '');
    const crList = this.restService.getCriteriaList(reqCriteria, {});
    request.data.crList = crList;
    this.apiService.getNextFormData(request);
  }



  loadNextForm(form: any){    
    this.form = form;
    this.resetFlagsForNewForm();
    this.setForm();    
    let nextFormData:any = {}
    if(this.multipleFormCollection.length > 0){
      nextFormData = this.multipleFormCollection[this.multipleFormCollection.length -1];
    }
    if(this.updateAddNew){
      this.getNextFormData(nextFormData);
    }
    let cdata = {};
    let fData = {};
    if(nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['custom']){
       cdata = nextFormData['next_form_data']['custom'];
    }
    if(nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['form']){
       fData = nextFormData['next_form_data']['form'];
    }  
    if(nextFormData['index'] != undefined && nextFormData['index'] >= 0){
      this.nextFormUpdateMode = true;
    } 
    
    if(nextFormData && nextFormData['current_field'] && nextFormData['current_field']['type'] && nextFormData['index'] == undefined){
      switch (nextFormData['current_field']['type']) {
        case 'list_of_fields':
        case 'grid_selection':
          const fieldName = nextFormData['current_field']['field_name'];
          if(cdata){
            this.custmizedFormValue[fieldName] = cdata;
          }
          break;      
        default:
          break;
      }
      
      
    }
    if(this.editedRowIndex >= 0){
      this.getStaticDataWithDependentData();
      // this.updateDataOnFormField(this.childData);
      // this.editedRowData(this.childData);
    }
    if(nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['updataModeInPopupType']){
      this.editedRowData(fData);
    }else{
      this.updateDataOnFormField(fData);    
    }
    let nextFormFocusedFieldname = '';
    for (let key in fData) {
      nextFormFocusedFieldname = key;
      break;
    }
    if (this.tableFields && this.tableFields.length > 0) {
      for (let i = 0; i < this.tableFields.length; i++) {
        const element = this.tableFields[i];
        if(nextFormFocusedFieldname == element.field_name){
          this.previousFormFocusField = element;
          break;
        }        
      }
    }
  }

  getNextFormData(formData){
    if(formData){
      let parent:any = '';
      let child:any = '';
      if(formData['parent_field']){
        parent = formData['parent_field'];
      }
      if(formData['current_field']){
        child = formData['current_field'];
      }
      let formValue = formData['data'];
      let fieldValue:any = '';
      if(parent != ''){
        fieldValue = formValue[parent.field_name][child.field_name];
      }else{
        fieldValue = formValue[child.field_name];
      }    
      if(fieldValue && fieldValue._id && fieldValue._id != ''){
        //console.log(fieldValue._id);
        const params = child.api_params;
        if(params && params != ''){
          const criteria = ["_id;eq;"+fieldValue._id+";STATIC"]
          const crList = this.restService.getCriteriaList(criteria,{});
          const payload = this.restService.getDataForGrid(1,{},{'name':params},[],{},'');
          payload.data.crList = crList;
          this.apiService.getGridData(payload);
          this.updateAddNew = true;
        }else{
          this.updateAddNew = false;
        }     
      }else{
        this.updateAddNew = false;
      }
    }else{
      this.updateAddNew = false;
    }
  }

  changeDropdown(field, object,data_template) {
    let params = field.onchange_api_params;
    let callback = field.onchange_call_back_field;
    let criteria = field.onchange_api_params_criteria;
    const paramlist = params.split(";");
    if(paramlist.length>1){
      
    }else{
      // if(callback != ''){        
      //   const fieldName = {
      //     "field" : callback
      //   }
      //   this.commonFunctionService.resetStaticDataByKey(fieldName);
      // }
      const staticModal = []
      
      if( params.indexOf("CLTFN") >= 0){
        // const calculatedCost =  this.commonFunctionService.calculateAdditionalCost(this.getFormValue(true));
        // this.updateDataOnFormField(calculatedCost);
      }
      else{
        staticModal.push(this.restService.getPaylodWithCriteria(params, callback, criteria, object))      
        if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
          if(field && field.formValueAsObjectForQtmp){
            staticModal[0]["data"]=this.getFormValue(false);
          }else{
            staticModal[0]["data"]=this.getFormValue(true);
          }
        }
        // this.store.dispatch(
        //   new CusTemGenAction.GetStaticData(staticModal)
        // )
        this.apiService.getStatiData(staticModal);
      }
   }
  }
  inputOnChangeFunc(parent,field) {
    if(field.type == 'checkbox' || field.type == 'date'){
      if (field.onchange_api_params && field.onchange_call_back_field) {        
        let formValue = this.getFormValue(false);
        this.changeDropdown(field,formValue,field.data_template);       
      }
    }
    if (field.onchange_function && field.onchange_function_param && field.onchange_function_param != "") {
      let toatl = 0;
      let update_field = "";
      let tamplateFormValue = this.getFormValue(true);
      let tamplateFormValue1 = this.getFormValue(false);
      let tamplateFormValue3 = this.custmizedFormValue;
      let calFormValue = {};
      let list_of_populated_fields = [];
      switch (field.onchange_function_param) {        
        case 'calculate_quote_amount':          
          calFormValue = this.commonFunctionService.calculate_quotation(tamplateFormValue,"standard", field);
          this.updateDataOnFormField(calFormValue);
        break;

        case 'calculate_automotive_quotation':          
          calFormValue = this.commonFunctionService.calculate_quotation(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
        break;
        case 'calculate_po_row_item':          
          calFormValue = this.commonFunctionService.calculate_po_row_item(tamplateFormValue1,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
        break;
        case 'update_invoice_total_on_custom_field':          
          calFormValue = this.commonFunctionService.update_invoice_total_on_custom_field(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
        break;
    
        case 'calculate_lims_invoice':          
          calFormValue = this.commonFunctionService.calculate_lims_invoice(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
        break;
    
        case 'calculate_lims_invoice_with_po_items':
          let val = this.commonFunctionService.calculate_lims_invoice_with_po_items(tamplateFormValue,"","");
          this.updateDataOnFormField(val);
        break;

        // case 'quote_amount_via_sample_no':
        //   calFormValue = this.commonFunctionService.quote_amount_via_sample_no(tamplateFormValue,this.custmizedFormValue['quotation_param_methods']);
        //   this.updateDataOnFormField(calFormValue);
        // break;
        // case 'quote_amount_via_discount_percent':
        //   calFormValue = this.commonFunctionService.quote_amount_via_discount_percent(this.custmizedFormValue['quotation_param_methods'], tamplateFormValue);
        //   this.updateDataOnFormField(calFormValue);
        // break;

        case 'samplingAmountAddition':          
          calFormValue = this.commonFunctionService.samplingAmountAddition(tamplateFormValue);
          this.updateDataOnFormField(calFormValue);          
        break;
      
        case 'populate_fields':
          list_of_populated_fields = [
            {"from":"fax","to":"billing_fax"},
            {"from":"mobile","to":"billing_mobile"},
            {"from":"phone","to":"billing_tel"},
            {"from":"city","to":"billing_city"},
            {"from":"state","to":"billing_state"},
            {"from":"country","to":"billing_country"},
            {"from":"address_line2","to":"billing_address_line2"},
            {"from":"gst_no","to":"billing_gst"},
            {"from":"email","to":"billing_contact_person_email"},
            {"from":"address_line1","to":"billing_address"},
            {"from":"pincode","to":"billing_pincode"},
            {"from":"first_name+last_name+ ","to":"billing_contact_person"},
            {"from":"account.name","to":"billing_company"},
        
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue); 
        break;
        case 'job_card_series':
          list_of_populated_fields=[
            {"from":"tl_name.name+service_line.name+parent_company.name+/","to":"job_card_name"},
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue); 
        break;
        case 'calculation_travel_claim_sheet':
          calFormValue = this.commonFunctionService.calculateTotalFair(this.templateForm.getRawValue());
          this.updateDataOnFormField(calFormValue); 
        break;
        case 'populate_fields_for_direct_order':
          list_of_populated_fields = [
            {"from":"fax","to":"billing_fax"},
            {"from":"mobile","to":"billing_mobile"},
            {"from":"phone","to":"billing_tel"},
            {"from":"city","to":"billing_city"},
            {"from":"state","to":"billing_state"},
            {"from":"country","to":"billing_country"},
            {"from":"address_line2","to":"billing_address_line2"},
            {"from":"gst_no","to":"billing_gst"},
            {"from":"email","to":"billing_contact_person_email"},
            {"from":"address_line1","to":"billing_address"},
            {"from":"pincode","to":"billing_pincode"},
            {"from":"contact.name","to":"billing_contact_person"},
            {"from":"account.name","to":"billing_company"},
        
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue); 
        break;
        case 'populate_fields_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"fax","to":"billing_fax"},
            {"from":"mobile","to":"billing_mobile"},
            {"from":"phone","to":"billing_tel"},
            {"from":"city","to":"billing_city"},
            {"from":"state","to":"billing_state"},
            {"from":"country","to":"billing_country"},
            {"from":"address_line2","to":"billing_address_line2"},
            {"from":"gst_no","to":"billing_gst"},
            {"from":"email","to":"billing_contact_person_email"},
            {"from":"address_line1","to":"billing_address"},
            {"from":"pincode","to":"billing_pincode"},
            {"from":"first_name+last_name+ ","to":"billing_contact_person"},
            {"from":"sample_booking.name","to":"billing_company"},

          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue); 
        break;
        case 'populate_fields_for_report':
          list_of_populated_fields = [
            {"from":"mobile","to":"reporting_mobile"},
            {"from":"phone","to":"reporting_tel"},
            {"from":"city","to":"reporting_city"},
            {"from":"state","to":"reporting_state"},
            {"from":"country","to":"reporting_country"},
            {"from":"gst_no","to":"reporting_gst"},
            {"from":"email","to":"reporting_contact_person_email"},
            {"from":"address_line1","to":"reporting_address"},
            {"from":"pincode","to":"reporting_pincode"},
            {"from":"first_name+last_name+ ","to":"reporting_contact_person"},
            {"from":"account.name","to":"reporting_company"},
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue); 
          // this.commonFunctionService.populate_fields_for_report(this.templateForm);
        break;
        case 'populate_fields_for_report_direct_order':
          list_of_populated_fields = [
          {"from":"mobile","to":"reporting_mobile"},
          {"from":"phone","to":"reporting_tel"},
          {"from":"city","to":"reporting_city"},
          {"from":"state","to":"reporting_state"},
          {"from":"country","to":"reporting_country"},
          {"from":"gst_no","to":"reporting_gst"},
          {"from":"email","to":"reporting_contact_person_email"},
          {"from":"address_line1","to":"reporting_address"},
          {"from":"address_line2","to":"reporting_address_line2"},
          {"from":"pincode","to":"reporting_pincode"},
          {"from":"contact.name","to":"reporting_contact_person"},
          {"from":"account.name","to":"reporting_company"},
        ]
        calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
        this.updateDataOnFormField(calFormValue); 
        // this.commonFunctionService.populate_fields_for_report(this.templateForm);
        break;
        case 'populate_fields_for_report_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"mobile","to":"reporting_mobile"},
            {"from":"phone","to":"reporting_tel"},
            {"from":"city","to":"reporting_city"},
            {"from":"state","to":"reporting_state"},
            {"from":"country","to":"reporting_country"},
            {"from":"gst_no","to":"reporting_gst"},
            {"from":"email","to":"reporting_contact_person_email"},
            {"from":"address_line1","to":"reporting_address"},
            {"from":"pincode","to":"reporting_pincode"},
            {"from":"first_name+last_name+ ","to":"reporting_contact_person"},
            {"from":"sample_booking.name","to":"reporting_company"},
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.populate_fields_for_report(this.templateForm);
        break;
        case 'manufactured_as_customer':
          list_of_populated_fields = [
            {"from":"account.name", "to":"sample_details.mfg_by"}
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.manufactured_as_customer(this.templateForm);
        break;
        case 'manufactured_as_customer_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"sample_booking.name", "to":"sample_details.mfg_by"}
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.manufactured_as_customer(this.templateForm);
        break;
        case 'supplied_as_customer':
          list_of_populated_fields = [
            {"from":"account.name", "to":"sample_details.supplied_by"}
]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.supplied_as_customer(this.templateForm);
          break;
          case 'supplied_as_customer_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"sample_booking.name", "to":"sample_details.supplied_by"}
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.supplied_as_customer(this.templateForm);
        break;
        case 'buggetForcastCalc':
          this.commonFunctionService.buggetForcastCalc(this.templateForm.getRawValue());
        break;
        case 'calculate_next_calibration_due_date':
            this.commonFunctionService.calculate_next_calibration_due_date(this.templateForm.getRawValue());
        break;
        case 'get_percent':
          calFormValue = this.commonFunctionService.getPercent(this.templateForm.getRawValue(),parent, field);
          this.updateDataOnFormField(calFormValue);
        break;
        case 'CALCULATE_TOTAL_AMOUNT':
            calFormValue = this.commonFunctionService.calculateTotalAmount(tamplateFormValue)
            this.updateDataOnFormField(calFormValue);
        default:
          break;


      }
    }

  }

  async dismissModal(){
    if(this.updateMode){      
      Object.keys(this.custmizedFormValue).forEach(key => {
        if(this.custmizedFormValue[key] != null && Array.isArray(this.custmizedFormValue[key])){
          this.custmizedFormValue[key].forEach((element: any) => {
            if(element.status == 'I'){
              element.status = 'A';
            }
          });
        }
      });
    }else{
      this.custmizedFormValue = {};
    }
    this.resetForm();
    //this.templateForm.reset();
    //this.formGroupDirective.resetForm()
    this.updateMode=false;
    this.dataListForUpload = []
    this.filePreviewFields = [];
    this.copyStaticData = {};
    this.apiService.resetStaticAllData();
    // this.modal.dismiss();
    // this.modal.dismiss(null, null, this.form._id);
    // this.modal.dismiss{
    //   "dissmised": true
    // });
    this.checkFormAfterCloseModel();
    //this.commonFunctionService.resetStaticAllData();
    
  }

  fileDrop: boolean = false;
  /**
	 * handle file from browsing
	 */
   fileBrowseHandler(parent,field,files) {
    this.curFileUploadField = field;
    this.curFileUploadFieldparentfield = parent;
    this.fileDrop = false;
    this.prepareFilesList(files.files);
  }

	/**
	 * Delete file from files list
	 * @param index (File index)
	 */
  deleteFile(index: number) {
    this.uploadData.splice(index, 1);
  }

	/**
	 * Simulate the upload process
	 */




  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      this.uploadFilesData.push(file);
      var reader = new FileReader();
      reader.onload = this.readNoticeFile
      reader.readAsDataURL(file);
    }
    // console.log(this.files);
    // console.log(this.uploadData);
    this.fileUploadResponce(this.uploadData)

  }
  readNoticeFile = (e) => {
    var rxFile = this.uploadFilesData[0];
    this.uploadFilesData.splice(0, 1);
    this.uploadData.push({
      fileData: e.target.result.split(',')[1],
      fileName: rxFile.name,
      fileExtn:  rxFile.name.split(".").pop(),
      // size: rxFile.size,
      innerBucketPath: rxFile.name,
      log: this.storageService.getUserLog()
    });

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
        this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
        this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue('');
      }
    }else{    
      if(this.dataListForUpload[this.curFileUploadField.field_name] && this.dataListForUpload[this.curFileUploadField.field_name].length > 0){
        let fileName = this.commonFunctionService.modifyFileSetValue(this.dataListForUpload[this.curFileUploadField.field_name]);
        this.templateForm.get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
        this.templateForm.get(this.curFileUploadField.field_name).setValue('');
      }
    }
    // if(this.dataListForUpload[this.curFileUploadField.field_name] && this.dataListForUpload[this.curFileUploadField.field_name].length > 0){
    //   this.dataListForUpload[this.curFileUploadField.field_name].forEach(element => {
    //     this.uploadFilesList = Object.assign([], this.uploadFilesList);
    //     if(element._id){
    //       this.uploadFilesList.push(element)
    //     }else{
    //       this.uploadFilesList.push({uploadData:[element]})
    //     }        
    //   });
    // } 
    // for(var i=0 ; i<response.length ; i++){ 
    //   let element = response[i];
    //   //this.dataListForUpload[this.curFileUploadField.field_name].push(response[i]); 
    //   this.uploadFilesList = Object.assign([], this.uploadFilesList);
    //     if(element._id){
    //       this.uploadFilesList.push(element)
    //     }else{
    //       this.uploadFilesList.push({uploadData:[element]})
    //     }    
    //   var item = response[i];
    //   var obj = {uploadData:[item]};      
    //   this.uploadFilesList.push(obj)
    // }       
    
    // Object.keys(this.templateForm.value).forEach(key => {   
    //   let list = []
    //   let array = [];

    //   if(this.dataListForUpload[key] != "" && this.dataListForUpload[key] != null && this.dataListForUpload[key].length > 0){
    //     this.dataListForUpload[key].forEach(element => {
    //       if(element._id){
    //         array.push(element);
    //       }
    //       else{
    //         array.push({uploadData:[element]})
    //       }
    //       // var obj = {uploadData:[element]}; 
    //       // this.dataListForUpload[key].push(obj)
    //     });
    //   }
     
    //   if(key != this.curFileUploadField.field_name && array.length > 0){
    //     this.templateForm.controls[key].setValue(array);
    //   }
    // })

    //this.templateForm.controls[this.curFileUploadField.field_name].setValue(this.uploadFilesList);
    //this.uploadFilesList = [];
    // if (response && response.length > 0) {
    //   this.notificationService.notify("bg-success", response.length + " Documents Uploaded successfull !!!");      
    // }
    // this.curFileUploadField = {};
  }
  // isDisable(parent,chield){
  //   const  formValue = this.getFormValue(true); 
  //   let tobedesabled;
  //   if(parent == ''){
  //     tobedesabled = this.commonFunctionService.isDisable(chield,this.updateMode,formValue)
  //     if(tobedesabled){
  //       if(!this.templateForm.get(chield.field_name).disabled){
  //         this.templateForm.get(chield.field_name).disable()
  //       }        
  //     }else{
  //       if(this.templateForm.get(chield.field_name).disabled){
  //         this.templateForm.get(chield.field_name).enable()
  //       }        
  //     }
  //   }else{
  //     tobedesabled = this.commonFunctionService.isDisable(chield,this.updateMode,formValue)
  //     if(tobedesabled){
  //       this.templateForm.get(parent).get(chield.field_name).disable()
  //     }else{
  //       this.templateForm.get(parent).get(chield.field_name).enable()
  //     }
  //   }   
        
  //   return tobedesabled;
  // }

  focusField(parent,key){
    const  id = key._id + "_" + key.field_name;
    let field:any = {};
    if(parent == ''){
      if(this.focusFieldParent && this.focusFieldParent.field_name && this.focusFieldParent.field_name != ''){
        parent = this.focusFieldParent;
      }
    }
    if(parent != ""){
      field = this.templateForm.get(parent.field_name).get(key.field_name);
    }else{
      field = this.templateForm.get(key.field_name);
    }
    if(field && field.touched){
      this.checkFormFieldAutfocus = false;
      if(this.previousFormFocusField && this.previousFormFocusField._id){
        this.previousFormFocusField = {};
        this.focusFieldParent={};
      }
    }else if(field == undefined){
      this.previousFormFocusField = {};
      this.focusFieldParent={};
    }
    const invalidControl = document.getElementById(id);
    if(invalidControl != null){
      invalidControl.focus();
      this.checkFormFieldAutfocus = false;
      if(this.previousFormFocusField && this.previousFormFocusField.type == 'list_of_fields' && this.previousFormFocusField.datatype == 'list_of_object_with_popup'){
        this.previousFormFocusField = {};
      }
    }
  }

  handleDisabeIf(){
    if(this.checkFormFieldAutfocus && this.tableFields.length > 0){
      if(this.previousFormFocusField && this.previousFormFocusField._id){
        this.focusField("",this.previousFormFocusField)        
      }else{
        if(this.previousFormFocusField == undefined || this.previousFormFocusField._id == undefined){
          for (const key of this.tableFields) {
            if(key.type == "stepper"){
              if(key.list_of_fields && key.list_of_fields != null && key.list_of_fields.length > 0){
                for (const step of key.list_of_fields) {
                  if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                    for (const field of step.list_of_fields) {
                      if (field.field_name) {
                        this.focusField(step,field);  
                        break;
                      }
                    }
                  }                
                }
              }
            }else if (key.field_name) {
              this.focusField("",key);  
              break;
            }              
          }
        }
      }
    }
    if(this.disableIfFieldList.length > 0){
      this.disableIfFieldList.forEach(element => {
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          this.isDisable(element.parent,element);
        }else{
          this.isDisable('',element)
        }
      });
    }
    if(this.showIfFieldList.length > 0){
      this.showIfFieldList.forEach(element => {
        let id = '';
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          id = element._id;
        }else{
          id = element._id;
        }
        let elementDetails = document.getElementById(id);
        if(!this.showIf(element)){          
          if(elementDetails && elementDetails != null){
            const classes = Array.from(elementDetails.classList)
            if(!classes.includes('d-none')){
              this.removeClass(elementDetails,' d-inline-block');
              elementDetails.className += " d-none";
              element['show'] = false;
              const objectValue = this.templateForm.getRawValue();
              if(element.type != "group_of_fields" && element.type != "list_of_fields" && objectValue[element.field_name] && objectValue[element.field_name] != ''){
                this.templateForm.get(element.field_name).setValue('');
              } 
              if(element.type == "group_of_fields" || element.type == "list_of_fields"){
                this.templateForm.get(element.field_name).reset();
                element.list_of_fields.forEach(field => {
                  if(field.type == 'list_of_string' || field.datatype == "list_of_object" || element.datatype == "chips" || element.datatype == "chips_with_mask"){
                    const custmizedKey = this.commonFunctionService.custmizedKey(element);            
                    if (this.custmizedFormValue[custmizedKey]){ 
                      if (this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
                    }
                  }
                });
              }  
              if(element.type == 'list_of_string' || element.datatype == "list_of_object" || element.datatype == "chips" || element.datatype == "chips_with_mask"){
                if (this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = [];
              }         
              if(element.is_mandatory){
                if(this.templateFormControl[element.field_name].status == 'INVALID'){
                  this.templateForm.get(element.field_name).clearValidators();
                  this.templateForm.get(element.field_name).updateValueAndValidity();
                }              
              }
            }            
          }                
        }else{          
          if(elementDetails && elementDetails != null){
            const classes = Array.from(elementDetails.classList)
            if(!classes.includes('d-inline-block')){
              this.removeClass(elementDetails,' d-none');
              elementDetails.className += " d-inline-block"; 
              element['show'] = true;
              if(element.is_mandatory){
                if(this.templateFormControl[element.field_name].status == 'VALID'){
                  this.templateForm.get(element.field_name).setValidators([Validators.required]);
                  this.templateForm.get(element.field_name).updateValueAndValidity();
                }              
              }
            }            
          }
        }
      });
      return true;
    }
    if(this.disableIfFieldList.length == 0 && this.showIfFieldList.length == 0){
      return true;
    }    
    
  }
  removeClass = (element, name) => {    
    element.className = element.className.replace(name, "");
  }
  showIf(field){
    const  objectc = this.selectedRow?this.selectedRow:{}
    const object = JSON.parse(JSON.stringify(objectc));
    if(this.templateForm){
      Object.keys(this.templateForm.getRawValue()).forEach(key => {
        object[key] = this.templateForm.getRawValue()[key];
      })
    }
    const display = this.commonFunctionService.showIf(field,object);
    const modifiedField = JSON.parse(JSON.stringify(field));
    modifiedField['display'] = display; 
    field = modifiedField;
    return display;
  }
  formControlChanges(){
    if(this.templateForm && this.templateForm.valueChanges && this.templateForm.valueChanges != null){
      this.templateForm.valueChanges.subscribe(val => {
        this.handleDisabeIf();
      });
    }    
  }

  async  openGridSelectionModal(field){
    if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
    let selectedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
    const gridModalData = {
      "field": field,
      "selectedData":selectedValue,
      "object": this.getFormValue(true),
      "formTypeName" : this.formTypeName,
      
    }
    this.samePageGridSelection = this.dataShareService.getgridselectioncheckvalue();
    if(this.samePageGridSelection){
      this.curTreeViewField = field;      
      this.samePageGridSelectionData = gridModalData;
    }else{
      const modal = await this.modalController.create({
        component: GridSelectionModalComponent,
        componentProps: {
          "Data": gridModalData,
        },
        swipeToClose: false
      });
      modal.componentProps.modal = modal;
      modal.onDidDismiss()
        .then((data) => {
          const object = data['data']; // Here's your selected user!
          if(object['data'] && object['data'].length > 0){
            let obj =this.getSendData(data);
            this.gridSelectionResponce(object['data']);
          }        
      });
      return await modal.present();
    }
  }
  getSendData(data){
    let obj ={
      "action":'',
      "index":-1,
      "data": data
    }
    return obj;
  }
  gridSelectionResponce(responce){ 

    if(this.curTreeViewField && this.curTreeViewField.add_new_enabled && responce && responce.action && responce.action == "edite"){
      let index = responce.index;
      if(this.samePageGridSelection){
        this.samePageGridSelection = false;
      }
      this.updateListofFields(this.curTreeViewField,index);
    }

    if (!this.custmizedFormValue[this.curTreeViewField.field_name]) this.custmizedFormValue[this.curTreeViewField.field_name] = [];
    this.custmizedFormValue[this.curTreeViewField.field_name] = JSON.parse(JSON.stringify(responce.data));

    if(this.curTreeViewField && this.curTreeViewField.onchange_function && this.curTreeViewField.onchange_function_param){
      // if(this.currentTreeViewFieldParent != ''){
      //   this.templateForm.get([this.currentTreeViewFieldParent.field_name]).get([this.curTreeViewField.field_name]).setValue(this.custmizedFormValue[this.curTreeViewField.field_name]);
      // }else{
      //   this.templateForm.controls[this.curTreeViewField.field_name].setValue(this.custmizedFormValue[this.curTreeViewField.field_name]);
      // }      
      // this.templateForm = this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue, this.curTreeViewField);
      let function_name = this.curTreeViewField.onchange_function_param;
      switch(function_name){
        case "calculation_of_script_for_tds":
          const payload = this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField);   
          this.apiService.getStatiData(payload);
          break;
        case "calculateQquoteAmount":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            element["qty"] = this.templateForm.getRawValue()["qty"];
            this.commonFunctionService.calculateNetAmount(element, {field_name: "qty"},"legacyQuotationParameterCalculation");
          });
          this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField)); 
          break;
        case "calculateAutomotiveLimsQuotation":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            // element["qty"] = this.templateForm.getRawValue()["qty"];
            this.commonFunctionService.calculateNetAmount(element, {field_name: "qty"},"calculateQuotationParameterAmountForAutomotiveLims");
          });
          // this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField)); 
          this.updateDataOnFormField(this.commonFunctionService.calculate_quotation(this.getFormValue(true),"automotive" ,{field_name:"parameter_array"}));
          break;
        case "calculateLimsQuotation":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            element["qty"] = this.templateForm.getRawValue()["qty"];
            this.commonFunctionService.calculateNetAmount(element, {field_name: "qty"}, "calculateQuotationParameterAmountForLims");
          });
          // this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField)); 
          this.updateDataOnFormField(this.commonFunctionService.calculate_quotation(this.getFormValue(true),"standard" ,{field_name:"parameter_array"}));
          break;    
        case 'quote_amount_via_sample_no':
          let val = this.commonFunctionService.quote_amount_via_sample_no(this.getFormValue(true),this.custmizedFormValue['quotation_param_methods']);
          this.updateDataOnFormField(val);
          break;
        case 'calculate_lims_invoice':
          let val1 = this.commonFunctionService.calculate_lims_invoice(this.getFormValue(true),'','');
          this.updateDataOnFormField(val1);
          break;
        default:
          if(this.commonFunctionService[this.curTreeViewField.onchange_function_param]){      
            this.templateForm = this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.templateForm, this.curTreeViewField);
            const calTemplateValue= this.templateForm.getRawValue()
            this.updateDataOnFormField(calTemplateValue);
          }
      }

    }
    if(this.curTreeViewField && this.curTreeViewField.onchange_function_param && this.curTreeViewField.onchange_function_param != ''){
      if(this.curTreeViewField.onchange_function_param.indexOf('QTMP') >= 0){
        const staticModalGroup = []
        staticModalGroup.push(this.restService.getPaylodWithCriteria(this.curTreeViewField.onchange_function_param,'',[],this.getFormValue(true)));
        //this.commonFunctionService.getStaticData(staticModalGroup);
        this.apiService.getStatiData(staticModalGroup);
      }
    }




    // if(this.templateForm.controls['quotation_param_methods']){
    //   this.templateForm.controls['quotation_param_methods'].setValue(this.custmizedFormValue['quotation_param_methods']);
    //   this.templateForm = this.commonFunctionService.calculateQquoteAmount(this.templateForm, this.curTreeViewField);
    //   const tamplateValue = this.templateForm.getRawValue();
    //   this.custmizedFormValue['quotation_param_methods'] = tamplateValue['quotation_param_methods'];
    // }
    // else if(this.templateForm.controls['items_list']){
    //   this.templateForm.controls['items_list'].setValue(this.custmizedFormValue['items_list']);
    //   this.templateForm = this.commonFunctionService.calculateInvoiceOrderAmount(this.templateForm, this.curTreeViewField);
    //   const tamplateValue = this.templateForm.getRawValue();
    //   this.custmizedFormValue['items_list'] = tamplateValue['items_list'];
    // }

    // this.curTreeViewField = {};
    this.currentTreeViewFieldParent = {};
  }

  getNumberOfSelectedRecord(field){
    if (!this.custmizedFormValue[field.field_name]){
      this.custmizedFormValue[field.field_name] = [];
    }else{
      if(this.custmizedFormValue[field.field_name] && this.custmizedFormValue[field.field_name].length > 0){
        return "( "+this.custmizedFormValue[field.field_name].length+" )";
      }else{
        return '';
      }
    }
  }
  getNumberOfSelectedFile(field){
    if (!this.dataListForUpload[field.field_name]){
      this.dataListForUpload[field.field_name] = [];
    }else{
      if(this.dataListForUpload[field.field_name] && this.dataListForUpload[field.field_name].length > 0){
        return "( "+this.dataListForUpload[field.field_name].length+" )";
      }else{
        return '';
      }
    }
  }
  checkCustmizedFormValueData(parent,chield){
    let check = false;
    if(parent != '' && parent != undefined && parent != null){
      const parentKey = this.commonFunctionService.custmizedKey(parent);
      if(this.custmizedFormValue[parentKey] && this.custmizedFormValue[parentKey][chield.field_name]){
        check = true;
      }
    }else{
      if(this.custmizedFormValue[chield.field_name]){
        check = true;
      }
    }
    return check;
  }
  custmizedFormValueData(parent,chield): Array<any>{
    let data = [];    
    if(parent != '' && parent != undefined && parent != null){
      const parentKey = this.commonFunctionService.custmizedKey(parent); 
      if(this.checkCustmizedFormValueData(parent,chield)){
        data = this.custmizedFormValue[parentKey][chield.field_name] 
      }       
    }else {
      if(this.checkCustmizedFormValueData('',chield)){
        data = this.custmizedFormValue[chield.field_name]
      }      
    }
     return data;
  }
  async openModal(id, index, parent,child, data, alertType) {
    this.deleteIndex = index;
    if(parent != ''){
      this.deletefieldName['parent'] = parent;
      this.deletefieldName['child'] = child;
    }else{
      this.deletefieldName['child'] = child;
    }
    // console.log(this.deletefieldName);
    // console.log(this.deleteIndex);
    // this.alertData = {
    //   "event": true,
    //   "type": alertType,
    //   "data": data
    // }
    // this.modalService.open(id, this.alertData);
    //this.commonFunctionService.openAlertModal(id,alertType,'Are You Sure ?','Delete This record.');
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    
    this.alertResponce(confirmDelete);
  }
  alertResponce(responce) {
    if (responce === "confirm") {
      this.deleteitem()
    } else {
      this.cancel();
    }
  }
  deleteitem() {
    const custmizedKeyChild = this.deletefieldName['child'].field_name;
    if(this.deletefieldName['parent'] != undefined && this.deletefieldName['parent'] != null && this.deletefieldName['parent'] != ''){
      const custmizedKeyParent = this.commonFunctionService.custmizedKey(this.deletefieldName['parent']) 
      let deleteCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[custmizedKeyParent][custmizedKeyChild]))
      deleteCustmizedValue.splice(this.deleteIndex, 1);
      this.custmizedFormValue[custmizedKeyParent][custmizedKeyChild] = deleteCustmizedValue;
    }else{

      if(this.deletefieldName['child'].datatype == 'key_value'){
        delete this.custmizedFormValue[custmizedKeyChild][this.deleteIndex];
      }else{
        let deleteCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[custmizedKeyChild]))
        deleteCustmizedValue.splice(this.deleteIndex, 1);
        this.custmizedFormValue[custmizedKeyChild] = deleteCustmizedValue;
        const field = this.deletefieldName['child']
        if(field.onchange_api_params != null && field.onchange_api_params != ''){
          if( field.onchange_api_params.indexOf("CLTFN") >= 0){
            const calculatedCost = this.commonFunctionService.calculateAdditionalCost(this.getFormValue(true));
            this.updateDataOnFormField(calculatedCost);
          }
          if (field.onchange_call_back_field != '') {
            switch (field.type) {
              case 'list_of_fields':
                let formValue = this.getFormValue(true);
                this.changeDropdown(field, formValue,field.onchange_data_template);
                break;              
              default:
                break;
            }
          }
        }
        if(field.onchange_function && field.onchange_function_param && field.onchange_function_param != ""){
          this.inputOnChangeFunc('',field);
        }
        
      }        
    }
    this.cancel()
  }
  cancel() {    
    this.deleteIndex = "";
    this.deletefieldName = {};
  }
  
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
      quality: 90,
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
      quality: 100,
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
    
    this.cameraService.presentToast("Image Added");
  }

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
    }
  }


  //delecte selected image
  deleteImage(index:number) {
    // this.cameraService.deleteImage(index).subscribe(res => {
    //   this.images.splice(index, 1);
    // });
    this.selectedphotos.splice(index, 1);
    this.cameraService.presentToast('File removed.');
  }
  async removeAttachedDataFromList(index:number,fieldName:any){
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete == "confirm"){
      this.dataListForUpload[fieldName].splice(index,1)
    }else{
      this.cancel();
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
  setFileData(getfileData){
    if (getfileData != '' && getfileData != null && this.checkForDownloadReport) {
      let link = document.createElement('a');
      link.setAttribute('type', 'hidden');

      const file = new Blob([getfileData.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(file);
      link.href = url;
      link.download = getfileData.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // this.downloadPdfCheck = '';
      this.dataSaveInProgress = true;
      this.checkForDownloadReport = false;
      this.dataSaveInProgress = true;
      this.apiService.ResetFileData();
    }
  }
  setFileDownloadUrl(fileDownloadUrl){
    if (fileDownloadUrl != '' && fileDownloadUrl != null && this.downloadClick != '') {
      let link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      // const file = new Blob([exportExcelLink], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // const url = window.URL.createObjectURL(file);
      link.href = fileDownloadUrl;
      link.download = this.downloadClick;
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.downloadClick = '';
      this.dataSaveInProgress = true;
      this.apiService.ResetDownloadUrl();
    }
  }
  getDivClass(field) {
      const fieldsLangth = this.tableFields.length;
      return this.commonFunctionService.getDivClass(field,fieldsLangth);
  }
  getColSize(field){
    let size:any = 12;
    if(field.field_class && field.field_class != ''){
      const fieldsLangth = this.tableFields.length;
      const returnClass = this.commonFunctionService.getDivClass(field,fieldsLangth);
      const classes = returnClass.split('-');
      const lastIndex = classes.length-1;
      const deviceIndex = classes.length-2;
      const deviceName = classes[deviceIndex];
      let deviceValue = classes[lastIndex];
      if(this.plt.is('hybrid')){
        if(deviceName == "xl" || deviceName == "lg" || deviceName == "md" || deviceName == "sm" || deviceName == "xs"){
          if(deviceValue < 6){
            size = '6';
          }else{          
            size = '12';
          }
        }
      }else{
        return size;
      }
    }
    return size;

  }
  getDivClassXl(deviceValue?:number){
    return deviceValue;
  };
  getDivClassLg(deviceValue){
    return deviceValue
  };
  getDivClassMd(deviceValue?:number){
    return deviceValue;
  };
  getDivClassSm(deviceValue?:number){
    return deviceValue;
  };
  getDivClassXs(deviceValue?:number){
    return deviceValue;
  };
  // open same form on form component
  addListOfFields(field){
    this.storeFormDetails("",field);
    if(this.samePageGridSelection){
      this.samePageGridSelection = false;
    }
  }
  updateListofFields(field,index){    
    this.storeFormDetails("",field,index); 
  }
  nextForm(){
    if(this.nextFormData && this.nextFormData.formName){
      this.openNextForm(true);
      this.enableNextButton = false;
    }    
  }
  openNextForm(next) {
    const form = this.nextFormData.formName;
    const field_name = this.nextFormData.field_name;
    const form_field_name = this.nextFormData.form_field_name;
    const field = {
      'add_new_form': form,
      'add_next_form_button': next,
      'field_name': field_name,
      'type': 'hidden',
      'form_field_name': form_field_name,
      'form_value_index' : 0,
      'moveFieldsToNewForm' : ['employee_name#add_assignments.resource_name']
    };
    this.storeFormDetails('', field);
  }
 
  loadPreviousForm(){
    const lastIndex = this.multipleFormCollection.length - 1;
    const formCollecition = this.multipleFormCollection[lastIndex];
    this.form = formCollecition['form'];
    this.modal.id = this.form._id;
    this.resetFlagsForNewForm();
    const data = formCollecition['data'];
    //console.log(data);

    this.updateMode = formCollecition['updateMode'];
    if(this.updateMode || this.complete_object_payload_mode){
      this.selectedRow = data;
    }
    this.setForm();
    this.updateDataOnFormField(data);
    this.getStaticDataWithDependentData();
    this.currentMenu['name'] = formCollecition['collection_name'];
    this.previousFormFocusField = formCollecition['current_field']; 

    this.focusFieldParent = formCollecition['parent_field'];
  
    if(this.previousFormFocusField && this.previousFormFocusField['add_next_form_button']){
      this.enableNextButton = true;
    }else{
      this.enableNextButton = false;
    }
    let nextFormData ={};
    if(formCollecition && formCollecition['next_form_data'] && formCollecition['next_form_data']['form']){
      nextFormData = formCollecition['next_form_data']['form']; 
    }
    let previousFormFocusFieldValue = '';
    if(this.commonFunctionService.isNotBlank(this.previousFormFocusField.add_new_target_field)){
      previousFormFocusFieldValue = nextFormData[this.previousFormFocusField.add_new_target_field];
    }
    const parentfield = formCollecition['parent_field'];
    if(!this.previousFormFocusField.multi_select && this.previousFormFocusField.type != 'list_of_fields' && this.previousFormFocusField.type != 'hidden'){
      if(parentfield != ''){
        this.templateForm.get(parentfield.field_name).get(this.previousFormFocusField.field_name).setValue(previousFormFocusFieldValue)
        //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[this.previousFormFocusField.field_name].patchValue(previousFormFocusFieldValue);       
      }else{      
        this.templateForm.get(this.previousFormFocusField.field_name).setValue(previousFormFocusFieldValue);
      } 
    } 
    if(this.previousFormFocusField.type == 'list_of_fields'){
      // this.previousFormFocusField = {};
    }  
    switch (formCollecition['current_field'].type) {
      case "typeahead":
        this.callTypeaheadData(formCollecition['current_field'],this.getFormValue(false));
        break;
      default:
        break;
    }
    
    this.multipleFormCollection.splice(lastIndex,1);    
  }

  candelForm() {    
    if(this.updateMode){      
      Object.keys(this.custmizedFormValue).forEach(key => {
        if(this.custmizedFormValue[key] != null){
          this.custmizedFormValue[key].forEach(element => {
            if(element.status == 'I'){
              element.status = 'A';
            }
          });
        }
      });
    }else{
      this.custmizedFormValue = {};
    }
    this.updateMode=false;
    this.addAndUpdateResponce.emit('close');    
  }
  previous(){
    const previousIndex = this.selectedRowIndex - 1;
    if(previousIndex != -1){
      this.selectedRowIndex = previousIndex;
      this.editedRowData(this.elements[previousIndex]);
    }else{
      this.notificationService.showAlert('Previous Index are not available.', "",['Ok'])
    }
  }
  next(){
    const nextIndex = this.selectedRowIndex + 1;
    if(nextIndex < this.elements.length){
      this.selectedRowIndex = nextIndex;
      this.editedRowData(this.elements[nextIndex]);
    }else{
      this.notificationService.showAlert('Next Index are not available.', "",['Ok'])
    }
  }
  previewModal(gridData:any, currentMenu:any, modalId:any) {
    const getpreviewHtml = {
      _id: gridData._id,
      data: this.restService.getPaylodWithCriteria(currentMenu.name, '', [], '')
    }
    this.apiService.GetPreviewHtml(getpreviewHtml);
    const alertData = {
      gridData: gridData,
      currentPage: currentMenu.name
    }
    // this.modalService.open(modalId, alertData);
  }
  preview(gridData:any, currentMenu:any, modalId:any) {
    const getpreviewHtml = {
      _id: gridData._id,
      data: this.restService.getPaylodWithCriteria(currentMenu.name, '', [], '')
    }
    getpreviewHtml.data['data'] = gridData;
    this.apiService.GetPreviewHtml(getpreviewHtml);
  }
  setListoffieldData(){
    const previousFormIndex = this.multipleFormCollection.length - 1;
    const previousFormCollection = this.multipleFormCollection[previousFormIndex];
    const previousFormField = previousFormCollection.current_field;
    // const currentFormValue = this.getFormValue(true)
    const currentFormValue = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(true),false);
    this.updateMode = false;
    const fieldName = previousFormField.field_name;
    delete currentFormValue[fieldName];    
    const previousformData = previousFormCollection.data;
    if(previousFormField && previousFormField.type){
      switch (previousFormField.type) {
        case 'list_of_fields':
        case 'grid_selection':
          let fieldData = previousformData[fieldName]
          let index = previousFormCollection['index'];
          if(this.commonFunctionService.isArray(fieldData)){
            if(index != undefined && index >= 0){
              fieldData[index] = currentFormValue;
            }else{
              currentFormValue['customEntry']=true; 
              fieldData.push(currentFormValue);
            }
          }else{
            fieldData = [];
            currentFormValue['customEntry']=true;
            fieldData.push(currentFormValue);
          }     
          
          if(index != undefined && index >= 0){
            this.custmizedFormValue = {};
            this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(fieldData));
            previousformData[fieldName] = this.custmizedFormValue[fieldName];
            this.multipleFormCollection[previousFormIndex]['data'] = previousformData; 
            this.nextFormUpdateMode = false;
            this.close();
          }else{
            this.donotResetField();
            this.custmizedFormValue = {};
            this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(fieldData));
            previousformData[fieldName] = this.custmizedFormValue[fieldName];
            this.multipleFormCollection[previousFormIndex]['data'] = previousformData; 

            
            this.templateForm.reset()
            if(Object.keys(this.donotResetFieldLists).length > 0){
              this.updateDataOnFormField(this.donotResetFieldLists);
              this.donotResetFieldLists = {};
            }

          }
          break;      
        default:
          break;
      }      
    }else{
      previousformData[fieldName] = currentFormValue;
      if(!this.enableNextButton){
        this.enableNextButton = true;
      }
      this.multipleFormCollection[previousFormIndex]['data'] = previousformData; 
      this.close();
    } 
  }
  donotResetField(){
    //let FormValue = this.templateForm.getRawValue();
    let FormValue = this.getFormValue(true);
    this.tableFields.forEach(tablefield => {
      if(tablefield.do_not_refresh_on_add && tablefield.type != "list_of_fields" && tablefield.type != "group_of_fields" && tablefield.type != "stepper"){
        this.donotResetFieldLists[tablefield.field_name] = FormValue[tablefield.field_name];
      }else if(tablefield.type == "group_of_fields"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach(field => {
            if(field.do_not_refresh_on_add){
              this.donotResetFieldLists[tablefield.field_name][field.field_name] = FormValue[tablefield.field_name][field.field_name];
            }
          });
        }
      }else if(tablefield.type == "stepper"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach(step => {
            if(step.list_of_fields && step.list_of_fields.length > 0){
              step.list_of_fields.forEach(field => {
                if(field.do_not_refresh_on_add){
                  this.donotResetFieldLists[step.field_name][field.field_name] = FormValue[step.field_name][field.field_name];
                }
              });
            }
          });
        }
      }
    });
  }

  searchTypeaheadData(field, currentObject,chipsInputValue) {
    this.typeaheadObjectWithtext = currentObject;

    this.addedDataInList = this.typeaheadObjectWithtext[field.field_name]

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
    let staticModalGroup = this.restService.getPaylodWithCriteria(field.api_params, call_back_field, criteria, this.typeaheadObjectWithtext ? this.typeaheadObjectWithtext : {});
    staticModal.push(staticModalGroup);
    this.apiService.GetTypeaheadData(staticModal);

    this.typeaheadObjectWithtext[field.field_name] = this.addedDataInList;
  }

  
  removeItem(data:any,column:any,i:number){
    data[column.field_name].splice(i,1);
    return data[column.field_name];
  }

  isDisable(field, object) {
    const updateMode = false;
    let disabledrow = false;
    if (field.is_disabled) {
      return true;
    } 
    if(this.tableFields.disableRowIf && this.tableFields.disableRowIf != ''){
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
      if(this.tableFields.disableRowIf && this.tableFields.disableRowIf != ''){
        condition = this.tableFields.disableRowIf;
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
  checkRowDisabledIf(field,index){
    const data = this.commonFunctionService[field.field_name];
    const condition = field.disableRowIf;
    if(condition){
      return !this.commonFunctionService.checkDisableRowIf(condition,data);
    }
    return true;    
  }
  reviewParameters(fields,data){
    this.clickFieldName=fields;
    let value={};
    value['data'] = JSON.parse(JSON.stringify(data));
    value['gridColumns']=fields.gridColumns;
    const editemode = true;    
    // this.viewModal('form_basic-modal', value, fields,editemode); 
    if (!this.custmizedFormValue[fields.field_name]) this.custmizedFormValue[fields.field_name] = [];
    let selectedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[fields.field_name]))
    const gridModalData = {
      "field": fields,
      "selectedData":selectedValue,
      "object": this.getFormValue(true),
      "formTypeName" : this.formTypeName,
      
    }
    this.samePageGridSelection = this.dataShareService.getgridselectioncheckvalue();
    if(this.samePageGridSelection){
      this.curTreeViewField = fields;      
      this.samePageGridSelectionData = gridModalData;
    }
  }

  checkDates(endDate: string, startDate: string) {
    return (formGroup: FormGroup) => {
      const startDateControl = formGroup.controls[startDate];
      const endDateControl = formGroup.controls[endDate];
      const date1 =new Date(startDateControl.value);
      const date2 =new Date(endDateControl.value);
      if(date1 > date2) {
        endDateControl.setErrors({ notValid: true });
      }else{
        endDateControl.setErrors(null);
      }
    }    
  }
  clearDropdownField(e:any,field:any){
    if(e.target.value && e.target.value.name){      
      e.target.value = "";
    }else{
      e.target.value = "";
    }
    this.setValue("",field, "", e);
  }
  getTitlecase(value){
    // return this.commonFunctionService.getTitlecase(value)
    this.titlecasePipe.transform(value);
  }
  /** Reorder objects in array */
	doReorder(ev: CustomEvent<ItemReorderEventDetail>, draggableItemId: number) {
    let groupToChangeIndex = this.custmizedFormValue.findIndex(
      (Item:any) => Item.id === draggableItemId
    );
    this.custmizedFormValue[groupToChangeIndex].items = ev.detail.complete(
      this.custmizedFormValue[groupToChangeIndex].items
    );
  }
  getFirstCharOfString(char:any){
    return this.commonFunctionService.getFirstCharOfString(char);
  }
  
  getName(object:any){
    let columns = this.tableFields.gridColumns;
    let field_name : string = "";
    if(columns && columns.length > 0){
      columns.forEach(element => {
        if(element.field_name == "plainCustomerName"){
          field_name = element.field_name;
        }
      });
      if(field_name == ""){
        field_name = columns[0].field_name;
      }
      let value = this.commonFunctionService.getObjectValue(field_name,object);
      return value;      
    }
  }
  getValueForGrid(field,object){
    return this.commonFunctionService.getValueForGrid(field,object);
  }

  async delete(index:number,field:any,fieldName:string){
    //alert, if confirm then
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete === "confirm"){
      this.custmizedFormValue[fieldName].splice(index,1);
      let obj = await this.getSendData(field)
      this.gridSelectionResponce(obj);
    }
  }
  checkObjecOrString(data){
    if(data._id){
      return data._id;
    }else{
      return data;
    }
  }
  editListOfFiedls(object:any,index:number){
    this.listOfFieldUpdateMode = true;
    this.listOfFieldsUpdateIndex = index;
    
    this.tableFields.forEach(element => {
      switch (element.type) {        
        case "list_of_fields":
          this.templateForm.get(element.field_name).reset(); 
          if (element.list_of_fields.length > 0) {
            element.list_of_fields.forEach((data) => {
              switch (data.type) {                
                case "list_of_string":
                  const custmisedKey = this.custmizedKey(element);
                  if (!this.custmizedFormValue[custmisedKey]) this.custmizedFormValue[custmisedKey] = {};
                  this.custmizedFormValue[custmisedKey][data.field_name] = object[data.field_name];
                  break;
                case "typeahead":
                  if (data.datatype == 'list_of_object') {
                    const custmisedKey = this.custmizedKey(element);
                    if (!this.custmizedFormValue[custmisedKey]) this.custmizedFormValue[custmisedKey] = {};
                    this.custmizedFormValue[custmisedKey][data.field_name] = object[data.field_name];    
                  } else {
                    this.templateForm.get(element.field_name).get(data.field_name).setValue(object[data.field_name]);
                    //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(object[data.field_name]);
                  }
                  break;
                case "list_of_checkbox":
                  let checkboxListValue = [];
                  if(this.staticData && this.staticData[data.ddn_field] && this.staticData[data.ddn_field].length > 0){
                    this.staticData[data.ddn_field].forEach((value, i) => {                      
                      let arrayData = object[data.field_name];                        
                      let selected = false;
                      if (arrayData != undefined && arrayData != null) {
                        for (let index = 0; index < arrayData.length; index++) {
                          if (this.checkObjecOrString(value) == this.checkObjecOrString(arrayData[index])) {
                            selected = true;
                            break;
                          }
                        }
                      }
                      if (selected) {
                        checkboxListValue.push(true);
                      } else {
                        checkboxListValue.push(false);
                      }               
                    });
                  }
                  this.templateForm.get(element.field_name).get(data.field_name).setValue(checkboxListValue);
                  //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(checkboxListValue);
                  break;                
                default:
                  this.templateForm.get(element.field_name).get(data.field_name).setValue(object[data.field_name]);
                  //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(object[data.field_name]);
                  break;
              }              
            })
          }
          break;
        default:          
          break;
      }
    });
  }
  // go to new page 2nd method
  async detailCardButton(data:any,index:number){
    // if(this.detailPage){
    //   //const index = this.coreUtilityService.getIndexInArrayById(this.carddata,data._id);
    //   //this.editedRow(data,index);
    //   this.modaldetailCardButton(column,data);
    // }else{
      const newobj = {
        "childdata": data,
        "selected_tab_index": this.selectedIndex
      }
      this.dataShareServiceService.setchildDataList(newobj);  
      this.commonDataShareService.setSelectedTabIndex(this.selectedIndex);  
      this.router.navigate(['card-detail-view']);
    // }    
  }
  getButtonDivClass(field){
    return this.commonFunctionService.getButtonDivClass(field);
  }
  
  checkGridSelectionMendetory(){
    let validation = {
      'status' : true,
      'msg' : ''
    }
    if(this.gridSelectionMendetoryList && this.gridSelectionMendetoryList.length > 0){
      let check = 0;
      this.gridSelectionMendetoryList.forEach(field => {        
        let data:any = [];
        if(this.custmizedFormValue[field.field_name]){
          data = this.custmizedFormValue[field.field_name];
        }
        if(field.mendetory_fields && field.mendetory_fields.length > 0){
          if(data && data.length > 0){
            field.mendetory_fields.forEach(mField => {
              const fieldName = mField.field_name;
              data.forEach((row:any,i) => {
                if(row && row[fieldName] == undefined || row[fieldName] == '' || row[fieldName] == null){
                  if(validation.msg == ''){
                    let errorPositionInArray:any;
                    if(row.plainCustomerName){
                      errorPositionInArray =  " of " + row.plainCustomerName;
                    }else{
                      errorPositionInArray = '';
                    }
                    validation.msg = mField.label + errorPositionInArray + ' of ' + field.label + ' is required.';
                  }
                  check = 1;
                }
              });
            });
          }
        }     
      });
      if(check != 0){
        validation.status = false;
        return validation;
      }else{
        return validation
      }
    }else{
      return validation;
    }
  }

  checkShowIfListOfFiedlds(parent,field,index){
    let formValue = this.getFormValue(true);
    let parentFieldName = parent.field_name;
    let fieldValue = formValue[parentFieldName];    
    if(fieldValue && fieldValue.length > 0 && field && field.show_if && field.show_if != null && field.show_if != ''){
      let check = 0;      
      for (let index = 0; index < fieldValue.length; index++) {
        const value = fieldValue[index];
        formValue[parentFieldName] = value;
        if(this.commonFunctionService.showIf(field,formValue)){
          check = 1;
          break;
        }        
      }
      if(check == 1){
        return false;
      }else{
        return true;
      }
    }else{
      return false;
    }
  }

  showListFieldValue(listOfField, item) {
    switch (item.type) {
      case "typeahead":
          if(item.datatype == "list_of_object"){
            if (Array.isArray(listOfField[item.field_name]) && listOfField[item.field_name].length > 0 && listOfField[item.field_name] != null && listOfField[item.field_name] != undefined && listOfField[item.field_name] != '') {
              return '<i class="fa fa-eye text-pointer"></i>';
            } else {
              return '-';
            }
          }else if(item.datatype == "object"){
            if (item.display_name && item.display_name != "") {
              return this.commonFunctionService.getObjectValue(item.display_name, listOfField);
            } else {
              return listOfField[item.field_name];
            }
          }
          else if(item.datatype == "text"){
            if (item.display_name && item.display_name != "") {
              return this.commonFunctionService.getObjectValue(item.display_name, listOfField);
            } else {
              return listOfField[item.field_name];
            }
          }
      case "list_of_string":
      case "list_of_checkbox":
        case "grid_selection":
        if (Array.isArray(listOfField[item.field_name]) && listOfField[item.field_name].length > 0 && listOfField[item.field_name] != null && listOfField[item.field_name] != undefined && listOfField[item.field_name] != '') {
          return '<i class="fa fa-eye text-pointer"></i>';
        } else {
          return '-';
        } 
      case "checkbox":
        let value:any = false;
        if (item.display_name && item.display_name != "") {
          value = this.commonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          value = this.getValueForGrid(item,listOfField);
        }
        return value ? "Yes" : "No";     
      default:
        if (item.display_name && item.display_name != "") {
          return this.commonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          return this.getValueForGrid(item,listOfField);
        }
    }   

  }
  showListOfFieldData(listOfField,item){
    let value={};
    value['data'] = listOfField[item.field_name]    
    switch (item.type) {
      case "typeahead":
          if(item.datatype == "list_of_object"){  
            // const editemode = false;    
            // value['gridColumns'] = [
            //   {
            //     "field_name":"label",
            //     "label":item.label
            //   }
            // ];      
            this.viewModal('form_basic-modal', value, item,false);
          }          
          break;
      case "list_of_string":
      case "list_of_checkbox":
      case "grid_selection":
        if(item["gridColumns"] && item["gridColumns"].length > 0){
          value['gridColumns']=item.gridColumns;
        }
        this.viewModal('form_basic-modal', value, item,false);
        break;      
      default:
        break;
    } 
  }
  viewModal(id, object, field,editemode) {
    this.alertData = {
      "field": field,
      "data": object,
      "menu_name": this.currentMenu.name,
      'editemode': editemode
    }
    // this.modalService.open(id, this.alertData);
  }



  // Please let these below 2 functions of readAsBase64 and convertBlobToBase64 , in the last in this file
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
}
