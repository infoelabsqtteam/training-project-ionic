import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output, HostListener, NgZone } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, UntypedFormControl } from "@angular/forms";
import { DatePipe } from '@angular/common'; 
import { Router } from '@angular/router';
import { App_googleService, NotificationService, AppDataShareService, AppPermissionService, AppDownloadService, AppShareService, LoaderService, AppModelService } from '@core/ionic-core';
import { AlertController, ItemReorderEventDetail, ModalController, isPlatform  } from '@ionic/angular';
import { GridSelectionModalComponent } from '../../modal/grid-selection-modal/grid-selection-modal.component';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo, GalleryImageOptions, GalleryPhoto, GalleryPhotos} from '@capacitor/camera';
import { ActionSheetController, Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Observable, Subscription, catchError, finalize, last, map, of } from 'rxjs';
import { zonedTimeToUtc, utcToZonedTime} from 'date-fns-tz';
import { parseISO, format, hoursToMilliseconds, isToday, add } from 'date-fns';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { FileOpener } from '@capacitor-community/file-opener';
import { GridSelectionDetailModalComponent } from '../../modal/grid-selection-detail-modal/grid-selection-detail-modal.component';
// import { GoogleMap, MapType } from '@capacitor/google-maps';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ApiService, DataShareService, CustomvalidationService, CommonFunctionService, LimsCalculationsService, CommonAppDataShareService, PermissionService, EnvService, CoreFunctionService, StorageService, Common, GridCommonFunctionService, FileHandlerService, ApiCallService, FormCreationService, CheckIfService, FormControlService, MultipleFormService, ApiCallResponceService, FormValueService, DownloadService } from '@core/web-core';
import { Capacitor } from '@capacitor/core';
import { ModalComponent } from '../../modal/modal.component';
import { FileViewsModalComponent } from '../../modal/file-views-modal/file-views-modal.component';

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
  providers: []
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

  //ion-select changes 
  customAlertOptions:object = {
    backdropDismiss: false,
    translucent: true
  };
  ionSelectInterface:string = 'alert';


  @Output() filledFormData = new EventEmitter();
  @Output() addAndUpdateResponce = new EventEmitter();
  @Output() formDetails = new EventEmitter();
  @Input() editedRowIndex: number;
  @Input() formName: string;
  @Input() selectContact: string;
  @Input() childData: any;  
  @Input() addform: any;
  @Input() formTypeName:string;
  @Input() cardType:string;
  @Input() modal: any;
  @Input() isBulkUpdate:boolean;
  @Input() bulkDataList:any;
  @Input() additionalData:any;
  @ViewChild('capacitormap') capMapRef: ElementRef<HTMLElement>;
  @ViewChild('search', {read:ElementRef}) searchElementRef: ElementRef;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild(GoogleMap) public map!: GoogleMap;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  selectedphotos:any= [];  
  downloadClick='';
  bulkupdates:boolean = false;  
  // newCapMap: GoogleMap;
  apiLoaded: Observable<boolean>;
  
  ionicForm: UntypedFormGroup;
  defaultDate = "1987-06-30";
  isSubmitted = false;

  templateForm!: UntypedFormGroup;

  forms:any={};
  form:any ={};
  formIndex:number=0;
  pdfViewLink:any='';
  pdfViewListData:any=[];
  tableFields:any=[];
  formFieldButtons:any=[];
  currentMenu:any={};
  elements:any=[];
  showIfFieldList:any=[];
  disableIfFieldList:any=[];
  calculationFieldList:any=[];
  createFormgroup:boolean=false;
  checkBoxFieldListValue:any=[];
  selectedRowIndex: any = -1;
  minDate: Date;
  maxDate: Date;
  filePreviewFields:any=[];
  isStepper:boolean = false;
  getTableField:boolean = true;
  staticData: any = {};
  // copyStaticData:any={};
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
  modifyCustmizedFormValue: any = {};
  multipleFormCollection:any=[];
  donotResetFieldLists:any={};
  typeAheadData: any = [];
  treeViewData: any = {};
  curFileUploadField:any={}
  curFileUploadFieldparentfield:any={};
  public curTreeViewField: any = {};
  curFormField:any={};
  curParentFormField:any={};
  currentTreeViewFieldParent:any = {};
  public tempVal = {};
  addOrUpdateIconShowHideList:any={}; // editListOfString() index variable

  dinamicFormSubscription:any;
  staticDataSubscriber:any;
  nestedFormSubscription:Subscription;
  saveResponceSubscription:Subscription;
  typeaheadDataSubscription:any;
  fileDataSubscription:any;
  fileDownloadUrlSubscription:any;
  nextFormSubscription:Subscription;
  gridSelectionOpenOrNotSubscription:any;
  gridRealTimeDataSubscription:Subscription;
  gridDownloadImageSubscription:Subscription;
  isGridSelectionOpen: boolean = true;
  deleteGridRowData: boolean = false;
  clickFieldName:any={};
  selectedgridselectionField:any;

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
  list_of_fields:any=[];
  pageLoading: boolean;
  isLinear: boolean;
  listOfFieldUpdateMode: boolean;
  listOfFieldsUpdateIndex: any = -1;
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

  // Google map variables
  latitude: number = 0;
  longitude: number = 0;
  zoom: number = 10;  
  center: google.maps.LatLngLiteral = {lat: 0, lng: 0};
  address: string;
  capMapMarkerId:string = '';
  getLocation:boolean = false;  

  focusFieldParent:any={};
  currentForm_id = "";
  chipsData:any;  
  typeaheadObjectWithtext:any;
  addedDataInList: any;
  readonly:boolean = false;
  selectedIndex= -1;
  hide = true;
  checkForDownloadReport:boolean = false;
  pageSize:any=100;
  buttonIfList=[];
  confirmationSubscription:any;
  fileDrop: boolean = false;

  	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
    files: any[] = [];
    public xtr: any;
    public obj: any = {};
    public uploadData: any = []
    public uploadFilesData: any = [];
  
    term:any={};

    // @HostListener('document:click') clickout() {
    //   this.term = {};
    // }

  constructor(
    public formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private commonFunctionService:CommonFunctionService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private commonAppDataShareService:CommonAppDataShareService,
    private permissionService:PermissionService,
    private notificationService:NotificationService,
    private modalController: ModalController,
    private plt: Platform, 
    private actionSheetCtrl: ActionSheetController,
    private dataShareServiceService: DataShareServiceService,
    private envService: EnvService,
    private app_googleService: App_googleService,
    private alertController: AlertController,
    private ngZone: NgZone,
    private customValidationService: CustomvalidationService,
    private limsCalculationsService: LimsCalculationsService,
    private coreFunctionService: CoreFunctionService,
    private storageService: StorageService,
    private appDataShareService: AppDataShareService,
    private appPermissionService: AppPermissionService,
    private gridCommonFunctionService: GridCommonFunctionService,
    private fileHandlerService: FileHandlerService,
    private apiCallService: ApiCallService,
    private formCreationService: FormCreationService,
    private checkIfService: CheckIfService,
    private appDownloadService: AppDownloadService,
    private appShareService: AppShareService,
    private loaderService: LoaderService,
    private formControlService: FormControlService,
    private multipleFormService: MultipleFormService,
    private apiCallResponceService: ApiCallResponceService,
    private formValueService: FormValueService,
    private appModelService: AppModelService,
    private downloadService: DownloadService
    ) {

      // this.mapsApiLoaded();
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
        if(form && form !== null){
          if(this.multipleFormCollection && this.multipleFormCollection.length > 0){
            this.loadNextForm(form);
          }else{
            this.form = form;
            this.resetFlag();
            this.setForm();
          }
        }
      });
      this.fileDataSubscription = this.dataShareService.getfileData.subscribe(data =>{
        this.setFileData(data);
      })
      this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
        if(responce != null){
          this.setSaveResponce(responce);
        }
      });
      this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data =>{
        // this.setTypeaheadData(data);
        this.typeAheadData = this.apiCallResponceService.setTypeaheadData(data,this.typeAheadData);
      });
      this.fileDownloadUrlSubscription = this.dataShareService.fileDownloadUrl.subscribe(data =>{
        if(isPlatform('hybrid')){
          this.downloadFileFromUrl(data);
        }else{
          this.setFileDownloadUrl(data);
        }
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
      this.gridRealTimeDataSubscription = this.dataShareService.gridRunningData.subscribe(res =>{
        this.updateRunningData(res.data);
      })
      this.gridDownloadImageSubscription = this.dataShareServiceService.gridDownloadImage.subscribe(data => {
        this.imageDownload(data);
      })

      this.onLoadVariable();
  }

  // Ionic LifeCycle Function Handling Start ------------------ 
  ionViewWillEnter() {
    this.onLoadVariable();
  }
  ionViewDidEnter(){
    // this.createMap();
  } 
  ionViewWillLeave(){
    this.unsubscribeVariabbles();
  }
  // Ionic LifeCycle Function Handling End ----------------

  // Angular LifeCycle Function Handling Start --------------------
  ngAfterViewInit(){
    // this.gmapSearchPlaces();    
  }
  ngOnDestroy() {
    //Abobe ionViewwillLeave is working fine.
    // this.unsubscribeVariabbles();
  }
  ngOnInit() {    
    const id:any = this.commonAppDataShareService.getFormId();
    this.getNextFormById(id);
    this.handleDisabeIf();
    this.formControlChanges();
    this.checkPermissionandRequest();
  }
  // Angular LifeCycle Function Handling End ---------------

  // Initial Function Handling Start ------------------
  private getNextFormById(id: string) {
    const params = "form";
    const criteria = ["_id;eq;" + id + ";STATIC"];
    const payload = this.apiCallService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetNestedForm(payload);
  }
  async handleDisabeIf(){
    this.getFocusFieldAndFocus();
    this.checkFormFieldIfCondition();
  }  
  formControlChanges(){
    if(this.templateForm && this.templateForm.valueChanges && this.templateForm.valueChanges != null){
      this.templateForm.valueChanges.subscribe(val => {
        this.handleDisabeIf();
      });
    }    
  }
  onLoadVariable() {
    this.dataSaveInProgress = true;
  }
  // Initial Function Handling End -----------------

  // Subscriber Functions Handling Start -------------------
  // CD
  setStaticData(staticDatas:any){
    if(staticDatas && Object.keys(staticDatas).length > 0) {
      Object.keys(staticDatas).forEach(key => {
        let staticData = {};
        staticData[key] = staticDatas[key];
        if(staticData['staticDataMessgae'] != null && staticData['staticDataMessgae'] != ''){
          this.notificationService.presentToastOnBottom(staticData['staticDataMessgae'], "danger");
          // const fieldName = {
          //   "field" : "staticDataMessgae"
          // }
          // this.apiService.ResetStaticData(fieldName);
        }
        if(key && key != 'null' && key != 'FORM_GROUP' && key != 'CHILD_OBJECT' && key != 'COMPLETE_OBJECT' && key != 'FORM_GROUP_FIELDS'){
          if(staticData[key]) { 
            this.staticData[key] = JSON.parse(JSON.stringify(staticData[key]));
          }
        }
        this.tableFields.forEach(element => {
          switch (element.type) {              
            case 'pdf_view':
              if(this.commonFunctionService.isArray(staticData[element.ddn_field]) && staticData[element.ddn_field] != null){
                const data = staticData[element.ddn_field][0];
                if(data['bytes'] && data['bytes'] != '' && data['bytes'] != null){
                  const arrayBuffer = data['bytes'];
                  this.pdfViewLink = arrayBuffer;
                  this.pdfViewListData = JSON.parse(JSON.stringify(staticData[element.ddn_field]))
                }
              }else{
                this.pdfViewLink = '';
              }             
              break;
            case 'info_html':              
              if(staticData[element.ddn_field] && staticData[element.ddn_field] != null){
                this.templateForm.controls[element.field_name].setValue(staticData[element.ddn_field]);
                if(this.filePreviewFields && this.filePreviewFields.length > 0){
                  // this.showSidebar = true;
                }
              }
              break;
            case 'html_view':
              if(staticData[element.ddn_field] && staticData[element.ddn_field] != null){
                this.templateForm.controls[element.field_name].setValue(staticData[element.ddn_field])
              }
              break;
            default:              
              break;
          }
        })

        if(staticData["FORM_GROUP"] && staticData["FORM_GROUP"] != null){          
          this.updateDataOnFormField(staticData["FORM_GROUP"]);          
          const fieldName = {
            "field" : "FORM_GROUP"
          }
          this.apiService.ResetStaticData(fieldName);
        }    
        if(staticData["CHILD_OBJECT"] && staticData["CHILD_OBJECT"] != null){
          this.updateDataOnFormField(staticData["CHILD_OBJECT"]); 
          const fieldName = {
            "field" : "CHILD_OBJECT"
          }
          this.apiService.ResetStaticData(fieldName);
          
        }    
        if(staticData["COMPLETE_OBJECT"] && staticData["COMPLETE_OBJECT"] != null){
          if(this.curFormField && this.curFormField.resetFormAfterQtmp){
            this.resetForm();
            this.curFormField = {};
            this.curParentFormField = {};
          }
          this.updateDataOnFormField(staticData["COMPLETE_OBJECT"]);          
          this.selectedRow = staticData["COMPLETE_OBJECT"];
          this.complete_object_payload_mode = true;
          const fieldName = {
            "field" : "COMPLETE_OBJECT"
          }
          this.apiService.ResetStaticData(fieldName);
          
        }    
        if(staticData["FORM_GROUP_FIELDS"] && staticData["FORM_GROUP_FIELDS"] != null){
          this.updateDataOnFormField(staticData["FORM_GROUP_FIELDS"]);
          const fieldName = {
            "field" : "FORM_GROUP_FIELDS"
          }
          this.apiService.ResetStaticData(fieldName);    
        }
        if (this.checkBoxFieldListValue.length > 0 && Object.keys(staticData).length > 0) {
          // this.setCheckboxFileListValue();
          this.templateForm = this.formControlService.setCheckboxFileListValue(this.checkBoxFieldListValue,this.templateForm, this.staticData,this.selectedRow,this.updateMode);
        }
        
      })
    }
  }
  // CD
  setDinamicForm(form:any){
    if(form && form.DINAMIC_FORM){
      this.dinamic_form = form.DINAMIC_FORM;
      if(this.formName == 'DINAMIC_FORM' && this.getTableField){
        // this.grid_view_mode = this.dinamic_form.view_mode;
        this.form = this.dinamic_form;
        this.setForm();
      }        
    }
  }
  // CD
  loadNextForm(form: any){    
    this.form = form;
    this.resetFlagsForNewForm();
    this.setForm();
    // used service function
    let result = this.multipleFormService.updateNextFormData(this.multipleFormCollection,this.nextFormUpdateMode,this.form,this.custmizedFormValue,this.editedRowIndex,this.previousFormFocusField,this.tableFields);    
    let nextFormData:any = result.nextFormData;
    if(this.updateAddNew){
      this.getNextFormData(nextFormData);
    }
    let fData:any = result.fData;
    this.nextFormUpdateMode = result.nextFormUpdateMode;
    this.custmizedFormValue = result.custmizedFormValue;
    if(result.fieldName && result.fieldName != '') this.modifyCustmizedValue(result.fieldName);
    if(result.editFunction) this.editedRowData(fData);
    if(result.updateFormFunction) this.updateDataOnFormField(fData);
    if(result.getStaticData) this.getStaticDataWithDependentData();
    this.previousFormFocusField = result.previousFormFocusField;
  }
  // CD
  setForm(){
    if(this.form){
      this.formDetails.emit(this.form);
    }
    let getFields = this.formCreationService.checkFormDetails(this.form,'',this.currentMenu);
    this.currentMenu = getFields['currentMenu'];
    this.bulkupdates = getFields['bulkupdates'];
    this.getLocation = getFields['getLocation'];
    // this.headerFiledsData = getFields['headerFiledsData'];
    this.tableFields = getFields['tableFields'];
    this.getTableField = getFields['getTableField'];
    this.formFieldButtons = getFields['formFieldButtons'];
    // below code is for App
    if(!this.currentMenu || this.currentMenu?.name == undefined){
      const collectionName = this.dataShareServiceService.getCollectionName();
      this.currentMenu['name'] = collectionName;
    }

    // CH
    if (this.tableFields.length > 0 && this.createFormgroup) {
      this.createFormgroup = false;
      let formControl:any = this.formCreationService.setNewForm(this.tableFields,this.formFieldButtons,this.form,this.elements,this.selectedRowIndex);
      let blankField = formControl['blankField'];      
      if(blankField && (blankField.fieldName != '' || blankField.index != -1)){
        this.notifyFieldValueIsNull(blankField.fieldName,blankField.index);
      }
      this.calculationFieldList=formControl['calculationFieldList'];
      this.showIfFieldList=formControl['showIfFieldList'];
      this.buttonIfList=formControl['buttonIfList'];
      this.disableIfFieldList=formControl['disableIfFieldList'];
      this.mendetoryIfFieldList = formControl['mendetoryIfFieldList'];
      this.gridSelectionMendetoryList=formControl['gridSelectionMendetoryList'];
      this.customValidationFiels = formControl['customValidationFiels'];
      // this.editorTypeFieldList = formControl['editorTypeFieldList'];
      const forControl = formControl['forControl'];
      this.checkBoxFieldListValue = formControl['checkBoxFieldListValue'];
      let staticModal:any = formControl['staticModal'];
      this.filePreviewFields=formControl['filePreviewFields'];
      this.isStepper=formControl['isStepper'];
      // this.showGridData = formControl['showGridData'];
      // below code is for App
      if(this.getLocation || formControl['requestLocationPermission']){
        this.checkPermissionandRequest();
      }
      
      // CH
      if (forControl && Object.keys(forControl).length > 0 && this.tableFields.length > 0) {
        let validators = {};
        validators['validator'] = [];
        if(this.customValidationFiels && this.customValidationFiels.length > 0){
          this.customValidationFiels.forEach(field => {
            switch (field.type) {
              case 'date':
                validators['validator'].push(this.customValidationService.checkDates(field.field_name,field.compareFieldName));
                break;
              default:
                break;
            }

          });
        }
        // Extra code for scanner
        if(this.additionalData?.scannedData && formControl["name"] ){
          formControl.name.value=this.additionalData?.scannedData;
        }
        this.templateForm = this.formBuilder.group(forControl,validators);
        if(this.nextIndex){
          this.nextIndex = false;
          this.next();
        }
      }

      let formValueWithCustomData = this.getFormValue(true);
      let fromValue = this.getFormValue(false);
      staticModal = this.formCreationService.updateSelectContact(this.selectContact,[],this.tableFields,this.templateForm,formValueWithCustomData,staticModal);
      if(this.tableFields.length > 0 && this.editedRowIndex == -1){
        this.getStaticData(staticModal,formValueWithCustomData,fromValue);               
      }     

    }

    // CH
    if (this.tableFields.length > 0 && this.pageLoading) {
      this.pageLoading = false;
      let buttonsCondition = this.formCreationService.checkFieldButtonCondition(this.tableFields);
      this.tempVal = buttonsCondition['tempVal'];
    }
    this.loaderService.checkAndHideLoader();
  }
  // CD
  async setFileData(getfileData){
    if (getfileData != '' && getfileData != null && this.checkForDownloadReport) {
      const blobData = new Blob([getfileData.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blobData);
      let fileExt:any = '';
      let fileName:any = '';
      if(getfileData && getfileData.filename){
        fileExt = getfileData.filename.split('.').pop();
        if(fileExt == "pdf"){
          fileName = getfileData.filename;
        }else{
          fileName = getfileData.filename + ".pdf";
        }
      }
      if(this.plt.is("hybrid")){
        let downloadResponse = await this.appDownloadService.downloadAnyBlobData(blobData,fileName,true);
        this.downloadResponseHandler(downloadResponse);
      }else{
        this.downloadService.download(url,fileName,this.currentActionButton);
      }
      this.dataSaveInProgress = true;
      this.checkForDownloadReport = false;
      this.apiService.ResetFileData();
    }
  }
  saveCallSubscribe(){
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    })
  }
  // CD
  setSaveResponce(saveFromDataRsponce){
    if(saveFromDataRsponce){
      let result = this.apiCallResponceService.saveFormResponceHandling(saveFromDataRsponce,this.showNotify,this.updateMode,this.currentActionButton,this.nextIndex,this.dataListForUpload,this.saveResponceData,this.custmizedFormValue,this.modifyCustmizedFormValue,this.dataSaveInProgress,this.isStepper,this.complete_object_payload_mode,this.form);      
      this.dataListForUpload =result.dataListForUpload;
      this.saveResponceData = result.saveResponceData;
      this.custmizedFormValue = result.custmizedFormValue;  
      this.modifyCustmizedFormValue = result.modifyCustmizedFormValue;
      this.updateMode = result.updateMode;
      this.complete_object_payload_mode=result.complete_object_payload_mode;
      this.showNotify = result.showNotify;
      this.dataSaveInProgress = result.dataSaveInProgress;
      // if(result.isStepper) this.stepper.reset();
      if(result.resetForm) this.checkBeforeResetForm();
      if(result.next) this.next();
      if(result.public.check){
        if(result.public.getFormData && Object.keys(result.public.getFormData).length > 0){
          this.apiService.GetForm(result.public.getFormData);
        }
        this.router.navigate([result.public.url]);
      }
      
      if(result.resetResponce) this.apiService.ResetSaveResponce();
      if(result.successAction) this.checkOnSuccessAction();
      if(this.additionalData?.enableScanner && result.message.class == "bg-success"){
        result.message.msg = "";
      }
      if(result.message && result.message.msg && result.message.msg != ''){
        this.notificationService.showAlert(result.message.msg,'',['Dismiss']);
      } 
      // if(this.saveResponceSubscription){
      //   this.saveResponceSubscription.unsubscribe();
      // }

    }
  }
  async downloadFileFromUrl(imageUrl: string, fileName?: string,file?:any) {
    await this.loaderService.showLoader("blank");
    let splitUrl = imageUrl.split('?')[0];
    fileName = splitUrl.split('/').pop();
    if(imageUrl){
      // const mediaPermissions = await this.appDownloadService.checkFileSystemPermission();
      // const newPermission = await this.appPermissionService.requestMediaPermission();
      let response:any;        
      let directoryName = 'DOCUMENTS';
      response = await this.appDownloadService.saveAndGetFileUriFromUrl(imageUrl,fileName,directoryName);
      if(response?.haspermission){
        await this.loaderService.hideLoader();
        if(response?.path){
          const confirm = await this.notificationService.confirmAlert(fileName, "Downloaded into " + directoryName + ". Do you want to open it ?", "Open");
          if(confirm == "confirm"){
            FileOpener.open({filePath:response?.path, openWithDefault:true,}).then( res => {
              console.log("File Opened");
            }).catch((e)=>{
              console.error("File Opening error ", JSON.stringify(e));
            })
          }
        }else{
          this.notificationService.presentToastOnBottom("Something went wrong Please retry.");
        }
      }else{
        await this.loaderService.hideLoader();
        this.notificationService.presentToastOnBottom("Please allow media access permission to download !");
      }
    }else{      
      this.commonFunctionService.downloadFile(file);
    }
    await this.loaderService.hideLoader();
  }
  // CD
  setFileDownloadUrl(fileDownloadUrl){
    if (fileDownloadUrl != '' && fileDownloadUrl != null && this.downloadClick != '') {
      this.downloadService.download(fileDownloadUrl,this.downloadClick,this.currentActionButton);
      this.downloadClick = '';
      this.dataSaveInProgress = true;
      this.apiService.ResetDownloadUrl();
    }
  }
  // CD
  openNextForm(next) {
    const field = this.multipleFormService.getNextFormObject(this.nextFormData,next);
    this.storeFormDetails('', field);
  }
  // CD
  updateRunningData(listData:any){
    if (this.editedRowIndex >= 0) {
      this.selectedRowIndex = this.editedRowIndex;
      if(this.childData && this.childData._id){
        if(listData && listData.length > 0){
          if(this.childData._id == listData[0]._id){
            this.editedRowData(listData[0]);
          }
        }else{
          this.editedRowData(this.childData);
        }
      }
    }else{
      this.selectedRowIndex = -1;
      if(this.editedRowIndex == -1) {
        if(listData && listData._id == undefined) {
          setTimeout(() => {
            this.updateDataOnFormField(listData);
          }, 100);
        }
      }
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
  // Subscriber Functions Handling End ---------------

  // Unsubscribe Functions Handling Start -------------------
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
    if(this.gridSelectionOpenOrNotSubscription){
      this.gridSelectionOpenOrNotSubscription.unsubscribe();
    }
    if(this.gridRealTimeDataSubscription){
      this.gridRealTimeDataSubscription.unsubscribe();
    }

  }
  // Unsubscribe Functions Handling End -------------------

  // Click Function Handling Start ---------------------------
  // CD
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
            // this.previewModal(this.selectedRow,this.currentMenu,'form-preview-modal');
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
  compareFn(o1: any, o2: any):boolean {
    return o1 && o2 ? o1._id === o2._id : o1 === o2;
  }
  // CD
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
    // below code added for reset list_of_string in the list_of_fields
    let keyName = this.commonFunctionService.custmizedKey(field);
    if(this.custmizedFormValue[keyName]) this.custmizedFormValue[keyName] = {};
  }
  // CD
  updateListofFields(field,object,index){ 
    let searchValue = this.term[field.field_name];
    let correctIndex = index;
    let data = this.custmizedFormValue[field.field_name];    
    if(searchValue != '' || data && data.length > this.pageSize){
      if(searchValue == undefined || searchValue == ''){
        searchValue = 'this.pageNo';
      }
      correctIndex = this.commonFunctionService.getCorrectIndex(object,index,field,data,searchValue);
    }    
    this.storeFormDetails("",field,index); 
  }
  // CD
  editListOfFiedls(field:any,index:number){
    let responce = this.formControlService.editeListFieldData(this.templateForm,this.custmizedFormValue,this.tableFields,field,index,this.listOfFieldsUpdateIndex,this.staticData,this.dataListForUpload);
    this.listOfFieldUpdateMode = responce['listOfFieldUpdateMode'];
    this.listOfFieldsUpdateIndex = responce['listOfFieldsUpdateIndex'];
    this.custmizedFormValue = responce['custmizedFormValue'];
    this.dataListForUpload = responce['dataListForUpload'];
    this.templateForm = responce['templateForm'];
  }
  // CD
  editListOfString(parentfield,field,index){
    let response = this.formControlService.editListOfString(parentfield,field,index,this.custmizedFormValue,this.templateForm);
    this.templateForm = response.templateForm;
    if(parentfield != ''){
      this.addOrUpdateIconShowHideList[parentfield.field_name+'_'+field.field_name+'_index'] = index;
      this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = false;
    }else{
      this.addOrUpdateIconShowHideList[field.field_name+'_index'] = index;
      this.tempVal[field.field_name + "_add_button"] = false;
    }
  }  
  async removeAttachedDataFromList(index:number,fieldName:any){
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');
    if(confirmDelete == "confirm"){
      this.dataListForUpload[fieldName].splice(index,1)
    }else{
      this.cancel();
    }
  }
  async openModal(id, index, parent,child, data, alertType) {
    this.deleteIndex = index;
    if(parent != ''){
      this.deletefieldName['parent'] = parent;
      this.deletefieldName['child'] = child;
    }else{
      this.deletefieldName['child'] = child;
    }
    let confirmDelete:any = await this.notificationService.confirmAlert('Are you sure?','Delete This record.');    
    this.alertResponce(confirmDelete);
  }
  // CD
  async dismissModal(){
    if(this.updateMode && this.multipleFormCollection.length > 0){      
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
      this.modifyCustmizedFormValue = {};
    }
    if(this.multipleFormCollection.length > 0){
      this.multipleFormCollection = this.multipleFormService.setPreviousFormTargetFieldData(this.multipleFormCollection,this.getFormValue(true));
    }
    this.resetForm();
    this.updateMode=false;
    this.dataListForUpload = [];
    this.filePreviewFields = [];

    this.resetFlagForOnchange();
    this.close();
    
  }
  // CD
  updateAddNewField(parent,child){
    if(child && child.onchange_get_next_form){
      let fieldValue:any = '';
      if(parent != ''){
        fieldValue = this.templateForm.get(parent.field_name).get(child.field_name).value;
      }else{
        fieldValue = this.templateForm.get(child.field_name).value;
      }
      if(fieldValue && fieldValue._id && fieldValue._id != ''){
        this.onchangeNextForm = true;
        const reqCriteria = ["_id;eq;" + fieldValue._id + ";STATIC"];
        const reqParams = child.api_params;
        this.multipleFormService.getDataForNextForm(reqParams,reqCriteria);
        this.tempVal[child.field_name + "_add_button"] = false;
      }
    }else{
      this.storeFormDetails(parent,child);
      this.updateAddNew = true;
    }    
  }
  // CD
  addListOfFields(field){
    this.storeFormDetails("",field);
    if(this.samePageGridSelection){
      this.samePageGridSelection = false;
    }
  }
  // CD
  showListOfFieldData(field,index,item){
    let value={};
    let parentObject = this.custmizedFormValue[field.field_name];
    let listOfField = parentObject[index];
    value['data'] = listOfField[item.field_name];
    let editemode = false;   
    switch (item.type) {
      case "typeahead":
          if(item.datatype == "list_of_object"){    
            // this.viewModal('form_basic-modal', value, item,editemode);
          }          
          break;
      case "list_of_string":
      case "list_of_checkbox":
      case "grid_selection":
      case "list_of_fields":
      case "info":
        if(item["gridColumns"] && item["gridColumns"].length > 0){
          value['gridColumns']=item.gridColumns;
        }else if(item["fields"] && item["fields"].length > 0){
          value['gridColumns']=item.fields;
        }
        // this.viewModal('form_basic-modal', value, item,editemode);
        this.viewModal(value, item, index,editemode);
        break;
      case "file":
        if (value['data'] && value['data'] != '') {
          let fileData = {};
          fileData['data'] = this.fileHandlerService.modifyUploadFiles(value['data']);
          // this.viewModal('fileview-grid-modal', fileData, item, editemode);
          // Extra code for App Changes
          let previewFile:boolean = false;
          let printFile:boolean = false;
          if(field.type.toLowerCase() == "file_with_preview"){
            previewFile = true;
          }else if(field.type.toLowerCase() == "file_with_print"){
            printFile = true;
          }
          const obj = {
            'field_type': field.type.toLowerCase(),
            'previewFile': previewFile,
            'printFile' : printFile
          }
          this.viewFileModal(FileViewsModalComponent, value, field, index, field.field_name,editemode,obj);
        };
        break;      
      default:
        break;
    } 
  }
  // CD
  reviewParameters(fields,data){
    this.clickFieldName=fields;
    let value={};
    value['data'] = JSON.parse(JSON.stringify(data));
    value['gridColumns']=fields.gridColumns;
    const editemode = true;    
    // this.viewModal('form_basic-modal', value, fields,editemode); 
    // Extra code for APP
    if (!this.custmizedFormValue[fields.field_name]) this.custmizedFormValue[fields.field_name] = [];
    let selectedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[fields.field_name]))
    const gridModalData = {
      "field": fields,
      "selectedData":selectedValue,
      "object": this.getFormValue(true),
      "formTypeName" : this.formTypeName,
      
    }
    this.samePageGridSelection = this.appDataShareService.getgridselectioncheckvalue();
    if(this.samePageGridSelection){
      this.curTreeViewField = fields;      
      this.samePageGridSelectionData = gridModalData;
    }
  }
  // Click Function Handling End --------------------

  // Change Event & KeyUp Event Function Handling Start ---------------------
  // CD
  setValue(parentfield:any,field:any,add?:any,event?:any) {
    let formValue = this.templateForm.getRawValue();
    let formValueWithoutCustomData = this.getFormValue(false);
    let formValueWithCustomData = this.getFormValue(true);
    this.curFormField = field;
    this.curParentFormField = parentfield;
    switch (field.type) {
      case "list_of_string":
        if (add) {
          if(parentfield != ''){
            const custmizedKey = this.commonFunctionService.custmizedKey(parentfield);   
            const value = this.coreFunctionService.removeSpaceFromString(formValue[parentfield.field_name][field.field_name]);
            const checkDublic = this.checkIfService.checkDataAlreadyAddedInListOrNot(field,value, this.custmizedFormValue[custmizedKey]?.[field.field_name] ?? undefined);
            if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][field.field_name] && checkDublic.status){
              // this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
              this.notificationService.presentToastWithButton('Entered value for '+field.label+' is already added. !!!' ,'danger');
            }else{
              if (!this.custmizedFormValue[custmizedKey]) this.custmizedFormValue[custmizedKey] = {};
              if (!this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
              const custmizedFormValueParant = Object.assign([],this.custmizedFormValue[custmizedKey][field.field_name])
              if(value != '' && value != null){
                let index = -1;
                if(this.addOrUpdateIconShowHideList && this.addOrUpdateIconShowHideList[parentfield.field_name+'_'+field.field_name+'_index']>=0){
                  index = this.addOrUpdateIconShowHideList[parentfield.field_name+'_'+field.field_name+'_index']
                }
                let updateCustomizedValueResponse = this.formControlService.updateCustomizedValue(custmizedFormValueParant, index, value);                
                // custmizedFormValueParant.push(value)          
                this.custmizedFormValue[custmizedKey][field.field_name] = custmizedFormValueParant;
                this.addOrUpdateIconShowHideList = {};
              }
              if(event){
                event.value = '';
              }
              this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
              //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
              this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
            }
            
          }else{
            const value = this.coreFunctionService.removeSpaceFromString(formValue[field.field_name]);
            const checkDublic = this.checkIfService.checkDataAlreadyAddedInListOrNot(field,value,this.custmizedFormValue[field.field_name]);
            if(this.custmizedFormValue[field.field_name] && checkDublic.status){
              // this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
              this.notificationService.presentToastWithButton('Entered value for '+field.label+' is already added. !!!' ,'danger');
            }else{
              if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
              const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
              // if(formValue[field.field_name] != '' && formValue[field.field_name] != null){
              //   custmizedFormValue.push(formValue[field.field_name])
              //   this.custmizedFormValue[field.field_name] = custmizedFormValue;
              // }
              if(value != '' && value != null){
                let index = -1;
                if(this.addOrUpdateIconShowHideList && this.addOrUpdateIconShowHideList[field.field_name+'_index']>=0){
                  index = this.addOrUpdateIconShowHideList[field.field_name+'_index']
                }
                let updateCustomizedValueResponse = this.formControlService.updateCustomizedValue(custmizedFormValue, index, value);
                this.custmizedFormValue[field.field_name] = updateCustomizedValueResponse.custmizedFormValue;
                this.addOrUpdateIconShowHideList = {};
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
              this.addOrUpdateIconShowHideList = {};
            }            
          }else{
            if(formValue && formValue[field.field_name] && formValue[field.field_name].length > 0){
              this.tempVal[field.field_name + "_add_button"] = false;
            }else{
              this.tempVal[field.field_name + "_add_button"] = true;
              this.addOrUpdateIconShowHideList = {};
            }
          } 
        }
        break;
      case "typeahead":
        if(field.datatype == 'list_of_object' || field.datatype == 'chips' || field.datatype == 'object'){
          if (add) {
            if(parentfield != ''){
              const value = formValue[parentfield.field_name][field.field_name]
              const custmizedKey = this.commonFunctionService.custmizedKey(parentfield);
              const checkDublic = this.checkIfService.checkDataAlreadyAddedInListOrNot(field,value, this.custmizedFormValue[custmizedKey]?.[field.field_name] ?? undefined);
              if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][field.field_name] && checkDublic.status){
                // this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
                this.notificationService.presentToastWithButton('Entered value for '+field.label+' is already added. !!!' ,'danger');
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
              const checkDublic = this.checkIfService.checkDataAlreadyAddedInListOrNot(field,value,this.custmizedFormValue[field.field_name]);
                if(this.custmizedFormValue[field.field_name] && checkDublic.status){
                  // this.notificationService.showAlert('Entered value for '+field.label+' is already added. !!!' ,'',['Dismiss']);
                  this.notificationService.presentToastWithButton('Entered value for '+field.label+' is already added. !!!' ,'danger');
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
                this.multipleFormService.getDataForNextForm(reqParams,reqCriteria);
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
                if(formValue[field.field_name] && formValue[field.field_name]['value']){
                  value = formValue[field.field_name]['value']; 
                }else{
                  value = formValue[field.field_name]
                }

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
        let list = [];
        if(this.custmizedFormValue[field.field_name]){
          list = this.custmizedFormValue[field.field_name];
        }
        let checkDublicate = this.checkIfService.checkDublicateOnForm(field.list_of_fields,formValue[field.field_name],list,this.listOfFieldsUpdateIndex,this.showIfFieldList,this.custmizedFormValue,this.dataListForUpload,this.templateForm,field);
        if (!checkDublicate.status) {
          if(this.listOfFieldsUpdateIndex != -1){
              let updateCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
              Object.keys(formValue[field.field_name]).forEach(key => {
                updateCustmizedValue[this.listOfFieldsUpdateIndex][key] = formValue[field.field_name][key];
              })
              let keyName = this.commonFunctionService.custmizedKey(field);
              if(this.custmizedFormValue[keyName]){
                Object.keys(this.custmizedFormValue[keyName]).forEach(childkey => {
                  updateCustmizedValue[this.listOfFieldsUpdateIndex][childkey] = this.custmizedFormValue[keyName][childkey];
                })
              }
              if(this.dataListForUpload[keyName]){
                Object.keys(this.dataListForUpload[keyName]).forEach(childkey => {                  
                  updateCustmizedValue[this.listOfFieldsUpdateIndex][childkey] = this.fileHandlerService.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);
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
              this.custmizedFormValue[field.field_name] =   updateCustmizedValue; 

              // This code for add list of field object modify for user view

              const modifyCustmizedFormValue = Object.assign([],this.modifyCustmizedFormValue[field.field_name]);
              let updateObject = updateCustmizedValue[this.listOfFieldsUpdateIndex];
              let modifyObject = this.gridCommonFunctionService.getModifyListOfFieldsObject(field,updateObject,field.list_of_fields);
              modifyCustmizedFormValue[this.listOfFieldsUpdateIndex] = modifyObject;
              this.modifyCustmizedFormValue[field.field_name] = modifyCustmizedFormValue;

              // This code for add list of field object modify for user view

              this.custmizedFormValue[keyName] = {};
              this.dataListForUpload[keyName] = {};
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
                  listOfFieldData[childkey] = this.fileHandlerService.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);
                })
                // this.dataListForUpload[keyName] = {};
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

              // This code for add list of field object modify for user view
              const modifyCustmizedFormValue = Object.assign([],this.modifyCustmizedFormValue[field.field_name]);
              let modifyObject = this.gridCommonFunctionService.getModifyListOfFieldsObject(field,listOfFieldData,field.list_of_fields);
              modifyCustmizedFormValue.push(modifyObject);
              this.modifyCustmizedFormValue[field.field_name] = modifyCustmizedFormValue;
              // This code for add list of field object modify for user view

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
        }else{
          this.notificationService.presentToastOnBottom(checkDublicate.msg,"danger");
        }
        break;
      case 'grid_selection':
        //----------------------this is for confirm modal to add or remove (form component confirm modal) when grid selection field is open.
        this.dataShareService.setIsGridSelectionOpenOrNot(false);
        this.curTreeViewField = field;
        this.currentTreeViewFieldParent = parentfield;
        if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
        // let selectedData = this.getGridSelectedData(this.custmizedFormValue[field.field_name],field);
        // const gridModalData = {
        //   "field": this.curTreeViewField,
        //   "selectedData":selectedData,
        //   "object": this.getFormValue(true)
        // }
        //this.modalService.open('grid-selection-modal', gridModalData);
        this.openGridSelectionModal(field);
        break;
      case 'grid_selection_vertical':
        //----------------------this is for confirm modal to add or remove (form component confirm modal) when grid selection field is open.
        this.dataShareService.setIsGridSelectionOpenOrNot(false);
        this.curTreeViewField = field;
        this.currentTreeViewFieldParent = parentfield;
        if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
        // let selectedData = this.getGridSelectedData(this.custmizedFormValue[field.field_name],field);
        let gridSelectedData = this.gridCommonFunctionService.getGridSelectedData(this.custmizedFormValue[field.field_name],field);
        let selectedData = gridSelectedData.gridSelectedData;
        this.customEntryData = gridSelectedData.customEntryData;
        let alreadyAdded = false;
        if(selectedData && selectedData.length>0){
          selectedData.forEach(element => {
            if(element){
              alreadyAdded = true;
            }
          });
        }
        const gridModalData = {
          "field": this.curTreeViewField,
          "value":selectedData[0],
          "column":field.gridColumns,
          "alreadyAdded":alreadyAdded,
          "parentObject": formValueWithCustomData
        }
        this.openGridSelectionDetailModal(gridModalData);
        break;
      default:
        break;
    }
    
    if (field.onchange_api_params && field.onchange_call_back_field) {
        let multiCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
        let formValue = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,formValueWithoutCustomData);
        this.changeDropdown(field, formValue,field.onchange_data_template);
    }

    if (field.onchange_function && field.onchange_function_param && field.onchange_function_param != "") {
      switch (field.onchange_function_param) {        
          case 'autopopulateFields':
            this.limsCalculationsService.autopopulateFields(this.templateForm);
            break;
        default:
          this.inputOnChangeFunc('',field);
      }
    }
    let objectValue:string = "";
    let supporting_field_type = "";
    let typeofObject = typeof formValue[field.field_name];
    if(typeofObject && typeofObject !=undefined && typeofObject == 'object' && formValue[field.field_name]){
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
      });    
      }      
    }  
 
    if (field.type == 'typeahead') {
      this.clearTypeaheadData();
    }
    this.term = {};
    // this.checkFormFieldIfCondition();
  }
  // CD
  updateData(event, parentfield, field) {
    // if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13 || event.keyCode == 27 || event.keyCode == 9){
    //   return false;
    // } 
    const value = event.target.value;
    // this.templateForm.get(field.field_name).setValue(value);
    let objectValue = this.getFormValue(false);
    // Extra code for App
    if(objectValue[field.field_name] == null || objectValue[field.field_name] == "" || typeof  objectValue[field.field_name] == "object"){
      objectValue[field.field_name] = value;
    }
    // =============
    const fieldValue = this.commonFunctionService.getObjectValue(field.field_name,objectValue);
    this.lastTypeaheadTypeValue = fieldValue;
    if(fieldValue != '' && fieldValue != undefined){
      this.addNewRecord = true;
    }else{
      this.addNewRecord = false;
    }
    if(field.datatype == 'text'){
      let typeaheadTextControl:any = {}
      if(parentfield != ''){
        typeaheadTextControl = this.templateForm.get(parentfield.field_name).get(field.field_name);    
      }else{
        typeaheadTextControl = this.templateForm.controls[field.field_name];
      }  
      if(objectValue[field.field_name] == null || objectValue[field.field_name] == '' || objectValue[field.field_name] == undefined){
        if(field.is_mandatory){
          typeaheadTextControl.setErrors({ required: true });
        }else{
          typeaheadTextControl.setErrors(null);
        }        
      }else{        
        typeaheadTextControl.setErrors({ validDataText: true });
      }      
    }
    this.callTypeaheadData(field,objectValue);
    if(parentfield != ''){
      this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;      
    }else{
      this.tempVal[field.field_name + "_add_button"] = true;
    }
  }
  // CD
  inputOnChangeFunc(parent,field) {
    if(parent && parent != '' && parent.field_name && parent.field_name != ""){
      field['parent'] = parent.field_name;
    }
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
      let multipleCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
      let multiFormValue = this.commonFunctionService.getFormDataInMultiformCollection(multipleCollection,tamplateFormValue)
      let calFormValue = {};
      let list_of_populated_fields = [];
      switch (field.onchange_function_param) {
        case 'calculate_quote_amount':          
          calFormValue = this.limsCalculationsService.calculate_quotation(tamplateFormValue,"standard", field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_quote_amount_for_lims':          
          calFormValue = this.limsCalculationsService.calculate_quotation_for_lims(tamplateFormValue,"standard", field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_quotation_with_subsequent':          
          calFormValue = this.limsCalculationsService.calculate_quotation_with_subsequent(tamplateFormValue,"standard", field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_automotive_quotation':          
          calFormValue = this.limsCalculationsService.calculate_quotation(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_po_row_item':          
          calFormValue = this.limsCalculationsService.calculate_po_row_item(tamplateFormValue1,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_manual_row_item':          
          calFormValue = this.limsCalculationsService.calculate_manual_row_item(tamplateFormValue1,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'update_invoice_total_on_custom_field':          
          calFormValue = this.limsCalculationsService.update_invoice_total_on_custom_field(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
          break; 
        case 'credit_note_invoice_calculation':          
          calFormValue = this.limsCalculationsService.credit_note_invoice_calculation(tamplateFormValue,"standard" ,field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_lims_invoice':          
          calFormValue = this.limsCalculationsService.calculate_lims_invoice(tamplateFormValue,"automotive" ,field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_lims_invoice_extra_amount':          
        calFormValue = this.limsCalculationsService.calculate_lims_invoice_extra_amount(tamplateFormValue,"automotive" ,field);
        this.updateDataOnFormField(calFormValue);
          break;
        case 'calculate_lims_invoice_with_po_items':
          let val = this.limsCalculationsService.calculate_lims_invoice_with_po_items(tamplateFormValue,"","");
          this.updateDataOnFormField(val);
          break;
        case 'calculate_lims_invoice_with_manual_items':
          let val1 = this.limsCalculationsService.calculate_lims_invoice_with_manual_items(tamplateFormValue,"",field);
          this.updateDataOnFormField(val1);
          break;
        case 'getDateInStringFunction':
          calFormValue = this.commonFunctionService.getDateInStringFunction(tamplateFormValue);
          this.updateDataOnFormField(calFormValue); 
          break;
        case 'getTaWithCalculation':
          calFormValue = this.limsCalculationsService.getTaWithCalculation(tamplateFormValue1);
          this.updateDataOnFormField(calFormValue); 
          calFormValue = this.limsCalculationsService.calculateTotalFair(this.templateForm.getRawValue());
          this.updateDataOnFormField(calFormValue); 
          break;
        case 'funModeTravelChange':
          calFormValue = this.commonFunctionService.funModeTravelChange(tamplateFormValue1);
          this.updateDataOnFormField(calFormValue);
          calFormValue = this.limsCalculationsService.calculateTotalFair(this.templateForm.getRawValue());
          this.updateDataOnFormField(calFormValue);
          break;

        // case 'quote_amount_via_sample_no':
        //   calFormValue = this.limsCalculationsService.quote_amount_via_sample_no(tamplateFormValue,this.custmizedFormValue['quotation_param_methods']);
        //   this.updateDataOnFormField(calFormValue);
        // break;
        // case 'quote_amount_via_discount_percent':
        //   calFormValue = this.limsCalculationsService.quote_amount_via_discount_percent(this.custmizedFormValue['quotation_param_methods'], tamplateFormValue);
        //   this.updateDataOnFormField(calFormValue);
        // break;

        case 'samplingAmountAddition':          
          calFormValue = this.limsCalculationsService.samplingAmountAddition(tamplateFormValue);
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
          this.updateDataOnFormField(calFormValue); 
          break;
        case 'job_card_series':
          list_of_populated_fields=[
            {"from":"tl_name.name+service_line.name+parent_company.name+/","to":"job_card_name"},
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
          this.updateDataOnFormField(calFormValue); 
          break;
        case 'calculation_travel_claim_sheet':
          calFormValue = this.limsCalculationsService.calculateTotalFair(this.templateForm.getRawValue());
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
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
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.populate_fields_for_report(this.templateForm);
          break;
        case 'manufactured_as_customer':
          if(field.listOfPopulatedFields && field.listOfPopulatedFields.length > 0){
            let keysList = ["from","to"]
            let seprator = ":";
            list_of_populated_fields = this.commonFunctionService.convertListOfStringToListObject(field.listOfPopulatedFields,keysList,seprator);
          }else{
            list_of_populated_fields = [
              {"from":"account.name", "to":"sample_details.mfg_by"}
            ]
          }
          let multiCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field,multiCollection);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.manufactured_as_customer(this.templateForm);
          break;
        case 'manufactured_as_customer_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"sample_booking.name", "to":"sample_details.mfg_by"}
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.manufactured_as_customer(this.templateForm);
          break;
        case 'supplied_as_customer':
          if(field.listOfPopulatedFields && field.listOfPopulatedFields.length > 0){
            let keysList = ["from","to"];
            let seprator = ":";
            list_of_populated_fields = this.commonFunctionService.convertListOfStringToListObject(field.listOfPopulatedFields,keysList,seprator);
          }else{
            list_of_populated_fields = [
              {"from":"account.name", "to":"sample_details.supplied_by"}
            ]
          }
           let multiCollection1 = JSON.parse(JSON.stringify(this.multipleFormCollection));
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field,multiCollection1);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.supplied_as_customer(this.templateForm);
          break;
        case 'supplied_as_customer_for_new_order_flow':
          list_of_populated_fields = [
            {"from":"sample_booking.name", "to":"sample_details.supplied_by"}
          ]
          calFormValue = this.commonFunctionService.populatefields(this.templateForm.getRawValue(), list_of_populated_fields,field);
          this.updateDataOnFormField(calFormValue);
          // this.commonFunctionService.supplied_as_customer(this.templateForm);
          break;
        case 'buggetForcastCalc':
          this.limsCalculationsService.buggetForcastCalc(this.templateForm.getRawValue());
          break;
        case 'calculate_next_calibration_due_date':
            this.limsCalculationsService.calculate_next_calibration_due_date(this.templateForm.getRawValue());
          break;
        case 'get_percent':
          calFormValue = this.limsCalculationsService.getPercent(this.templateForm.getRawValue(),parent, field);
          this.updateDataOnFormField(calFormValue);
          break;
        case 'CALCULATE_TOTAL_AMOUNT':
          calFormValue = this.limsCalculationsService.calculateTotalAmount(tamplateFormValue)
          this.updateDataOnFormField(calFormValue);
          break;   
        case 'checkSampleQuantity':          
          if(field && field.onchange_function_param_criteria && field.onchange_function_param_criteria != ''){
            let check = true;
            let object = {}
            let fieldName = field.field_name;
            if(this.multipleFormCollection.length > 0){
              let multipleCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
              object = this.commonFunctionService.getFormDataInMultiformCollection(multipleCollection,tamplateFormValue)
            }else{
              object = tamplateFormValue;
            }
            let value = this.commonFunctionService.getObjectValue(fieldName,object);
            if(value && value != null && value != ""){
              if(field.onchange_function_param_criteria.length > 0){
                for (let index = 0; index < field.onchange_function_param_criteria.length; index++) {
                  const cr = field.onchange_function_param_criteria[index];
                  let crList = cr.split("#");            
                  let listValue = this.commonFunctionService.getObjectValue(crList[2],object);            
                  if(listValue && listValue != null && this.commonFunctionService.isArray(listValue) && listValue.length > 0){
                    listValue.forEach(listData => {
                      const val = +this.commonFunctionService.getObjectValue(fieldName,listData);
                      value = value + val;
                    });
                  }
                  let criteria = crList[0]+"#"+crList[1]+"#"+value;
                  check = this.checkIfService.checkIfCondition(criteria,object);
                  if(!check){
                    break;
                  } 
                }              
              }         
              let fieldControl = this.templateForm.controls[fieldName];
              if(!check){              
                fieldControl.setErrors({ notValid : true });
                this.notificationService.showAlert("Please update the sample Qty as all samples has consumed.","Error!",['Dismiss']);
              }else{
                fieldControl.setErrors(null);
              }
            }
          }          
          break; 
        case "calculate_balance_amount_engagement_letter":
        calFormValue = this.limsCalculationsService.calculateBalanceAmountEngLetter(tamplateFormValue,multiFormValue);
        this.updateDataOnFormField(calFormValue);
          break;

        default:
          break;
      }
    }
    // this.checkFormFieldIfCondition();
  }
  // Change Event & KeyUp Event Function Handling End ---------------------
  
  // Click Function Dependency Start ------------------
  // CD
  changeDropdown(field, object,data_template) {
    let params = field.onchange_api_params;
    let callback = field.onchange_call_back_field;
    let criteria = field.onchange_api_params_criteria;
    const paramlist = params.split(";");
    let multiCollection = JSON.parse(JSON.stringify(this.multipleFormCollection));
    let completeObject = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,object);
    if(paramlist.length>1){
      
    }else{
      const payloads = []      
      if( params.indexOf("CLTFN") >= 0){
        const calculatedCost =  this.limsCalculationsService.calculateAdditionalCost(this.getFormValue(true));
        this.updateDataOnFormField(calculatedCost);
      }
      else{
        payloads.push(this.apiCallService.checkQtmpApi(params,field,this.apiCallService.getPaylodWithCriteria(params, callback, criteria, completeObject,data_template),this.multipleFormCollection,this.getFormValue(false),this.getFormValue(true))); 
        this.callStaticData(payloads);
      }
    }
  }
  // CD
  getSavePayloadData(dataWithCustValue?:any) {
    let formValue = this.templateForm.getRawValue();
    let formValueWithCustomData = dataWithCustValue;
    if(dataWithCustValue == undefined){
      formValueWithCustomData = this.getFormValue(true);
    }    
    let formDataResponce = this.formValueService.getSavePayloadData(this.currentMenu,this.updateMode,this.deleteGridRowData,this.tableFields,formValue,formValueWithCustomData,this.gridSelectionMendetoryList,this.selectedRow,this.custmizedFormValue,this.dataSaveInProgress,this.showNotify,this.formName,this.templateForm.valid);   
    this.deleteGridRowData = formDataResponce.deleteGridRowData;     
    if(this.dataSaveInProgress){
      this.getSavePayload = formDataResponce.getSavePayload;
      this.showNotify = formDataResponce.showNotify;
      this.dataSaveInProgress = formDataResponce.dataSaveInProgress;
      if(!formDataResponce?.data?.data['platForm'] || formDataResponce?.data?.data['platForm']) formDataResponce.data.data['platForm'] = Capacitor.getPlatform().toUpperCase();
      return formDataResponce.data;
    }else{
      let message = formDataResponce.message;
      if(message && message.msg && message.msg != ""){
        this.notificationService.showAlert(message.class,'',['Dismiss']);
      }
    }
  }
  saveFormData(confirmation?:any){
    let dataWithCustValue = this.getFormValue(true);
    let checkValidatiaon = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(false),true,dataWithCustValue);
    if(typeof checkValidatiaon != 'object'){
      const saveFromData = this.getSavePayloadData(dataWithCustValue);
      // if(this.isSavedDuplicateData) {
      //   saveFromData['data']['confirmationRequired'] = true;
      // }
      // if(this.bulkupdates){
      //   saveFromData.data['data'] = this.bulkDataList;
      //   saveFromData.data['bulk_update'] = true;
      // }
      if(confirmation && confirmation.confirm){
        let formField = confirmation.griddata.field_name;
        saveFromData[formField] = {
          'latitude' : this.latitude,
          'longitude' : this.longitude,
          'address' : this.address,
        }
      }
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
  close(){
    this.apiService.resetStaticAllData();
    this.staticData = {};
    this.typeAheadData = [];
    this.latitude = 0;
    this.longitude = 0;
    this.address = "";
    //this.commonFunctionService.resetStaticAllData();
    this.selectedRow = {};
    // this.showGridData={};
    this.treeViewData={};
    // this.isSavedDuplicateData = false;
    this.checkFormAfterCloseModel();
  }
  // CD
  checkFormAfterCloseModel(){
    if(this.multipleFormCollection.length > 0){
      this.loadPreviousForm();
    }else{
      // this.dismissModal();
      this.addAndUpdateResponce.emit('close');
      if(this.templateForm && this.templateForm.controls){
        this.templateForm.reset();
      }
      this.closeModal();
    }
  }
  async closeModal(){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss(undefined,"confirmed");
    }else{
      this.modalController.dismiss(undefined,"confirmed",);
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
  alertResponce(responce) {
    if (responce === "confirm") {
      this.deleteitem()
    } else {
      this.cancel();
    }
  }
  // CD
  deleteitem() {
    const custmizedKeyChild = this.deletefieldName['child'].field_name;
    if(this.deletefieldName['parent'] != undefined && this.deletefieldName['parent'] != null && this.deletefieldName['parent'] != ''){
      const custmizedKeyParent = this.commonFunctionService.custmizedKey(this.deletefieldName['parent']) 
      let deleteCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[custmizedKeyParent][custmizedKeyChild]))
      deleteCustmizedValue.splice(this.deleteIndex, 1);
      if(this.modifyCustmizedFormValue[custmizedKeyParent] && this.modifyCustmizedFormValue[custmizedKeyParent][custmizedKeyChild]) this.modifyCustmizedFormValue[custmizedKeyParent][custmizedKeyChild].splice(this.deleteIndex,1);
      this.custmizedFormValue[custmizedKeyParent][custmizedKeyChild] = deleteCustmizedValue;
    }else{

      if(this.deletefieldName['child'].datatype == 'key_value'){
        delete this.custmizedFormValue[custmizedKeyChild][this.deleteIndex];
        delete this.modifyCustmizedFormValue[custmizedKeyChild][this.deleteIndex];
      }else{
        let deleteCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[custmizedKeyChild]))
        deleteCustmizedValue.splice(this.deleteIndex, 1);
        if(this.modifyCustmizedFormValue[custmizedKeyChild]) this.modifyCustmizedFormValue[custmizedKeyChild].splice(this.deleteIndex,1);
        this.custmizedFormValue[custmizedKeyChild] = deleteCustmizedValue;
        const field = this.deletefieldName['child']
        if(field.onchange_api_params != null && field.onchange_api_params != ''){
          if( field.onchange_api_params.indexOf("CLTFN") >= 0){
            const calculatedCost = this.limsCalculationsService.calculateAdditionalCost(this.getFormValue(true));
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
  // CD
  callTypeaheadData(field,objectValue){
    this.clearTypeaheadData();   
    const payload = [];
    const params = field.api_params;
    const criteria = field.api_params_criteria;
    payload.push(this.apiCallService.getPaylodWithCriteria(params, '', criteria, objectValue, field.data_template));
    this.apiService.GetTypeaheadData(payload);    
  }  
  async viewModal(value:any, field:any, i:number, editemode){
    let Data = {"data":value,
      "field":field,
      "index": i,
      "editemode": editemode
    }
    const objectValue = Data;
    await this.appModelService.openModal(ModalComponent,objectValue).then( data => {
      if(data && data?.role == 'close'){
        console.log('Modal ' + data?.role);
      }
    });
  }
  async viewFileModal(component:any, value, field, i,field_name,editemode,obj?,){    
    let objectValue:any = {
      'data' : value,
      'field' : field,
      'index' : i,
      'field_name': field_name,
      'editemode' : editemode,
      'field_type': obj?.field_type,
      'previewFile': obj?.previewFile,
      'printFile' : obj?.printFile
    }
    await this.appModelService.openModal(FileViewsModalComponent,{objectData:objectValue}).then( data => {
      if(data && data?.role == 'close'){
        console.log('Modal ' + data?.role);
      }
    });
  }  
  // CD
  nextForm(){
    if(this.nextFormData && this.nextFormData.formName){
      this.openNextForm(true);
      this.enableNextButton = false;
    }    
  }  
  // CD
  loadPreviousForm(){
    let multiFormLength = this.multipleFormCollection.length;
    const lastIndex = multiFormLength - 1;
    const formCollecition = this.multipleFormCollection[lastIndex];
    let previousFormData = {};
    if(multiFormLength > 1){
      previousFormData = this.multipleFormCollection[multiFormLength - 2];
    }
    this.form = formCollecition['form'];
    this.modal.id = this.form._id;
    this.resetFlagsForNewForm();
    const data = formCollecition['data'];

    this.updateMode = formCollecition['updateMode'];
    if(this.updateMode || this.complete_object_payload_mode){
      this.selectedRow = data;
    }
    this.setForm();
    this.updateDataOnFormField(data);
    this.getStaticDataWithDependentData();
    if(this.calculationFieldList && this.calculationFieldList.length > 0){
      this.callCalculation();
    }
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
    if(previousFormData && previousFormData['index'] != undefined && previousFormData['index'] >= 0){
      this.nextFormUpdateMode = true;
    }
    let previousFormFocusFieldValue = '';
    if(this.coreFunctionService.isNotBlank(this.previousFormFocusField.add_new_target_field)){
      previousFormFocusFieldValue = nextFormData[this.previousFormFocusField.add_new_target_field];
    }
    const parentfield = formCollecition['parent_field'];
    if(!this.previousFormFocusField.multi_select && this.previousFormFocusField.type != 'list_of_fields' && this.previousFormFocusField.type != 'hidden'){
      if(parentfield != ''){
        this.templateForm.get(parentfield.field_name).get(this.previousFormFocusField.field_name).setValue(previousFormFocusFieldValue);     
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
    if(this.focusFieldParent && this.focusFieldParent.type == "list_of_fields" && this.focusFieldParent.datatype == "list_of_object"){
      const listOfFieldUpdateMode = formCollecition['listOfFieldUpdateMode'];
      if(listOfFieldUpdateMode){
        const listOfFieldsUpdateIndex = formCollecition['listOfFieldsUpdateIndex'];
        if(listOfFieldsUpdateIndex != -1){
          const fieldName = this.focusFieldParent.field_name;
          if(fieldName && fieldName != ""){
            const listData = data[fieldName];
            const editedData = listData[listOfFieldsUpdateIndex];
            this.editListOfFiedls(listOfFieldsUpdateIndex,this.focusFieldParent);
          }          
        }
      }
    }   
    this.multipleFormCollection.splice(lastIndex,1);    
  }
  // CD
  callCalculation(){
    if(this.calculationFieldList && this.calculationFieldList.length > 0){
      for (var i = 0;i<this.calculationFieldList.length ;++i){
        let element = this.calculationFieldList[i];
        switch (element.onchange_function_param) {        
            case 'autopopulateFields':
              this.limsCalculationsService.autopopulateFields(this.templateForm);
              break;
          default:
            this.inputOnChangeFunc('',element);
        }
      }
    }
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
  // CD
  setListoffieldData(){
    const previousFormIndex = this.multipleFormCollection.length - 1;
    const previousFormCollection = this.multipleFormCollection[previousFormIndex];
    const previousFormField = previousFormCollection.current_field;
    let formValueWithCustomData = this.getFormValue(true);
    const currentFormValue = JSON.parse(JSON.stringify(this.commonFunctionService.sanitizeObject(this.tableFields,formValueWithCustomData,false)));
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
          let checkDublicate = this.checkIfService.checkDublicateOnForm(this.tableFields,this.templateForm.getRawValue(),fieldData,index,this.showIfFieldList,this.custmizedFormValue,this.dataListForUpload,this.templateForm);
          if(!checkDublicate.status){
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
              this.modifyCustmizedFormValue = {};
              this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(fieldData));
              this.modifyCustmizedValue(fieldName);
              previousformData[fieldName] = this.custmizedFormValue[fieldName];
              this.multipleFormCollection[previousFormIndex]['data'] = previousformData; 
              this.nextFormUpdateMode = false;
              this.close();
            }else{
              this.donotResetField();
              this.custmizedFormValue = {};
              this.modifyCustmizedFormValue = {};
              this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(fieldData));
              this.modifyCustmizedValue(fieldName);
              previousformData[fieldName] = this.custmizedFormValue[fieldName];
              this.multipleFormCollection[previousFormIndex]['data'] = previousformData; 

              
              this.templateForm.reset()
              if(Object.keys(this.donotResetFieldLists).length > 0){
                this.updateDataOnFormField(this.donotResetFieldLists);
                this.donotResetFieldLists = {};
              }

            }
          }else{
            this.notificationService.presentToastOnBottom(checkDublicate.msg, "danger");
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
  // CD
  donotResetField(){
    if(this.tableFields.length > 0){
      let FormValue = this.getFormValue(true);
      this.donotResetFieldLists = this.formCreationService.getDonotResetFields(this.tableFields,this.donotResetFieldLists,FormValue);
    }
  }
  // Click Function Dependency End ------------------

  //Dependency function Handling Start ---------------------
  // CD
  checkBeforeResetForm(){
    if(this.close_form_on_success){
      this.close_form_on_success=false;
      this.close();
    }else if(this.multipleFormCollection.length > 0){
      this.close();
    }else{
      this.resetForm()
    }
  }
  // CD
  notifyFieldValueIsNull(formName,fieldNo){
    let msg = "Field No. "+ fieldNo + " value is null";
    this.notificationService.presentToastOnBottom(msg,"danger");
    this.tableFields = [];
    this.dismissModal();
  }
  // CD
  downloadReport(){
    const downloadReportFromData = this.getSavePayloadData();
    if(downloadReportFromData != null){
      downloadReportFromData['_id'] = this.childData._id;
    }
    this.checkForDownloadReport = true;
    this.apiService.GetFileData(downloadReportFromData);
  }
  // CD
  deleteGridData(){
    let dataWithCustValue = this.getFormValue(true);
    let checkValidatiaon = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(false),true,dataWithCustValue);
    if(typeof checkValidatiaon != 'object'){
      this.deleteGridRowData = true;
      const saveFromData = this.getSavePayloadData(dataWithCustValue);
      if(this.getSavePayload){
          this.apiService.deleteGridRow(saveFromData);
      }
    }else{
      this.notificationService.showAlert(checkValidatiaon.msg,'',['Dismiss']);
    }
  }
  // CD
  publicDownloadReport(){
    this.checkForDownloadReport = true;
    let publicDownloadReportFromData = {};
    let payload = {};
    if(this.coreFunctionService.isNotBlank(this.selectedRow["_id"]) && this.coreFunctionService.isNotBlank(this.selectedRow["value"])){
      publicDownloadReportFromData["_id"] = this.selectedRow["_id"];
      publicDownloadReportFromData["value"] = this.selectedRow["value"];
      payload["_id"] = this.selectedRow["_id"];
      payload["data"] = publicDownloadReportFromData;
      this.apiService.GetFileData(payload);
    }
  }
  // CD
  partialDataSave(feilds,tableField){       
    const payload = {
      data:{}
    };
    //for gsd call*************************
    if(feilds.action_name == 'GSD_CALL'){
      if(!this.storageService.GetIdToken()) this.envService.setRequestType("PUBLIC");
      if(feilds.api != undefined && feilds.api != null && feilds.api != ''){
        payload['path'] = feilds.api;
      }
      let list = [];
      list.push(this.apiCallService.getPaylodWithCriteria(tableField.api_params,tableField.call_back_field,tableField.api_params_criteria,this.getFormValue(false)));
       payload['data'] = list;
      this.apiService.DynamicApiCall(payload);
      this.saveCallSubscribe();
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
  // CD
  editedRowData(object) {
    this.selectedRow = JSON.parse(JSON.stringify(object)); 
    this.updateMode = true;
    this.updateDataOnFormField(this.selectedRow); 
    this.getStaticDataWithDependentData();     
    if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
      this.templateForm = this.formControlService.setCheckboxFileListValue(this.checkBoxFieldListValue,this.templateForm, this.staticData,this.selectedRow,this.updateMode);
    }
  }
  // CD
  getStaticDataWithDependentData(){
    let formValueWithCustomData = this.getFormValue(true);
    let formValue = this.getFormValue(false);
    const staticModal:[] = this.apiCallService.getOnchangePayload(this.tableFields,formValue,formValueWithCustomData);
    this.getStaticData(staticModal,formValueWithCustomData,formValue);    
  }
  // CD
  getStaticData(staticModal,object,formDataObject){
    staticModal = this.apiCallService.getStaticDataPayload(staticModal,object,formDataObject,this.multipleFormCollection,this.tableFields,this.formFieldButtons,'',this.form,this.saveResponceData,this.editedRowIndex);
    this.callStaticData(staticModal);
  }
  // CD
  callStaticData(payloads){
    if(payloads.length > 0){
      this.apiService.getStatiData(payloads);        
    }else{      
      this.checkFormFieldIfCondition();      
    }
  }
  // CD
  getFocusFieldAndFocus(){
    if(this.checkFormFieldAutfocus && this.tableFields.length > 0){
      let focusRelatedFields = this.formCreationService.getFocusField(this.previousFormFocusField,this.tableFields,this.templateForm,this.focusFieldParent,this.checkFormFieldAutfocus);
      this.checkFormFieldAutfocus = focusRelatedFields['checkFormFieldAutfocus'];
      this.previousFormFocusField = focusRelatedFields['previousFormFocusField'];
      this.focusFieldParent = focusRelatedFields['focusFieldParent'];
      let id = focusRelatedFields['id'];
      if(id != ''){
        const invalidControl = document.getElementById(id);
        if(invalidControl != null){
          invalidControl.focus();
          this.checkFormFieldAutfocus = false;
          if(this.previousFormFocusField && this.previousFormFocusField.type == 'list_of_fields' && this.previousFormFocusField.datatype == 'list_of_object_with_popup'){
            this.previousFormFocusField = {};
          }
        }
      }
    }
  }
  // CD
  checkFormFieldIfCondition(){
    if(this.buttonIfList?.length > 0){
      this.buttonIfList.forEach(element => {
        let fieldIndex = element['fieldIndex'];
        this.tableFields[fieldIndex]['showButton'] = this.formCreationService.checkGridSelectionButtonCondition(element,'add',this.selectedRow,this.templateForm.getRawValue());
      });
    }
    if(this.disableIfFieldList?.length > 0){
      this.disableIfFieldList.forEach(element => {
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          this.isDisable(element.parent,element);
        }else{
          this.isDisable('',element)
        }
      });
    }
    if(this.mendetoryIfFieldList?.length > 0){
      this.mendetoryIfFieldList.forEach(element => {
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          this.isMendetory(element.parent,element);
        }else{
          this.isMendetory('',element)
        }
      });
    }
    if(this.showIfFieldList?.length > 0){
      this.showIfFieldList.forEach(element => {
        let id = '';
        let parentFieldName = '';
        let parentIndex = -1;
        let fieldIndex = -1;
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          id = element._id;
          parentFieldName = element.parent;
          parentIndex = element.parentIndex;
          fieldIndex = element.currentIndex;
          this.tableFields[parentIndex].list_of_fields[fieldIndex]['notDisplay'] = this.checkIfService.checkShowIfListOfFiedlds(parentFieldName,element,this.getFormValue(true));
        }else{
          id = element._id;
        }
        let elementDetails = document.getElementById(id);
        if(!this.checkIfService.checkShowIf(element,this.selectedRow,this.templateForm.getRawValue())){          
          if(elementDetails && elementDetails != null){
            const classes = Array.from(elementDetails.classList)
            if(!classes.includes('d-none')){
              this.removeClass(elementDetails,' d-inline-block');
              elementDetails.className += " d-none";
              element['show'] = false;
              const objectValue = this.templateForm.getRawValue();
              if(element.type != "group_of_fields" && element.type != "list_of_fields" && objectValue[element.field_name] && objectValue[element.field_name] != ''){
                let controlarName = element.field_name;
                let count = 0;
                for (let index = 0; index < this.showIfFieldList.length; index++) {
                  let showIfItem = this.showIfFieldList[index];
                  if(controlarName == showIfItem.field_name){
                    count = count+1;
                  }
                  if(count == 2){
                    break;
                  }
                }
                if(count != 2){
                  this.templateForm.get(element.field_name).setValue('');
                }
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
  // CD 
  getFormValue(check){
    let formValue = this.templateForm.getRawValue();
    return this.formValueService.getFormValue(check,formValue,this.selectedRow,this.updateMode,this.complete_object_payload_mode,this.tableFields,this.latitude,this.longitude,this.address,this.custmizedFormValue,this.checkBoxFieldListValue,this.staticData,this.dataListForUpload,this.selectContact,[],'',this.getLocation,this.center);
  }
  // CD
  storeFormDetails(parent_field:any,field:any,index?:number){
    let result = this.multipleFormService.storeFormDetails(parent_field,field,this.getFormValue(false),this.getFormValue(true),this.updateMode,this.nextFormData,this.lastTypeaheadTypeValue,this.multipleFormCollection,this.currentMenu,this.form,this.listOfFieldUpdateMode,this.listOfFieldsUpdateIndex,this.addNewRecord,this.enableNextButton,index);
    this.multipleFormCollection = result.multipleFormCollection;
    if(result.form && Object.keys(result.form).length > 0) this.loadNextForm(result.form);
    if(result.id && result.id != '') this.multipleFormService.getNextFormById(result.id);
    this.addNewRecord = result.addNewRecord;
    if(result.params && result.params != '')  this.multipleFormService.getDataForNextForm(result.params,result.criteria);   
  }
  async  openGridSelectionModal(field){
    if(field.gridColumns && field.gridColumns.length > 0){
      const gridColumns = this.modifiedGridColumns(field.gridColumns);
      field.gridColumns = gridColumns;
    }
    this.samePageGridSelectionData = {}
    this.selectedgridselectionField='';
    if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
    let selectedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]));
    this.selectedgridselectionField = field;
    const gridModalData = {
      "field": field,
      "selectedData":selectedValue,
      "object": this.getFormValue(true),
      "formTypeName" : this.formTypeName,
      "updateMode" : this.updateMode
    }
    this.samePageGridSelection = this.appDataShareService.getgridselectioncheckvalue();
    if(this.samePageGridSelection){
      this.apiService.ResetStaticData(field.field_name);
      this.curTreeViewField = field;      
      this.samePageGridSelectionData = gridModalData;
    }else{
      const modal = await this.modalController.create({
        component: GridSelectionModalComponent,
        componentProps: {
          "Data": gridModalData,
        }
      });
      modal.present();
      modal.componentProps.modal = modal;
      modal.onDidDismiss()
        .then((data) => {
          const object = data['data']; // Here's your selected user!
          if(object['data'] && object['data'].length > 0){
            let obj =this.getSendData(object['data']);
            this.gridSelectionResponce(obj);
          }        
      });
    }
  }
  async openGridSelectionDetailModal(data:any, cardtype?:string) {
    if(cardtype! || cardtype =="" || cardtype ==undefined){
      cardtype = "demo1"
    }
    // if(cpmonentName){
      const modal = await this.modalController.create({
        component: GridSelectionDetailModalComponent,
        cssClass: "gridSelectionDetailModal",
        componentProps: {
          'Data': data,
          "childCardType":cardtype
        },
        id: data.id,
        animated: true,
      });
      modal.present();
      modal.onDidDismiss()
        .then((data) => {
          const object = data['data'];
          if(object['data'] && object['data'].length > 0){
            let obj =this.getSendData(object['data']);
            this.gridSelectionResponce(obj);
          }        
      });
    // }
  } 
  getSendData(data){
    let obj ={
      "action":'',
      "index":-1,
      "data": data
    }
    return obj;
  }
  // CD and try to remove this function
  modifiedGridColumns(gridColumns){
    return this.gridCommonFunctionService.modifiedGridColumns(gridColumns,this.selectedRow,this.templateForm.getRawValue());
  }
  // CD
  resetForm(){
    if(this.multipleFormCollection.length > 0){
      this.multipleFormCollection = this.multipleFormService.setPreviousFormTargetFieldData(this.multipleFormCollection,this.getFormValue(true));
    }
    this.donotResetField();
    if(this.templateForm && this.templateForm.controls){
      this.templateForm.reset(); 
    }
    if(Object.keys(this.donotResetFieldLists).length > 0){
      this.custmizedFormValue = {};
      this.modifyCustmizedFormValue = {};
      this.dataListForUpload = {};
      this.updateDataOnFormField(this.donotResetFieldLists);
      this.donotResetFieldLists = {};
    }else{
      this.custmizedFormValue = {};
      this.custmizedFormValue = {};
      this.modifyCustmizedFormValue = {};
    }
    if(this.tableFields.length > 0){
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
              });
            }
            break;     
          default:
            break;
        }
      });
    }
  }
  // CD
  checkOnSuccessAction(){
    let responce = this.apiCallResponceService.checkOnSuccessAction(this.currentActionButton,this.forms);
    if(responce.index != -1) {
      this.changeNewForm(responce.actionValue,responce.index)
    }
  };
  // CD
  changeNewForm(formName:string,i){
    this.formName = formName;
    //this.formIndex = i;
    this.changeForm();
  }
  // CD
  changeForm(){
    this.resetFlagForOnchange();
    this.resetFlagsForNewForm();
    const form = this.dataShareService.getDinamicForm();
    this.setDinamicForm(form)
    const tempData = this.dataShareService.getTempData();  
    // this.setTempData(tempData); 
    this.ngOnInit();
  }
  checkValidator(action_button){
    if(action_button.field_name){
      const field_name = action_button.field_name.toLowerCase();
      switch (field_name) {
        case "save":
        case "update":
        case "updateandnext":
        case "send_email":
          const valid:boolean =  this.isFormValid();
          return !valid;
        default:
          return;
      }
    }
  }
  isFormValid() : boolean { 
    return this.templateForm.disabled ? true : this.templateForm.valid
  }
  // CD
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
    this.calculationFieldList=[];
    this.buttonIfList=[];
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
    this.focusFieldParent={};
    this.term={};
  }
  resetFlagForOnchange(){
    this.listOfFieldUpdateMode=false; 
    this.listOfFieldsUpdateIndex = -1; 
    // this.serverReq = false;
    this.updateAddNew = false;
    this.addOrUpdateIconShowHideList = {};
  }
  // CD
  gridSelectionResponce(responce){ 
    // New code added
    const fieldName = this.curTreeViewField.field_name;    
    if (!this.custmizedFormValue[fieldName]) this.custmizedFormValue[fieldName] = [];
    this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(responce.data));
    if(this.customEntryData[fieldName] && this.customEntryData[fieldName].length > 0){
      this.customEntryData[fieldName].forEach(data => {
        this.custmizedFormValue[fieldName].push(data);
      });
      this.customEntryData[fieldName] = [];
    }
    // New code added end========================
    if(this.curTreeViewField && this.curTreeViewField.add_new_enabled && responce && responce.action && responce.action == "edite"){
      let index = responce.index;
      if(this.samePageGridSelection){
        this.samePageGridSelection = false;
      }
      this.updateListofFields(this.curTreeViewField,{},index);
    }       

    if(this.curTreeViewField && this.curTreeViewField.onchange_function && this.curTreeViewField.onchange_function_param){
      let function_name = this.curTreeViewField.onchange_function_param;
      let formValueWithCustomData = this.getFormValue(true);
      switch(function_name){
        case "calculation_of_script_for_tds":
          const payload = this.commonFunctionService[this.curTreeViewField.onchange_function_param](formValueWithCustomData, this.curTreeViewField);   
          this.apiService.getStatiData(payload);
          break;
        case "calculateQquoteAmount":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            // element["qty"] = this.templateForm.getRawValue()["qty"];
            element["qty"] = formValueWithCustomData["qty"];
            this.limsCalculationsService.calculateNetAmount(element, {field_name: "qty"},"legacyQuotationParameterCalculation");
          });
          this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](formValueWithCustomData, this.curTreeViewField)); 
          break;
        case "calculateAutomotiveLimsQuotation":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            // element["qty"] = this.templateForm.getRawValue()["qty"];
            this.limsCalculationsService.calculateNetAmount(element, {field_name: "qty"},"calculateQuotationParameterAmountForAutomotiveLims");
          });
          // this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField)); 
          this.updateDataOnFormField(this.limsCalculationsService.calculate_quotation(formValueWithCustomData,"automotive" ,{field_name:"parameter_array"}));
          break;
        case "calculateLimsQuotation":
          this.custmizedFormValue[this.curTreeViewField.field_name].forEach(element => {
            // element["qty"] = this.templateForm.getRawValue()["qty"];
            element["qty"] = formValueWithCustomData["qty"];
            this.limsCalculationsService.calculateNetAmount(element, {field_name: "qty"}, "calculateQuotationParameterAmountForLims");
          });
          // this.updateDataOnFormField(this.commonFunctionService[this.curTreeViewField.onchange_function_param](this.getFormValue(true), this.curTreeViewField)); 
          this.updateDataOnFormField(this.limsCalculationsService.calculate_quotation(formValueWithCustomData,"standard" ,{field_name:"parameter_array"}));
          break;    
        case 'quote_amount_via_sample_no':
          let val = this.limsCalculationsService.quote_amount_via_sample_no(formValueWithCustomData,this.custmizedFormValue['quotation_param_methods']);
          this.updateDataOnFormField(val);
          break;
        case 'calculation_invoice_totalAmount':
          let value = this.limsCalculationsService.calculateInvoiceTotalAmount(formValueWithCustomData,this.custmizedFormValue['invoiceInfos']);
          this.updateDataOnFormField(value);
          break;
        case 'calculate_lims_invoice':
          let calculate_on_field = "";
          if(this.curTreeViewField.calculate_on_field != null && this.curTreeViewField.calculate_on_field != ''){
            calculate_on_field = this.curTreeViewField.calculate_on_field
          }
          let val1 = this.limsCalculationsService.calculate_lims_invoice(formValueWithCustomData,'',calculate_on_field);
          this.updateDataOnFormField(val1);
          break;
        case 'calculate_lims_invoice_extra_amount':
          let val2 = this.limsCalculationsService.calculate_lims_invoice_extra_amount(formValueWithCustomData,'','');
          this.updateDataOnFormField(val2);
          break;
        case 'calculate_quotation_with_subsequent':          
          let calFormValue = this.limsCalculationsService.calculate_quotation_with_subsequent(formValueWithCustomData,"standard", {field_name: "qty"});
          this.updateDataOnFormField(calFormValue);
          break;
        default:
          if(this.commonFunctionService[function_name]){      
            this.templateForm = this.commonFunctionService[function_name](this.templateForm, this.curTreeViewField);
            const calTemplateValue= this.templateForm.getRawValue()
            this.updateDataOnFormField(calTemplateValue);
          }else if(this.limsCalculationsService[function_name]){      
            this.templateForm = this.limsCalculationsService[function_name](this.templateForm, this.curTreeViewField);
            const calTemplateValue= this.templateForm.getRawValue()
            this.updateDataOnFormField(calTemplateValue);
          }
          break
      }
    }

    if(this.curTreeViewField && this.curTreeViewField.onchange_function_param && this.curTreeViewField.onchange_function_param != ''){
      if(this.curTreeViewField.onchange_function_param.indexOf('QTMP') >= 0){
        const payloads = [];
        payloads.push(this.apiCallService.getPaylodWithCriteria(this.curTreeViewField.onchange_function_param,'',[],this.getFormValue(true)));
        this.callStaticData(payloads);
      }
    }

    this.modifyCustmizedValue(fieldName);
    // this.curTreeViewField = {};
    // this.currentTreeViewFieldParent = {};
  }
  // CD
  updateDataOnFormField(formValue){
    const checkDataType = typeof formValue;
    if(checkDataType == 'object' && !this.commonFunctionService.isArray(formValue) && this.tableFields && this.tableFields.length > 0){

      let result = this.formControlService.updateDataOnForm(this.templateForm,this.tableFields,formValue,this.formFieldButtons,this.custmizedFormValue,this.modifyCustmizedFormValue,this.selectedRow,this.dataListForUpload,this.treeViewData,this.staticData,this.longitude,this.latitude,this.zoom);
      this.templateForm = result.templateForm;
      this.tableFields = result.tableFields;
      this.custmizedFormValue = result.custmizedFormValue;
      this.modifyCustmizedFormValue = result.modifyCustmizedFormValue;
      this.selectedRow = result.selectedRow;
      // this.serialId = this.selectedRow?.serialId;
      this.dataListForUpload = result.dataListForUpload;
      this.treeViewData = result.treeViewData;
      this.staticData = result.staticData;
      this.latitude = result.latitude;
      this.longitude = result.longitude;
      this.center = {
        "lat":result.latitude,
        "lng": result.longitude
      };
      this.zoom = result.zoom;
      if(result.getAddress){
        this.getAddressfromLatLng(this.latitude,this.longitude);
      }
      // this.getFocusFieldAndFocus();
      this.checkFormFieldIfCondition();
    }
  }
  // CD
  isMendetory(parent,chield){
    const  formValue = this.getFormValue(true);
    let responce = this.checkIfService.checkIsMendetory(parent,chield,formValue,this.templateForm);
    this.templateForm = responce.templateForm;
    return responce.tobedesabled;
  }
  // CD
  getNextFormData(formData){
    let result = this.multipleFormService.getNextFormData(formData,this.listOfFieldsUpdateIndex);
    if(result.updateAddNew){
      this.apiService.getGridData(result.payload);
    }
  }
  // CD
  modifyCustmizedValue(fieldName){
    let modifyObject = this.gridCommonFunctionService.gridDataModify(this.modifyCustmizedFormValue,this.custmizedFormValue,this.tableFields,fieldName,'grid_selection',this.getFormValue(true));
    this.modifyCustmizedFormValue = modifyObject.modifyData;
    this.tableFields = modifyObject.fields;
  }
  // CD
  isDisable(parent,chield){
    const  formValue = this.getFormValue(true);  
    let responce:any = this.checkIfService.checkIsDisable(parent,chield,this.updateMode,formValue,this.templateForm);
    this.templateForm = responce.templateForm;
    return responce.tobedesabled;
  }
  // CD
  removeClass = (element,name) => {
    if(element.classList && element.classList.length >0 && element.classList.contains(name)){
      element.classList.remove(name);
    }else if(element.className && element.className.includes(name)){
      element.className = element.className.replace(name, "");
    }
  }
  get templateFormControl() {
    return this.templateForm.controls;
  }
  //Dependency function Handling End ------------------
  
  // Function used On HTML, Handling Start -------------  
  getDivClass(field) {
    const fieldsLength = this.tableFields.length;
    const returnClass = this.commonFunctionService.getDivClass(field,fieldsLength);
    if(field.hideOnMobile){
      return returnClass + " ion-hide";
    }else{
      return returnClass
    }
  }
  isEnable(parent,field, elementType) {
    //this.tempVal[field+"_"+elementType] = true;
    if(parent != ''){
      return this.tempVal[parent + '_' + field + "_" + elementType];
    }else{
      return this.tempVal[field + "_" + elementType];
    }    
  }
  checkObjectSize(object){
    if(object != undefined && object != null){
      return (Object.keys(object).length > 0)
    }
    return false;
  }
  // CD
  showListFieldValue(listOfField, item) {
    return this.gridCommonFunctionService.showListFieldValue(listOfField,item);
  }  
  clearTypeaheadData() {
    this.apiService.clearTypeaheadData();
  }  
  getButtonDivClass(field){
    return this.commonFunctionService.getButtonDivClass(field);
  }
  checkRowDisabledIf(field,index){
    const data = this.commonFunctionService[field.field_name];
    const condition = field.disableRowIf;
    if(condition){
      return !this.checkIfService.checkDisableRowIf(condition,data);
    }
    return true;    
  }
  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  }
  // Function used On HTML, Handling End -------------  

  // Ionin Event || Method Function Handling Start-------
  clearDropdownField(e:any,field:any){
    if(e.target.value && e.target.value.name){      
      e.target.value = "";
    }else{
      e.target.value = "";
    }
    this.setValue("",field, "", e);
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
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    console.log("Item", ev.detail.from, 'Dragged from index', ev.detail.from, 'to', ev.detail.to);
    ev.detail.complete();
  }
  // Ionic Event || Method Function Handling End-------
  
  // Camera Function Handling Start --------------
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
  setFile(){
    let uploadData = [];
    if(this.curFileUploadField){
      if(this.curFileUploadFieldparentfield != ''){
        const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield);
        if(this.dataListForUpload[custmizedKey] && this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]){
          const data = this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name];
          if(data && data.length > 0){
            uploadData = data;
          }  
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
  // CD
  fileUploadResponce(response) {
    let uploadFileResponce = this.fileHandlerService.updateFileUploadResponce(this.curFileUploadFieldparentfield,this.curFileUploadField,this.dataListForUpload,this.templateForm,this.tableFields,response);
    this.dataListForUpload = uploadFileResponce.dataListForUpload;
    this.templateForm = uploadFileResponce.templateForm;
    this.tableFields = this.tableFields; 
  }
  // delete selected image from the list
  deleteImage(index:number) {
    // this.cameraService.deleteImage(index).subscribe(res => {
    //   this.images.splice(index, 1);
    // });
    this.selectedphotos.splice(index, 1);
    this.notificationService.presentToastOnBottom('File removed', "success");
  }
  // Camera Function Handling End --------------

  // Download File Functions into Mobile Start ------------
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
  // Download File Functions into Mobile End ------------ 
  
  // Google Map Function Handling Start ------------------ 
  async checkPermissionandRequest(){
    let permResult = false;
    if(isPlatform('hybrid')){
      permResult = await this.app_googleService.checkGeolocationPermission();
      if(permResult){        
        this.requestLocationPermission();
      }
    }else{
      permResult = await this.app_googleService.checkGeolocationPermission();
    }   
    if(!permResult){
      let alreadyOpen = await this.alertController.getTop();
      if(alreadyOpen == undefined){
        this.gpsEnableAlert();
      }
    }else{
      if(isPlatform('hybrid')){
        this.setCurrentLocation();
      }else{
        this.getCoordinatesOnBrowser();
      }
    }
  }
  async gpsEnableAlert(){     
    const alert = await this.alertController.create({
      cssClass: 'form-gps-class',
      header: 'Please Enable GPS !',
      message: 'For smooth app experience please give us your location access.',
      buttons: [
        {
          text: 'No, thanks',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirmed',
          handler: () => {},
        },
      ],
    });

    await alert.present();
    let resultrole:any='';
    await alert.onDidDismiss().then(value => {
      resultrole = value;
      console.log("Form Gps Alert :",value.role)
    });
    if(resultrole && resultrole.role == 'confirmed'){
      await this.requestLocationPermission();
    }
  }
  async requestLocationPermission() {
    let isGpsEnable = false;
    if(isPlatform('hybrid')){
      const permResult = await this.appPermissionService.checkAppPermission("ACCESS_FINE_LOCATION");
      if(permResult){
        isGpsEnable = await this.app_googleService.askToTurnOnGPS();
        if(isGpsEnable){
          this.setCurrentLocation();
        }
      }
    }else{      
      await this.getCoordinatesOnBrowser();
    }    
  }
  async getCoordinatesOnBrowser(){
    const successCallback = (position) => {
      let latLng = position.coords;
      if(latLng && latLng['latitude'] && latLng['longitude']){ 
        this.latitude = latLng['latitude'];
        this.longitude = latLng['longitude']
        this.center = {
          lat:latLng.latitude,
          lng:latLng.longitude
        }
      }
    };      
    const errorCallback = (error: any) => {
      console.log(error);
      this.notificationService.presentToastOnBottom("Geolocation is not supported by this browser.", "danger");
    };
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }
  async setCurrentLocation(){
    if(isPlatform('hybrid')){
      let currentLatLng:any = await this.app_googleService.getUserLocation();
      if((currentLatLng && currentLatLng.lat) || (currentLatLng && currentLatLng.latitude)){
        this.latitude = currentLatLng.lat ? currentLatLng.lat : currentLatLng.latitude;
        this.longitude = currentLatLng.lng ? currentLatLng.lng : currentLatLng.longitude;
        this.center ={
          'lat':this.latitude,
          'lng':this.longitude
        }
      }else{
        console.log("Error while getting Location")
      }
    }else{
      await this.getCoordinatesOnBrowser();
    }
    this.zoom = 17;
  }
  async locateMe(event:any,field?:any){
    this.zoom = 17;
    const hasGpsPermission = await this.app_googleService.checkGeolocationPermission();
    if(hasGpsPermission ){
      await this.setCurrentLocation();
      await this.getAddressfromLatLng(this.latitude,this.longitude);
      this.setAddressOnForm(field);
    }else{
      this.gpsEnableAlert();
    }
  }
  async gmapSearchPlaces(inputData?:any,field?:any){
    if(inputData?.target?.value){
      if(this.searchElementRef != undefined){
        if(this.searchElementRef && this.searchElementRef.nativeElement){
          this.searchElementRef.nativeElement.value  = inputData.target.value;
        }else{
          this.searchElementRef['el']['value']  = inputData.target.value; // for ion-input
        } 
      }
    }
    let loadGoogleMap:boolean = false;
    if(typeof Common.GOOGLE_MAP_IN_FORM == "string"){
      if(Common.GOOGLE_MAP_IN_FORM == "true"){
        loadGoogleMap = true;
      }
    }else{
      if(Common.GOOGLE_MAP_IN_FORM){
        loadGoogleMap = true;
      }
    }
    if(loadGoogleMap){
      // if(this.apiLoaded){
        // this.geoCoder = new google.maps.Geocoder;
        if(this.longitude == 0 && this.latitude == 0){
          await this.setCurrentLocation();
        }
        this.center = {
          "lat": this.latitude,
          "lng": this.longitude
        }
        if(this.searchElementRef != undefined){
          let googleautosearch;
          if(this.searchElementRef && this.searchElementRef.nativeElement){
            googleautosearch = this.searchElementRef.nativeElement
          }else{
            googleautosearch = this.searchElementRef['el']
          }
          let autocomplete = new google.maps.places.Autocomplete(
            googleautosearch
          );
          autocomplete.addListener('place_changed', () => {
            this.ngZone.run(() => {
              let place: google.maps.places.PlaceResult = autocomplete?.getPlace();
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }
              this.searchElementRef.nativeElement.value = place.name;
              this.address = place.formatted_address;
              this.latitude = place.geometry.location.lat();
              this.longitude = place.geometry.location.lng();
              this.center = {
                "lat": this.latitude,
                "lng": this.longitude
              }
              this.zoom = 17;
              this.setAddressOnForm(field);
              // this.addCapMarker(this.center);
              this.getAddressfromLatLng(this.latitude, this.longitude);
            });
          });
        }
      // }
    }
  }
  async mapClick(event: google.maps.MapMouseEvent,field?:any) {
    this.zoom = 16;
    this.center = (event.latLng.toJSON());
    await this.getAddressfromLatLng(this.center.lat, this.center.lng);
    this.setAddressOnForm(field);
  }
  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }  
  async getAddressfromLatLng(latitude, longitude)  {
    if(latitude && longitude){
      let location = {
        "location" : {
        'lat': latitude,
        'lng': longitude
        }
      }
      let address:any = await this.app_googleService.getGoogleAddressFromString(location);
      if(address && address.formatted_address){
        this.address = address.formatted_address;
        this.latitude = address?.geometry?.location?.lat;
        this.longitude = address?.geometry?.location?.lng;
      }
    }
  }
  setAddressOnForm(field:any){
    if(this.templateForm?.get(field?.field_name)){
      this.templateForm.get(field?.field_name).setValue(this.address);
    }else if(this.templateForm?.get('address')){
      this.templateForm.get('address').setValue(this.address);
    }
  }
  // Google Map Function Handling End ------------------ 
  
  // Functions Not in use =============
  // onClickLoadData(parent,field){
  //   if(field && field.onClickApiParams && field.onClickApiParams != ''){        
  //     let api_params = field.onClickApiParams;
  //     let callBackfield = field.onClickCallBackField;
  //     let criteria = field.onClickApiParamsCriteria
  //     let object = this.getFormValue(false);
  //     const payload = this.apiCallService.getPaylodWithCriteria(api_params,callBackfield,criteria,object);
  //     let payloads = [];
  //     payloads.push(this.apiCallService.checkQtmpApi(api_params,field,payload,this.multipleFormCollection,object,this.getFormValue(true)));
  //     this.callStaticData(payloads);
  //   }
  // }
  //Functions Not in use End ====================================  

  // Let these below 2 functions of readAsBase64 and convertBlobToBase64 , in the last of this file
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
