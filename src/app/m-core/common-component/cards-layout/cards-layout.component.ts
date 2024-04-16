import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataShareService, NotificationService, AppPermissionService, App_googleService, LoaderService, AppDownloadService, AppShareService, AppStorageService } from '@core/ionic-core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Platform, ModalController, AlertController, PopoverController, isPlatform, ActionSheetController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { ModalDetailCardComponent } from '../modal-detail-card/modal-detail-card.component';
import { FormComponent } from '../form/form.component';
import { DatePipe } from '@angular/common';
import { CallDataRecordFormComponent } from '../../modal/call-data-record-form/call-data-record-form.component';
import { File } from '@ionic-native/file/ngx';
import { AndroidpermissionsService } from '../../../service/androidpermissions.service';
import { GmapViewComponent } from '../gmap-view/gmap-view.component';
import { zonedTimeToUtc } from 'date-fns-tz';
import { ApiService, DataShareService, CommonFunctionService, MenuOrModuleCommonService, CommonAppDataShareService, PermissionService, StorageService, CoreFunctionService, AuthService, ApiCallService, GridCommonFunctionService, DownloadService, ChartService } from '@core/web-core';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
import { BarcodeScanningComponent } from '../../modal/barcode-scanning/barcode-scanning.component';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Subscription } from 'rxjs';
import { FileOpener } from '@capacitor-community/file-opener';
import { SampleSubmitModelComponent } from '../../modal/custom-model/sample-submit-model/sample-submit-model.component';
import { CollectionCentreModelComponent } from '../../modal/custom-model/collection-centre-model/collection-centre-model.component';

@Component({
  selector: 'app-cards-layout',
  templateUrl: './cards-layout.component.html',
  styleUrls: ['./cards-layout.component.scss'],
  providers: [File]
})
export class CardsLayoutComponent implements OnInit, OnChanges {
  
  @ViewChild('cardView') cardViewContent: ElementRef<any>;

  @Input() card:any;
  @Input() data:any ={};
  @Output() columnListOutput = new EventEmitter();
  @Input() searchcard:any;
  @Output() formNameTypeTravel = new EventEmitter();
  @Output() popoverTabbing = new EventEmitter();
  @Output() primaryheaderNew = new EventEmitter();
  @Output() nestedCard = new EventEmitter();
  @Output() parentCardName = new EventEmitter();


  scannerForm=false
  scannerFormName="";
  web_site_name: string = '';
  list: any = [];
  carddata: any;

  columnList: any = [];
  cardType = "summary"; //default cardtype
  cardDataMasterSubscription: any;
  collectionname: any = 'request_quote';
  // cardtitle: any;

  childColumns : any;
  childColumn: any = {};
  childDataTitle: any;
  childCardType: string = "";
  childTabMenu: any=[];
  name: any ='';
  
  // searchbar variables
  inValue = 0;
  myInput: string;

  // filter card
  //filterForm: FormGroup;
  filterForm:any = {
    'value' : {}
  }
  createFormgroup: boolean = true;
  openFilter: boolean = false;
  filterCount: 0;
  gridData:any={};

  //common function
  cardList: any = [];
  selectedIndex= -1;
  public editedRowIndex:number=-1;
  tabMenu: any = [];
  // cardListSubscription:any;

  // db Flags
  addCallingFeature: boolean=false;
  addNewEnabled:boolean=false;
  detailPage:boolean=false;
  callStatus:boolean=false;
  popoverMenu:boolean=false;
  enableEditOnly:boolean=false;
  loadMoreData:boolean = false;
  refreshlist:boolean = false;
  enableReviewOnly:boolean=false;
  downloadReport:boolean=false;
  downloadPdfBtn:boolean=false;
  // subscription Variables start
  gridDataSubscription: Subscription;
  printFileSubscription: Subscription;
  pdfFileSubscription: Subscription;
  saveResponceSubscription: Subscription;
  childgridsubscription: Subscription;
  nestedCardSubscribe: Subscription;
  // subscription Variables start
  currentPageCount:number = 1;
  currentPage:number;
  dataPerPageCount:number = 50;
  totalDataCount:number;
  totalPageCount:number;
  formTypeName:any;
  selectedgriddataId:any="";
  updateMode:boolean = false;
  ionEvent:any;
  checkPreviewData = false;
  currentMenu: any;
  flagForTdsForm:boolean = false;
  currentRowIndex:any = -1;
  checkForDownloadReport:boolean = false;
  gridButtons:any=[];
  downloadPdfCheck: any = '';
  downloadQRCode: any = '';
  public tab: any = [];
  details:any = {};
  downloadProgress:any;
  nodatafoundImg :any = "../../../../assets/nodatafound.png";
  nodatafound:boolean = false;
  hasDetaildCard:boolean = false;
  // GPS variables below
  currentLatLng:any;
  userLocation:any;
  geocoder:any;

  multipleCardCollection:any=[];
  public nextCardData:any ={};
  userTimeZone: any;
  userLocale:any;
  gpsAlertResult:any;
  form:any;
  enableScanner:boolean=false;
  /* --------BarCode Scanning Variables------------------------------------------- */
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
  });
  public barcodes = [];
  public isBarCodeScannerSupported = false;
  public isBarCodeCameraPermissionGranted = false;
  public barCodeFormats:any = [
    ["AZTEC"],
    ["CODABAR"],
    ["CODE_39"],
    ["CODE_93"],
    ["CODE_128"],
    ["DATA_MATRIX"],
    ["EAN_8"],
    ["EAN_13"],
    ["ITF"],
    ["PDF_417"],
    ["QR_CODE"],
    ["UPC_A"],
    ["UPC_E"]
  ];
  ngZone: any;
  /* --------BarCode Scanning Variables End------------------------------------------- */
  // For Custom Modal
  staticData: any = {};
  staticDataSubscriber:any;
  userCurrentLocation = {
    'latitude' : 0,
    'longitude' : 0
  }
  enableCustomGotoCollection:boolean = false;
  gridRunningDataSubscriber:Subscription;
  getCollectionCentre:boolean = false;

  constructor(
    private platform: Platform,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private router: Router,
    private dataShareServiceService:DataShareServiceService,
    private callNumber: CallNumber,
    private apiService:ApiService,
    private dataShareService: DataShareService,
    private appDataShareService: AppDataShareService,
    private commonAppDataShareService:CommonAppDataShareService,
    private modalController: ModalController,
    private alertController: AlertController,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private permissionService:PermissionService,
    // private fileOpener: FileOpener,
    private file: File,
    private apppermissionsService: AndroidpermissionsService,
    public renderer: Renderer2,
    private app_googleService: App_googleService,
    private commonFunctionService: CommonFunctionService,
    private menuOrModuleCommonService: MenuOrModuleCommonService,
    private loaderService: LoaderService,
    private appPermissionService: AppPermissionService,
    private actionSheetController: ActionSheetController,
    private coreFunctionService: CoreFunctionService,
    private authService: AuthService,
    private apiCallService: ApiCallService,
    private gridCommonFunctionService: GridCommonFunctionService,
    private downloadService: DownloadService,
    private appDownloadService: AppDownloadService,
    private androidpermissionsService: AndroidpermissionsService,
    private chartService: ChartService,
    private appShareService: AppShareService,
    private popoverModalService: PopoverModalService,
    private appStorageService: AppStorageService
  ) 
  {
    
    this.userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    this.initializeApp();
    this.gridDataSubscription = this.dataShareService.collectiondata.subscribe(data =>{
      let res:any;
      if(data && data.data && data.data_size && data.data.length > 0){
        res = data.data;
        this.totalDataCount = data.data_size;
        this.totalPageCount = Math.ceil(this.totalDataCount / this.dataPerPageCount);
        this.setCardData(res);
      }else{
        if(this.loadMoreData){
          if(data && data.data && data.data.length == 0){
            this.totalPageCount = 0;
          }
          this.setCardData(data.data);
        }else{
          this.nodatafound=true;
        }
      }
      this.checkLoader();
    });
    
    this.pdfFileSubscription = this.dataShareService.downloadPdfData.subscribe(data =>{
      this.setDownloadPdfData(data);
    })
    this.childgridsubscription = this.dataShareService.childGrid.subscribe(data =>{
      if(data && data.gridColumns){
        this.childColumns = data.gridColumns;
      }
    });
    this.nodatafound=false;
    this.nestedCardSubscribe = this.commonAppDataShareService.nestedCard.subscribe(nextgriddata =>{
      if(nextgriddata && nextgriddata !=undefined){
        this.card = nextgriddata.card;
      }
    });
    this.printFileSubscription = this.dataShareService.printData.subscribe(data =>{
      this.downloadandprint(data);
    })

    this.gridRunningDataSubscriber = this.dataShareService.gridRunningData.subscribe((data:any) =>{
      if(data && data?.data?.length >0 &&this.scannerForm){
        if(data?.data?.[0].status=="SUBMIT"){
          this.checkLoader();
          this.notificationService.showAlert("","This Sample is already Submitted",['Dismiss']);
        }else{
          let form = this.commonFunctionService.getForm(this.card?.card?.form,'UPDATE',this.gridButtons);
          // this.loaderService.showLoader("Loading...");
          this.openFormModalForScanner(form,data?.data?.[0]);
        }
        this.scannerForm=false;
      }
      // else if(this.scannerForm){
      //   this.scannerForm=false;
      //   this.addNewForm()
      // }
    });
    
  }
  // Test Functions Start
  
  // Test Functions End

  // Ionic LifeCycle Function Handling Start------------------  
  ionViewWillEnter(){
    console.log("ionViewwillEnter");
  }
  ionViewwillLeave(){
    this.carddata=[];
    this.nodatafound=false;
  }
  ionVieDidEnter(){
    console.log("DidEnter");
    // this.checkLoader();
  }
  ionViewDidLeave(){
    this.carddata=[];
  }
  // Ionic LifeCycle Function Handling End--------------------

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {     
    // this.renderer.setStyle(this.cardViewContent['el'], 'webkitTransition', 'top 700ms');
  }
  ngOnDestroy(): void {
    // if (this.cardListSubscription) {
    //   this.cardListSubscription.unsubscribe();
    // }
    this.unSubscribed();
  }
  ngOnChanges(changes?: SimpleChanges) {
    this.onloadVariables();
    if(this.data && this.data.filterFormData){
      this.filterForm['value'] = this.data.filterFormData;
      // this.getGridData(this.collectionname);
      if(this.card && this.card.card && this.card.card.name){
        this.setCardDetails(this.card.card);
      }
    }else if(this.data && this.data.searchData && this.data.searchData.length > 0){
      let criteria = [];
      if(this.card && this.card.card && this.card.card){
        let card = this.card.card;
        if(card && card.search_field_name && card.search_field_name != ''){
          const cr = card.search_field_name + ";stwic;" +this.data.searchData + ";STATIC";
          criteria.push(cr);
          this.getGridData(this.collectionname,criteria);
        }
      }
      
    }else{
      this.filterForm['value'] = {};
      if(this.data && this.data._id){
        this.detailPage = true;
      }
      if(this.card && this.card.card && this.card.card.name){
        this.setCardAndTab(this.card);
      }
      if(this.card && this.card.card && this.card.card.grid_selection_inform != null){
        this.appDataShareService.setGridSelectionCheck(this.card.card.grid_selection_inform)
      }
    }
  }
  // Angular LifeCycle Function Handling End-------------------

  // Subscriber Functions Handling Start -------------------
  initializeApp() {
    this.platform.ready().then(() => {

      // this.callLog.hasReadPermission().then(hasPermission => {
      //   if (!hasPermission) {
      //     this.callLog.requestReadPermission().then(results => {
      //       this.getContacts("type","1","==");
      //     })
      //       .catch(e => console.log(" requestReadPermission " + JSON.stringify(e)));
      //   } else {
      //     this.getContacts("type", "1", "==");
      //   }
      // })
      //   .catch(e => console.log(" hasReadPermission " + JSON.stringify(e)));

    });

  }
  setCardData(data:any){
    if( this.currentPage < this.totalPageCount){
      if(this.loadMoreData && this.carddata.length !== 0 && this.totalDataCount !== 0 && this.updateMode){
        this.updateMode = false;
        let index = -1;
        if(this.selectedgriddataId && this.selectedgriddataId != ''){
          index = this.commonFunctionService.getIndexInArrayById(this.carddata,this.selectedgriddataId);
        }
        if(data && data.length > 0){  
            if(index != -1){
              this.carddata[index] = data[0];
            }
        }else{
            if(index != -1){
              this.carddata.splice(index,1);
            }
        }
        this.selectedgriddataId = '';
      }else if(data && data.length > 0 && !this.loadMoreData && !this.refreshlist){
        this.carddata = [];
        for(let i=0;i<data.length;i++){
          this.carddata.push(data[i]);
        }
      }else if(((data && data.length > 0 && (this.carddata.length > 0 ) && (this.loadMoreData || this.refreshlist)))){
        if(this.ionEvent){
          if(this.ionEvent.type == 'ionInfinite' && this.carddata.length !== this.totalDataCount){
            for(let i=0;i<data.length;i++){
              this.carddata.push(data[i]);
            }
          }else if(this.ionEvent.type == 'ionRefresh'){
            this.carddata = [];
            for(let i=0;i<data.length;i++){
              this.carddata.push(data[i]);
            }  
          }
        }else{
          this.carddata = [];
          for(let i=0;i<data.length;i++){
            this.carddata.push(data[i]);
          }
        }
      }else if(((data && data.length > 0 && this.carddata.length == 0 && (this.loadMoreData || this.refreshlist)))){        
        this.carddata = [];
        for(let i=0;i<data.length;i++){
          this.carddata.push(data[i]);
        }
      }
    }else{
      if(data && data.length == 0){
        this.carddata = [];
        this.nodatafound=true;
        console.log("Current page greater than totalPage");
      }
    }
    if(this.carddata && this.carddata.length > 0){
      this.nodatafound=false;
    }else{
      this.nodatafound=true;
    }
    if(this.scannerForm && this.formTypeName != ''){
      let forms=this.card?.card?.form;
      if(forms && forms[this.formTypeName] && this.carddata?.length == 1){
        this.editedRowData(0,this.formTypeName)
      }
      this.formTypeName='';
      // this.scannerForm=false;
    }
    if(this.enableScanner){
      this.appStorageService.setObject('scannedData',this.carddata);
    }
    if(this.cardType=='sampleSubmit')this.goToSampleSubmit();
  }
  checkLoader() {
    new Promise(async (resolve)=>{
      let checkLoader = await this.loaderService.loadingCtrl.getTop();
      if(checkLoader && checkLoader['hasController']){
        this.loaderService.hideLoader();
      }
    });
  }
  setDownloadPdfData(downloadPdfData){
    if (downloadPdfData != '' && downloadPdfData != null && this.downloadPdfCheck != '') {
      const file = new Blob([downloadPdfData.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(file);
      let fileExt:any = '';
      let fileName:any = '';
      if(downloadPdfData && downloadPdfData.filename){
        fileExt = downloadPdfData.filename.split('.').pop();
        fileName = downloadPdfData.filename;
      }      
      if(this.platform.is("hybrid")){
        this.downloadToMobile(file,fileName);
      }else{
        this.downloadService.download(url,downloadPdfData?.filename);
      }
      this.downloadPdfCheck = '';
      this.apiService.ResetPdfData();
      fileExt = '';
      fileName = '';
    }
  }
  async downloadToMobile(blobData:any,fileName:any,FolderName?:any){
    let file_Type:any = '';
    let folderName:any = '';
    if(blobData && blobData.type){
      file_Type = blobData.type;
    }
    if(FolderName == undefined || FolderName == null){
      folderName = 'Download'
    }else{
      folderName = FolderName;
    }
    let readPermission = await this.appPermissionService.checkAppPermission("READ_EXTERNAL_STORAGE");
    let writePermission = await this.appPermissionService.checkAppPermission("WRITE_EXTERNAL_STORAGE");

    if(readPermission && writePermission){

      // ==========using native file    
      this.file.checkDir(this.file.externalRootDirectory, folderName).then(() => {

        this.file.writeFile(this.file.externalRootDirectory + '/' + folderName + '/',fileName,blobData,{replace:true}).then(async() => {
          // confirm alert
          let openFile:any = await this.notificationService.confirmAlert("Saved in Downloads","Open file  " + fileName);
          if(openFile == "confirm"){
            const path = this.file.externalRootDirectory + '/' + folderName + '/' + fileName;
            const mimeType = file_Type;      
            // this.fileOpener.open(path,mimeType)
            // .then(()=> console.log('File is opened'))
            // .catch(error => console.log('Error opening file ',error));
          }
        }).catch( (error:any) =>{
          this.notificationService.presentToastOnBottom(JSON.stringify(error), 'danger');
        })
        
      }).catch( (error:any) =>{
        if(error && error.message == "NOT_FOUND_ERR" || error.message == "PATH_EXISTS_ERR"){
          
          this.file.createDir(this.file.externalRootDirectory, folderName, false).then((response:any) => {
            console.log('Directory create '+ response);
            this.file.writeFile(this.file.externalRootDirectory + "/" + folderName + "/",fileName,blobData,{replace:true}).then(() => {
              this.notificationService.presentToastOnBottom(fileName + " Saved in " + folderName);
            })

          }).catch( (error:any) =>{            
            this.notificationService.presentToastOnBottom(JSON.stringify(error));
          })
        }
      });
    }else{
      let gavepermission:any = await this.notificationService.presentToastWithButton("Please Allow File and Media Access in App Permission, to Download File","",'Allow',"",5000);
      if(gavepermission == "cancel"){
        this.apppermissionsService.openNativeSettings('application_details');
      }
    }
  }
  async downloadandprint(data){
    let template = data.data;
    const blob = new Blob([template], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    if(this.platform.is("hybrid")){
      const response:any = await this.appDownloadService.downloadAnyBlobData(blob,data?.filename,false,true);
      const fileUri:string = await this.appDownloadService.getFileUri(response?.filename,response?.directoryname);
      if(response?.sharefile && !response?.openfile){
        const canShare = await this.appShareService.checkDeviceCanShare();
        if(canShare){
          let shareOption = {
            title: response?.filename ? response.filename : "Print File",
            text: "Here is the file you requested.",
            url: fileUri,
            dialogTitle: "Print " + response?.filename
          }
          this.appShareService.share(shareOption);
        }
      }
      if(response?.openfile && !response?.sharefile){
        console.log(fileUri);
        if(fileUri){
          FileOpener.open({filePath:fileUri, contentType:'application/pdf', openWithDefault:true,}).then( res => {
            console.log("File Opened");
          }).catch((e)=>{
            console.error("File Opening error ", JSON.stringify(e));
          })
        }else{
          this.notificationService.presentToastOnBottom("File "+ response.filename + " is not availabe.")
        }
      }
    }else{
      this.chartService.downlodBlobData(blobUrl, data?.filename);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    }    
    this.checkLoader();
  }
  // Subscriber Functions Handling End -------------------

  // Unsubscribe Functions Handling Start -------------------
  unSubscribed(){
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
    if(this.pdfFileSubscription){
      this.pdfFileSubscription.unsubscribe();
    }
    if(this.childgridsubscription){
      this.childgridsubscription.unsubscribe();
    }
    if(this.nestedCardSubscribe){
      this.nestedCardSubscribe.unsubscribe();
    }
    if(this.printFileSubscription){
      this.printFileSubscription.unsubscribe();
    }
  }
  unsubscribedSavecall(){    
    if(this.saveResponceSubscription){
      this.saveResponceSubscription.unsubscribe();
    }
  }
  unsubscribeStaticData(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
  }
  // Unsubscribe Functions Handling End -------------------

  // Click Functions Handling Start---------------------
  async modaldetailCardButton(column, data){
    if(this.hasDetaildCard){
     const cardmaster=this.dataShareServiceService.getCardList();
      // const cardmaster = this.commonAppDataShareService.getModuleList();
      const childColumn = this.childColumn;
      if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
        cardmaster.forEach(element => {
          if(element._id == childColumn._id ){
            this.childColumns = element.fields;
            this.childCardType = element.card_type;
          }
        });
      }
      const modal = await this.modalController.create({
        component: ModalDetailCardComponent,
        componentProps: {
          "childData": data,
          "childColumns": this.childColumns,
          "childDataTitle": this.childDataTitle,
          "childCardType" : this.childCardType,
          "selected_tab_index": this.selectedIndex
        },
        id: data._id,
        showBackdrop:true,
        backdropDismiss:false,
      });
      modal.present();
      modal.componentProps.modal = modal;
      modal.onDidDismiss().then((result) => {
        this.detailPage = false;
      });
    }else{
      return console.log("No detail card found.");
    }
  }
  call(card:any,Index:number) {
    let callingNumber:any;
    let startTime: any = new Date();
    let startTimeMs:any = startTime.getTime(startTime);
    this.editedRowIndex = Index;
    if(card.mobile && card.mobile.length >= 10){
      callingNumber = card.mobile;
    }else if(card.billing_mobile && card.billing_mobile.length >= 10){
      callingNumber = card.billing_mobile;
    }else if(card.phone && card.phone.length >= 10){
      callingNumber = card.phone;
    }else{
      console.log("No number Found");
    }

    if(callingNumber && callingNumber != null){
      this.callNumber.callNumber(callingNumber, true)
        .then(res => {
          // console.log('Launched dialer! ' + res);
          this.notificationService.presentToastOnBottom("Calling on :- " + callingNumber,"success");
          
          this.callDetailRecord(card, startTimeMs);
        })
        .catch(err => console.log('Error launching dialer ' + err));
    }else{
      this.notificationService.presentToastOnBottom("Invalid number or Number not found","danger");
    }
  }  
  gridButtonAction(gridData,index,button,confirmation?:boolean){
    if(button && button.onclick && button.onclick.action_name){
      switch (button.onclick.action_name.toUpperCase()) {
        case "PREVIEW":
          this.checkPreviewData = true;
          this.apiCallService.preview(gridData,this.currentMenu,'grid-preview-modal');
          break;
        case "TEMPLATE": 
          let object =JSON.parse(JSON.stringify(gridData))    
          console.log(gridData); 
          //this.templateModal('template-modal',object,index, 'Template')
          break;
        case 'UPDATE':
          this.editedRowData(index,button.onclick.action_name.toUpperCase())
          break;
        case 'DOWNLOAD':
          let currentMenu = '';
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentMenu = this.currentMenu.name
          }
          this.downloadPdfCheck = this.apiCallService.downloadPdf(gridData,currentMenu);         
          break;
          case 'GETFILE':
            let currentsMenu = '';
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentsMenu = this.currentMenu.name
          }
          this.downloadPdfCheck = this.apiCallService.getPdf(gridData,currentsMenu);         
          break;
          case 'TDS':
            let currentMenuForTds = '';
            this.flagForTdsForm = true;
            this.currentRowIndex = index;
          if(this.currentMenu.name && this.currentMenu.name != null && this.currentMenu.name != undefined && this.currentMenu.name != ''){
            currentMenuForTds = this.currentMenu.name
          }
          const getFormData:any = this.apiCallService.getFormForTds(gridData,currentMenuForTds,this.carddata[index]);        
          if(getFormData._id && getFormData._id != undefined && getFormData._id != null && getFormData._id != ''){
            getFormData.data['data']=gridData;
            this.apiService.GetForm(getFormData);
          }else{
            getFormData.data=gridData;
            this.apiService.GetForm(getFormData);
          }
          break;
        case 'CANCEL':
          this.editedRowData(index,button.onclick.action_name)
          break;
        case 'INLINEEDIT':
          //this.gridInlineEdit(gridData,index);
          break;
        case 'COMMUNICATION':
          // this.commonFunctionService.openModal('communication-modal',gridData);
          break;
        case 'DOWNLOAD_QR':
          this.downloadQRCode = this.commonFunctionService.getQRCode(gridData);
          this.checkForDownloadReport = true;
          break;
        case 'DELETE_ROW':
          if(this.permissionService.checkPermission(this.currentMenu.name, 'delete')){
            this.editedRowData(index,button)
          }else{
            this.notificationService.showAlert("Permission denied","You don't have this Permission",['Dismiss']);
          }
          break;
          // case 'AUDIT_HISTORY':
          //   if (this.permissionService.checkPermission(this.currentMenu.name, 'auditHistory')) {
          //     let obj = {
          //       "aduitTabIndex": this.selectTabIndex,
          //       "tabname": this.tabs,
          //       "objectId": gridData._id
          //     }
          //     this.commonFunctionService.getAuditHistory(gridData,this.elements[index]);
          //     this.modalService.open('audit-history',obj);
          //   }else {
          //     this.notificationService.notify("bg-danger", "Permission denied !!!");
          //   }
          // break;
          case 'PRINT':
            let templateType = '';
            if(button.onclick.templateType && button.onclick.templateType != ''){
              templateType = button.onclick.templateType;
              gridData['print_template'] = templateType;
              const payload = {
                curTemp: this.currentMenu.name,
                data: gridData,
                _id :gridData._id
              }
              this.loaderService.showLoader("blank","dots");
              this.apiService.PrintTemplate(payload);
              // this.modalService.open('download-progress-modal', {});
            }else{
              this.notificationService.presentToastOnBottom('Template Type is null!!!','danger',);
            }
            break;
          case 'GOOGLE_MAP':
            this.loadNextGrid(index, gridData, button.onclick.action_name.toUpperCase());
            break;
          case 'GOOGLE_TRACKING_START':
            this.startTracking(gridData, index, button.onclick.action_name.toUpperCase());
            break;
          case 'GOOGLE_TRACKING_END':
            if(confirmation){
              this.saveCurrentLocationDetails(gridData,index);
              // this.editedRowData(index,button.onclick.action_name);
            }else{
              this.presentConfirmationActionSheet(gridData, index, button);
            }
            break;
        default:
          this.editedRowData(index,button.onclick.action_name);
          break;
      }
    }
  }
  // Click Functions Handling End---------------------

  // Dependency Functions Handling Start -------------------

  // Dependency Functions Handling End -------------------
  saveCallSubscribe(){
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    })
  }  
  resetVariabls(){
    if(this.updateMode){
    }
    if(!this.updateMode){
      this.carddata = []; 
      this.selectedgriddataId="";
    }
    this.formTypeName = '';
    this.editedRowIndex = -1;
    this.currentPageCount = 1;
    this.gridData = {};
  }
  onloadVariables(){
    this.checkionEvents();
    this.nodatafound=false;
    this.gridButtons=[];
    this.currentPageCount = 1;    
    this.carddata=[];
    this.hasDetaildCard=false;
    this.selectedgriddataId = "";
    this.addNewEnabled = false;
    this.form = "";
  }  
  onContentScroll(event:any) {
    let scrollEventVal:any = {};
    if (event.detail.scrollTop >= 50) {
      this.renderer.setStyle(this.cardViewContent['el'], 'top', '-69px');
      scrollEventVal['scrollValue'] = event.detail.scrollTop;
      scrollEventVal['setTopValue'] = "-69px";
      this.primaryheaderNew.emit(scrollEventVal);
    } else {
      this.renderer.setStyle(this.cardViewContent['el'], 'top', '0px');
      scrollEventVal['scrollValue'] = event.detail.scrollTop;
      scrollEventVal['setTopValue'] = "0px";
      this.primaryheaderNew.emit(scrollEventVal);
    }
  }
  getCardDataByCollection(i: number,parentId?:string) {
    this.resetVariabls();
    const cardWithTab = this.menuOrModuleCommonService.getCard(i);
    if(parentId !=null && parentId !=undefined){
      cardWithTab.card['parent_id'] = parentId;
      this.card = cardWithTab;
    }
    this.setCardAndTab(cardWithTab);    
  } 
  setCardAndTab(cardWithTab){
    if(cardWithTab && cardWithTab.card){
      if (this.permissionService.checkPermission(cardWithTab.card.collection_name, 'view')) {
        this.setCardDetails(cardWithTab.card);
      }else{
        this.card['viewPermission'] = false;
        let getStatus:any = this.authService.checkIdTokenStatus();
        if(getStatus && getStatus.status){
          this.notificationService.presentToastOnBottom("Permission denied !", "danger");
        }else{
          if(getStatus && getStatus.msg){
            this.notificationService.presentToastOnBottom(getStatus.msg);
          }
          this.authService.gotToSigninPage();
        }
      }
    } 
    if(cardWithTab && cardWithTab.tabs && cardWithTab.tabs.length > 0){
      this.tabMenu = cardWithTab.tabs;
      this.selectedIndex = cardWithTab.selectedTabIndex;
      this.popoverMenu = cardWithTab.popoverTabbing;
      if(cardWithTab && !cardWithTab.collectionFound){
        const moduleList = this.commonAppDataShareService.getModuleList();
        this.tabMenu.forEach((tab,i) => {
          if(tab && tab['_id']){
            const cardIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tab['_id'],"_id");
            this.tabMenu[i]['cardIndex'] = cardIndex;
            this.tabMenu[i]['tabCard'] = moduleList[cardIndex];
            this.tabMenu[i]['display'] = this.permissionService.checkPermission(this.tabMenu[i]['tabCard']['collection_name'],'view')
          }
        });
        this.popoverTabbing.emit(this.tabMenu);
        cardWithTab['collectionFound'] = true;
      }
    }else{
      this.tabMenu = [];
      this.selectedIndex = -1;
    }
  }
  async setCardDetails(card) {
    let criteria:any = [];
    let parentcard:any = {};
    if(card){
      if(card.buttons){
        this.gridButtons = card.buttons;
      }else{
        this.gridButtons = [];
      }
      // if(card.add_new){
      //   if(this.detailPage){
      //     this.addNewEnabled = false;
      //   }else{
      //     this.addNewEnabled = true;
      //   }
      // }else{
      //   this.addNewEnabled = false;
      // }
      if(card.add_calling){
        if(this.detailPage){
          this.addCallingFeature = false;
        }else{
          this.addCallingFeature = true;
        }
      }else{
        this.addCallingFeature = false;
      }
      if (card.card_type !== '') {
        this.cardType = card.card_type.name;
      }      
      // if(this.cardType=='sampleSubmit')this.goToSampleSubmit();
      // this.childColumn = card.child_card;
      if(card.fields && card.fields.length > 0){
        this.columnList = card.fields;      
      }
      if(this.createFormgroup){
        let columnList:any =[];
        this.columnList.forEach(element => {
          if(element.filter){
            columnList.push(element);
          }
        });
        this.columnListOutput.emit(columnList);
      }
      if(card.parent_criteria){
        if (card.api_params_criteria && card.api_params_criteria.length > 0 ) {
          card.api_params_criteria.forEach(element => {
            criteria.push(element);
          });
          parentcard = card;
        }
      }
      if(card.enable_refresh_mode){
        this.refreshlist = card.enable_refresh_mode;
        this.checkionEvents();
      }else{
        this.refreshlist = false;
      }      
      if(card.enable_load_more ){   
        this.loadMoreData = card.enable_load_more
        this.checkionEvents();
        if(this.selectedgriddataId && this.selectedgriddataId !=''){
          const cr = "_id;eq;" + this.selectedgriddataId + ";STATIC";
          criteria.push(cr);
          parentcard = card;
        }
      }else{
        this.loadMoreData = false;
        this.selectedgriddataId = "";
      }
      if((card.child_card && card.child_card['_id']) || (card.grid && card.grid['_id'])){
        if(card.grid && card.grid['_id']){
          this.getChildGridFieldsbyId(card.grid['_id']);
        }
        this.hasDetaildCard = true;
      }else{
        this.hasDetaildCard = false;
      }      
      let collectioncriteria:any = await this.collectionSpecificCriteria(card);
      if(collectioncriteria && collectioncriteria.length > 0){
        criteria = this.setCriteria(criteria,collectioncriteria);
      }
      if(card.form){
        this.form = card.form;
      }
      if(card.enableScanner){
        this.enableScanner = card.enableScanner;
      }else{
        this.enableScanner=false;
      }
      if(card.enable_only_edit){
        this.enableCustomGotoCollection = card.enable_only_edit;
      }else{
        this.enableCustomGotoCollection=false;
      }
      this.collectionname = card.collection_name;
      if(this.collectionname !=''){
        if(this.currentMenu == undefined){
          this.currentMenu = {};
        }
        this.currentMenu['name'] = this.collectionname;
        this.dataShareServiceService.setCollectionName(card.collection_name);
        this.addNewEnabled = this.permissionService.checkPermission(this.currentMenu.name, 'add');
        if(this.addNewEnabled){
          if(this.detailPage){
            this.addNewEnabled = false;
          }else{
            this.addNewEnabled = true;
          }
        }
      }
      this.getGridData(this.collectionname, criteria, parentcard);
    }
  }
  async collectionSpecificCriteria(card:any){
    let customCriteria = [];
    if(this.coreFunctionService.isNotBlank(this.cardType)){
      switch(this.cardType){
        case "trackOnMap":
          if(card && card.collection_name == "travel_tracking_master" && card.parent_id && card.parent_id !=''){
            const cr = "travelPlan._id;eq;" + card.parent_id + ";STATIC";
            customCriteria.push(cr);
            return customCriteria;
          }
          break;
        case "scanner":
          this.checkBarcodeScannerSupportedorNot();
          break;
        default:
          
          break;
      }
    }
    if(card.collection_name=='sample_collection'){
      let user=this.storageService.GetUserInfo();
      const cr1 = "updatedBy;eq;" + user?.email + ";STATIC";
      const cr2 = "status;eq;" + "PENDING" + ";STATIC";
      customCriteria.push(cr1);
      customCriteria.push(cr2);
      return customCriteria;
    }
    if(card['enableGps']){
      if(this.platform.is("hybrid")){
        let isGpsEnabled = await this.app_googleService.checkGeolocationPermission();
        if(!isGpsEnabled){
          await this.gpsEnableAlert();
        }
      }else{
        await this.getCurrentPosition();
      }
    }
  }
  search(searchcard) {
    // const criteria = "quotation_status;stwic;"+this.searchcard+";STATIC";
    // this.getGridData(this.collectionname, [criteria]);
    // this.getGridData(this.collectionname);
  }
  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.getGridData(this.collectionname);
    }
  }
  // goBack(){
  //   this.carddata = [];
  //   this.tabMenu = [];
  //   this.openFilter = false;
  // }  

  // go to new page 2nd method
  async detailCardButton(column, data){
    if(this.detailPage){
      //const index = this.coreUtilityService.getIndexInArrayById(this.carddata,data._id);
      this.modaldetailCardButton(column,data);
    }else{
      const newobj = {
        "childdata": data,
        "selected_tab_index": this.selectedIndex
      }
      this.dataShareServiceService.setchildDataList(newobj);  
      this.commonAppDataShareService.setSelectedTabIndex(this.selectedIndex);  
      this.router.navigate(['card-detail-view']);
    }
    
  }
  
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...');
  }  

  callInvoice(card:any,Index:number) {
    let callingNumber:any;
    if(card.billing_mobile !=''){
      callingNumber = card.billing_mobile;
    }
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
  }
  setCriteria(listCiteria,criteria){
    if(criteria && criteria.length > 0){
      criteria.forEach(cr => {
        if(listCiteria && listCiteria.length >=0 ){
          listCiteria.push(cr);
        }
      });
    }
    return listCiteria;
  }
  async getGridData(collectionName,criteria?,parentCard?){
    const crList = this.apiCallService.getfilterCrlist(this.columnList, this.filterForm.value);
    const params = collectionName;
    let cardCriteria = [];
    let object = {};
    if(criteria && criteria.length > 0){
      cardCriteria = this.setCriteria(cardCriteria,criteria);
      object = parentCard;
    }
    if(this.detailPage){
      if(this.card && this.card.card){
        let card = this.card.card
        if(card.api_params_criteria && card.api_params_criteria.length > 0){
          cardCriteria = this.setCriteria(cardCriteria,card.api_params_criteria);
          object = this.data
        }        
      } 
    }
    
    let user = this.storageService.GetUserInfo();
    object["user"]=user;
    let data = this.apiCallService.getPaylodWithCriteria(params,'',cardCriteria,object);
    this.currentPage = this.currentPageCount - 1;
    data['pageNo'] = this.currentPage;
    data['pageSize'] = this.dataPerPageCount;
    // if(this.currentPageCount < this.totalPageCount){
    //   // let dataIncrement = this.pageCount ++;
    //   data['pageNo'] = 0;
    //   data['pageSize'] = this.currentPageCount * this.dataPerPageCount;
    // }else{
    //   data['pageNo'] = this.currentPageCount;
    //   data['pageSize'] = this.dataPerPageCount;
    // }
    
    if(crList && crList.length > 0){
      crList.forEach(cr => {
        if(data && data.crList && data.crList.length >= 0){
          data.crList.push(cr);
        }
      });
    }
    let payload = {
      'data':data,
      'path':null
    }
    if(payload.data && payload.data.value && !this.updateMode){
      let checkLoader = await this.loaderService.loadingCtrl.getTop();
      if(!checkLoader){
        await this.loaderService.showLoader("Loading...");
      }
    }
    this.apiService.getDatabyCollectionName(payload);
  }

  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  } 

  tabmenuClick(index:number){
    this.selectedIndex = index;
    this.carddata = [];
    this.createFormgroup = true;
    const tab = this.tabMenu[index];
    const moduleList = this.commonAppDataShareService.getModuleList();
    const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tab._id,"_id"); 
    const card = moduleList[tabIndex];
    this.card['card'] = card;
    this.card.selectedTabIndex = index;
    this.setCardDetails(card);
  } 
  
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    //this.router.navigate(['crm/quotation']);
    this.dataShareServiceService.setcardData(card);
  }
  // add new card or record in cardlist 
  async addNewForm(formName?:any,permissionName?:string){
    if (this.permissionService.checkPermission(this.currentMenu.name, 'add') || this.permissionService.checkPermission(this.currentMenu.name, 'edit') || this.permissionService.checkPermission(this.currentMenu.name, permissionName)) {
      if(formName){
        this.formTypeName = formName;
      }else{
        this.formTypeName = "default";
      }
      this.commonAppDataShareService.setSelectedTabIndex(this.selectedIndex);
      let card = this.card;
      let form:any = {};
      let id = '5f6d95da9feaa2409c3765cd';
      if(card && card.card && card.card.form){
        form = this.commonFunctionService.getForm(card.card.form,formName,this.gridButtons);
        if(form && form._id && form._id != ''){
          id = form._id;
        }else if(card.card.form && card.card.form._id){
          form = card.card.form;
          id = card.card.form._id;
        }
      }    
      this.commonAppDataShareService.setFormId(id);
      // this.router.navigate(['crm/form']);
      this.saveCallSubscribe();
      const modal = await this.modalController.create({
        component: FormComponent,
        componentProps: {
          "childData": this.gridData,
          "editedRowIndex": this.editedRowIndex,
          "addform" : form,
          "formTypeName" : this.formTypeName,
        },
        id: form._id,
        showBackdrop:true,
        backdropDismiss:false,
      });
      modal.present();
      modal.componentProps.modal = modal;
      modal.onDidDismiss().then((result) => {  
        // if(this.scannerForm){this.scannerForm=false; this.ngOnChanges();}
        this.getCardDataByCollection(this.selectedIndex);
        this.unsubscribedSavecall();
      });
    } else {
      this.notificationService.presentToastOnBottom("Permission denied !!!","danger");
    }
  }

  async openFormModalForScanner(form:any,selectedData:any){
    this.commonAppDataShareService.setFormId(form?._id);
    const modal = await this.modalController.create({
      component: FormComponent,
      componentProps: {
        "childData": selectedData,
        "editedRowIndex": 0,
        "addform" : form,
        "formTypeName" : this.formTypeName,
      },
      id: form._id,
      showBackdrop:true,
      backdropDismiss:false,
    });
    modal.present();
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then((result) => {  
      this.getCardDataByCollection(this.selectedIndex);
      // this.unsubscribedSavecall();
    });
  }

  getFirstCharOfString(char:any){
    return this.commonFunctionService.getFirstCharOfString(char);
  }
  // for entering call record after call cut with customer
  async callDetailRecord(data:any, startTime:any){
    const modal = await this.modalController.create({
      component: CallDataRecordFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        "cardData": data,
        "selectedRowIndex": this.editedRowIndex,
        "startTime" : startTime,
      },
      id: data._id,
      showBackdrop:true,
      backdropDismiss:false,
    });
    modal.present();
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then((result) => {
      this.getCardDataByCollection(this.selectedIndex);
    });
  }
  // Pull from bottom for loading more cards
  loadData(event:any) {
    if(this.loadMoreData){
      this.ionEvent = event;
      setTimeout(() => {
        event.target.complete();
        // this.loadMoreData = true;
        if(this.currentPageCount <= this.totalPageCount){
          if (this.carddata.length === this.totalDataCount || this.totalDataCount === 1) {// App logic to determine if all data is loaded
            this.ionEvent.target.disabled = true;    // and disable the infinite scroll
            this.notificationService.presentToastOnBottom("You reached at the end.","success");
          }else{
            this.currentPageCount++;
            this.getGridData(this.collectionname);  
          }
        }else{
          this.notificationService.presentToastOnBottom("No more data.");
        }        
      }, 2000);

    }else{
      setTimeout(() => {
        console.log("Load More Data feature disable.");
          event.target.complete();
      }, 2000);
    }
  }
  // Pull from Top for Do refreshing or update card list 
  doRefresh(event:any) {
    if(this.refreshlist){
      this.ionEvent = event;
      console.log('Begin doRefresh async operation');
      this.updateMode = false;  
      setTimeout(() => {
        event.target.complete();
        let card:any;
        let criteria:any = [];
        // if (this.carddata.length === this.totalDataCount) { 
          // App logic to determine if all data is loaded
          // this.refreshEvent.target.disabled = true;    // Disable the infinite scroll if carddata.length === response.totaldata.length
          // console.log('doRefresh async operation has ended');
          // this.notificationService.presentToastOnBottom("No Updates Available","success");
        // }else{
          if(this.card && this.card.card){
            card = this.card.card;
          }
          if(card && card.api_params_criteria && card.api_params_criteria.length > 0){
            card.api_params_criteria.forEach(element => {
              criteria.push(element);
            });
          }
          if(card && card.parent_id){
            if(card && card.collection_name == "travel_tracking_master" && card.parent_id && card.parent_id !=''){
              const cr = "travelPlan._id;eq;" + card.parent_id + ";STATIC";
              criteria.push(cr);
            }      
          }
          if(card && card.collection_name){
            if(card.collection_name=='sample_collection'){
              let user=this.storageService.GetUserInfo();
              const cr1 = "updatedBy;eq;" + user?.email + ";STATIC";
              const cr2 = "status;eq;" + "PENDING" + ";STATIC";
              criteria.push(cr1);
              criteria.push(cr2);
            }
          }
          this.getGridData(this.collectionname, criteria, card);
        // }
      }, 2000);

    }else{
      console.log("Top refresh feature disable.");
      event.target.complete();
    }
  }

  editedRowData(index,formName,customData?:any) {
    if (this.permissionService.checkPermission(this.currentMenu.name, 'edit')) {
      this.editedRowIndex = index;
      let selectedData:any = this.carddata[index];
      if(selectedData){
        this.gridData = selectedData;
      }else{
        if(customData){
          this.gridData = customData;
        } 
      }
      if(this.gridData){
        this.selectedgriddataId = this.gridData._id;
      }
      this.updateMode = true;
      if(formName == 'UPDATE'){   
        if(this.checkUpdatePermission(this.carddata[index])){
          return;
        }   
        if(this.checkFieldsAvailability('UPDATE')){
          this.addNewForm(formName);
          this.apiCallService.getRealTimeGridData(this.currentMenu, this.carddata[index]);
        }else{
          return;
        }  
        // this.addNewForm(formName, 'edit');      
      }else{
        this.addNewForm(formName, 'edit');
        this.apiCallService.getRealTimeGridData(this.currentMenu, this.carddata[index]);
      }  
      this.selectedIndex = index;    
    } else {
      this.notificationService.presentToastOnBottom("Permission denied !!!","danger");
    }
  }

  async storeCardGridDetails(selectedgridcard:any,index:number){
    let updateMode =  this.updateMode;
    let cardLayoutDetails = {
      "collection_name":this.currentMenu.name,
      "card":this.card,
      "selected_grid_card":selectedgridcard,
      "selected_grid_card_index":index,
      "carddata_list":this.carddata,
      "updateMode" : updateMode,
      "module_index":this.commonAppDataShareService.getModuleIndex(),
    }
    if(this.multipleCardCollection && this.multipleCardCollection.length > 0){
      this.multipleCardCollection.forEach(element => {
        if(element.module_index != this.commonAppDataShareService.getModuleIndex()){
          this.multipleCardCollection.push(cardLayoutDetails);
          this.commonAppDataShareService.setMultipleCardCollection(this.multipleCardCollection);
        }
      });
    }else{
      this.multipleCardCollection.push(cardLayoutDetails);
      this.commonAppDataShareService.setMultipleCardCollection(this.multipleCardCollection);
    }
       
  }
  
  async loadNextGrid(index:number,gridData:any,buttonName?:any){
    const status = await this.checkStatus(gridData); //only for travel approve status
    if(status){
      if(gridData && gridData.name){
        this.parentCardName.emit(gridData.name);
      }
      await this.storeCardGridDetails(gridData,index);

      let parentcard = this.card.card;
      // this.selectedgriddataId = gridData._id;

      let nestedCard:any = {};
      let id="";
      if(parentcard && parentcard.gridChildCard){
        nestedCard = this.menuOrModuleCommonService.getNestedCard(parentcard.gridChildCard,buttonName);
        if(nestedCard && nestedCard._id && nestedCard._id != ''){
          id = nestedCard._id;
        }
        this.commonAppDataShareService.setNestedCardId(id);
        const moduleList = this.commonAppDataShareService.getModuleList();
        const nxtCardindex = this.commonFunctionService.getIndexInArrayById(moduleList,nestedCard._id,"_id");
        this.commonAppDataShareService.setModuleIndex(nxtCardindex);
        this.getCardDataByCollection(index, gridData._id); 
        // this.commonAppDataShareService.setNestedCard(nestedCard);
        // let cardWithTabs:any = this.coreUtilityService.getCard(index);
        // let nestedCardDetail:any = cardWithTabs.card;
        // nestedCardDetail['parent_item_id']=
        // this.setCardDetails(nestedCardDetail);
      }else {
        console.log("parentcard.gridChildCard : is not Present or undefined." )
        this.notificationService.presentToastOnBottom("Something went wrong. Please connect to Admin.");
      }
    
    }else{
      this.notificationService.presentToastOnBottom("This Plan is not Approved.");
    }
        
  }
  async checkStatus(gridData:any){
    if(gridData && gridData.approvdStatus !="Approve"){
      return false;
    }else{
      return true;
    }
  }
  async loadPreviousGrid(){
    let nextGridData:any = {}
    if(this.multipleCardCollection.length > 0){
      nextGridData = this.multipleCardCollection[this.multipleCardCollection.length -1];
    }
    this.carddata=nextGridData.carddata;
    // this.setCardDetails(nextNextGridData.card);
  }

  checkUpdatePermission(rowdata){
    if(this.details && this.details.permission_key && this.details.permission_key != '' && this.details.permission_value && this.details.permission_value != ''){ 
      const value = this.commonFunctionService.getObjectValue(this.details.permission_key,rowdata) 
      if(value == this.details.permission_value){
        this.notificationService.showAlert("Can't be update!!!","NO permission",['Dismiss'])
        return true;
      }
    }else{
      return false;
    }
  }
  checkFieldsAvailability(formName){
    if(this.card && this.card.card && this.card.card.form){
      let form = this.commonFunctionService.getForm(this.card.card.form,formName,this.gridButtons);
      // if(form['tableFields'] && form['tableFields'] != undefined && form['tableFields'] != null){ //web based condition
      if(form['_id'] && form['_id'] != undefined && form['_id'] != null){ //app based condition
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  getChildGridFieldsbyId(childrGridId:string){
      const params = "grid";
      const criteria = ["_id;eq;" + childrGridId + ";STATIC"];
      const payload = this.apiCallService.getPaylodWithCriteria(params, '', criteria, {});
      this.apiService.GetChildGrid(payload);
  }
  // myFiles:any;
  
  arrayBufferToBlob(arrayBufferData:any, extentionType?:any,filename?:any){  
    const fileExtension = extentionType;
    // if(fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg" ){
    //   file_Type = "image/" + extentionType;
    //   file_prefix = "Image";
    // }else if(fileExtension == "xlsx" || fileExtension == "xls"){
    //   file_Type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
    //   file_prefix = "Excel";
    // }else if(fileExtension == "pdf"){
    //   file_Type = "application/" + extentionType;
    //   file_prefix = "PDF";
    // }else{
    //   file_Type = "application/octet-stream";
    //   file_prefix = "TEXT";
    // }

    const response: any = this.appDownloadService.getBlobTypeFromExtn(extentionType);
    const file_Type:string = response?.mimeType ? response?.mimeType : '';
    const file_prefix:string = response?.filePrefix ? response?.filePrefix : '';

    let fileName:any;
    if(filename && filename !=undefined){      
      fileName = filename;
    }else{
      fileName = file_prefix + '_' + new Date().getTime() + "." + fileExtension;
    }
    const blobData:Blob = new Blob([arrayBufferData],{type:file_Type});
    
    this.downloadToMobile(blobData,fileName);

  }

  checkionEvents(){
    if(this.refreshlist){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = !this.refreshlist;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = this.refreshlist;
      }
    }
    if(this.loadMoreData){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = this.loadMoreData;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = !this.loadMoreData;
      }
    }
    if(this.loadMoreData && this.refreshlist){
      if(this.ionEvent && this.ionEvent.type == 'ionRefresh'){
        this.ionEvent.target.disabled = !this.refreshlist;
      }
      if(this.ionEvent && this.ionEvent.type == 'ionInfinite'){
        this.ionEvent.target.disabled = !this.loadMoreData;
      }
    }
    
  }
  async gpsEnableAlert(alerttype?:string){
    let alertType = alerttype ? alerttype : "GPS";
    let alertHeader:string = 'Please Enable GPS !';
    let message: string = 'For smooth app experience please give us your location access.';
    if(alertType == 'userDeniedAlert'){
      alertHeader = 'GPS Turned Off !'
      message = 'Allow us to turn on GPS for smooth app experience.'
    }else if(alertType == 'trackingAlert'){
      alertHeader = 'We need your location access !'
      message = 'Allow us to turn on GPS for smooth app experience.'
    }
    const alert = await this.alertController.create({
      cssClass: 'my-gps-class',
      header: alertHeader,
      message: message,
      buttons: [
        {
          text: 'No, thanks',
          role: 'cancel',
          handler: () => {
            console.log(alertType.toUpperCase() + " alert action : ", "cancel");
          }
        },
        {
          text: 'OK',
          role: 'confirmed',
          handler: () => {
            console.log(alertType.toUpperCase() + " alert action : ", "Confirmed");
          },
        },
      ],
    });

    await alert.present();
    await alert.onDidDismiss().then(value => {
      this.gpsAlertResult = value;
    });
    if(this.gpsAlertResult && this.gpsAlertResult.role == 'confirmed'){
      await this.requestLocationPermission();
    }
  }

  async requestLocationPermission() {
    let isGpsEnable = false;
    if(isPlatform('hybrid')){
      const permResult = await this.appPermissionService.checkAppPermission("ACCESS_FINE_LOCATION");
      const permResult1 = await this.appPermissionService.checkAppPermission("ACCESS_COARSE_LOCATION");
      if(permResult){
        isGpsEnable = await this.app_googleService.askToTurnOnGPS();
        if(isGpsEnable){
          this.userLocation = await this.app_googleService.getUserLocation();
          if(this.userLocation !=null && (this.userLocation.lat !=null || this.userLocation.latitude !=null)){
            this.currentLatLng ={
              lat:this.userLocation.lat ? this.userLocation.lat : this.userLocation.latitude,
              lng:this.userLocation.lng ? this.userLocation.lng : this.userLocation.longitude
            }
            // let currentlatlngdetails:any = await this.app_googleService.getAddressFromLatLong(this.currentLatLng.lat,this.currentLatLng.lng);
            return true;
          }
        }else{
          this.currentLatLng = {}
        }
      }
    }else{ 
      await this.getCurrentPosition();
    }
    
  }
  async getCurrentPosition(){
    if(navigator?.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        this.userLocation = position;
        this.currentLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        return true;
      });
    }else{
      this.notificationService.presentToastOnBottom("Browser doesn't support Geolocation.");
      this.currentLatLng = {};
    }
  }
  async actionBtnClicked(index:number,btnStatus:any){
    this.updateMode=true;
    this.editedRowIndex = index;
    let header:string = "Are you sure !";
    let msg:string = "Wanna do this?";
    if(btnStatus == "reject"){
      header = 'Reject Item';
      msg = 'Do you wanna Reject the Item Delivery ?'
    }else if(btnStatus == "accept"){
      header = 'Accept Item';
      msg = 'Accept this Item for Delivery ?'
    }
    let confirmDelete:any = await this.notificationService.confirmAlert(header,msg);
    let selectedRow:any = {};
    selectedRow = this.carddata[index];
    if(confirmDelete === "confirm"){
      if(btnStatus == "reject"){ 
        selectedRow['status'] = "REJECTED";
        selectedRow['rejectedDateTime'] = this.datePipe.transform(new Date(), "dd-MM-yyyyThh:mm:ss");
        // this.carddata.splice(index,1);
      }
      if(btnStatus == "accept"){ 
        selectedRow['status'] = "ACCEPTED";
        selectedRow['acceptedDateTime'] = this.datePipe.transform(new Date(), "dd-MM-yyyyThh:mm:ss");
      }
      this.carddata[index]=selectedRow;
      let payload = {
        'data':selectedRow,
        'curTemp': this.collectionname
      }
      this.apiService.SaveFormData(payload);
    }
  }
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '') {
        if (saveFromDataRsponce.success == 'success' && !this.updateMode) {
          let card:any;
          let criteria:any = [];
          if(this.card && this.card.card){
            card = this.card.card;
          }
          if(card && card.api_params_criteria && card.api_params_criteria.length > 0){
            card.api_params_criteria.forEach(element => {
              criteria.push(element);
            });
          }
          this.getGridData(this.collectionname,);
          // this.setCardDetails(this.card.card);
        }else if (saveFromDataRsponce.success == 'success' && this.updateMode) {
          this.carddata[this.editedRowIndex] == saveFromDataRsponce.data;
          if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }
        }
      }
      this.apiService.ResetSaveResponce();
    }
  }
  async startTracking(data:any,index:number,actionname?:any){
    try{
      this.updateMode = true;
      this.editedRowIndex = index;
      let isGpsEnable = await this.app_googleService.checkGeolocationPermission();
      if(isGpsEnable){
        if(this.currentLatLng && this.currentLatLng.lat){
          let destination:any={}
          if(data.customerAddress != null && data.customerAddress != 'null' && data.customerAddress != undefined && data.customerAddress != ''){
            const geocodeAddress:any = {
              'address' : data.customerAddress
            }
            if(this.coreFunctionService.isNotBlank(geocodeAddress.address) && geocodeAddress.address != "null,"){
              destination = await this.app_googleService.getGoogleAddressFromString(geocodeAddress);
            }else{
              return this.notificationService.presentToastOnBottom("Location Address not Present.","danger")
            }
          }
          let currentlatlngdetails:any;
          if(this.currentLatLng !=null && this.currentLatLng.lat !=''){
            currentlatlngdetails = await this.app_googleService.getAddressFromLatLong(this.currentLatLng.lat,this.currentLatLng.lng);
          }
          let additionalData:any = {
            "collectionName":this.collectionname,
            "currentLatLng":this.currentLatLng,
            "currentLatLngDetails": currentlatlngdetails['0'],
            "destinationAddress": destination,
            "updateMode" : true
          }
          const modal = await this.modalController.create({
            component: GmapViewComponent,
            cssClass: 'my-custom-modal-css',
            componentProps: { 
              "selectedRowData": data,
              "selectedRowIndex": index,
              "additionalData": additionalData,
            },
            id: data._id,
            showBackdrop:true,
            backdropDismiss:false,
            initialBreakpoint : 1,
            breakpoints : [0.75, 1],
            backdropBreakpoint : 0.75,
            handleBehavior:'cycle'
          });
          modal.present();
          modal.componentProps.modal = modal;
          modal.onDidDismiss().then(async (result:any) => {
            console.log("Google map Modal Closed", result);
            if(result && result.role == "completed"){
              // this.editedRowData(index,"UPDATE"); //for open form
            }
            this.carddata[index] = result.data;
          });
        }else{
          await this.requestLocationPermission();
          this.startTracking(data,index);
        }
      }else{
        await this.gpsEnableAlert('trackingAlert').then((confirm:any) => {
          if(this.gpsAlertResult && this.gpsAlertResult.role == "confirmed" && this.currentLatLng && this.currentLatLng.lat){ 
            this.notificationService.presentToastOnBottom("Getting your location, please wait..");
            this.startTracking(data,index);
          }else{
            this.notificationService.presentToastOnBottom("Please enable GPS to serve you better !");
          }
        }).catch(error => {
          this.notificationService.presentToastOnBottom("Please enable GPS to serve you better !");
        })
      }

    }catch{

    }
  }
  async presentConfirmationActionSheet(gridData, index:number, btnName, errorMsg?:string) {
    const actionSheet = await this.actionSheetController.create({
      header: "Are You Sure ?",
      subHeader: errorMsg,
      buttons: [{
        text: btnName.label ? btnName.label : "Save",
        role: 'confirm',
        icon: 'checkmark',
        handler: () => {
          console.log('Confirmed clicked');
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
            console.log('Canceled clicked');
        }
      }]
    });
  
    await actionSheet.present();
    const result:any = await actionSheet.onDidDismiss();
    if(result && result.role == "confirm"){
      // this.gridButtonAction(gridData, index, btnName,true);      
      let confirmatioObject = {
        'gridData': gridData,
        'index': index,
        'btnName': btnName,
        'confirm': result.role
      }
      this.dataShareServiceService.setConfirmation(confirmatioObject);//not working neeed to do more changes
    }
  }
  saveCurrentLocationDetails(data,index:number){
    const formData = ''
  }
  
  async getUTCDate(date:any){
    let Mdate = date.substring(0,11) + "00:00:00" + date.substring(19);
    let utcDate:any = zonedTimeToUtc(Mdate, this.userTimeZone);
    return utcDate = this.datePipe.transform(utcDate,"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", 'UTC');
  }

  mapOutPutData(index:number){
    this.editedRowData(index,"UPDATE");
  }
  /*----BarCode Functions------------------------------------------------------------------------- */
  checkBarcodeScannerSupportedorNot(){
      BarcodeScanner.isSupported().then((result) => {
        this.isBarCodeScannerSupported = result.supported;
        // this.startScan();
        this.checkCameraPermissionToScan()
      }).catch(err => {
        this.barCodeNotExistAlert();
        console.log('checkBarcodeScannerSupportedorNot Error', err);
      });
  }
  barCodeNotExistAlert(){
    let alertOpt = {
      'header': "Alert",
      'message':"Your device doesn't support barcode scanning.",
      'buttons' : [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    }
    this.popoverModalService.showErrorAlert(alertOpt);
  }
  checkCameraPermissionToScan(){
    if(this.isBarCodeScannerSupported){
      BarcodeScanner.checkPermissions().then((result) => {
        if(result.camera === 'granted' || result.camera === 'limited'){
          this.isBarCodeCameraPermissionGranted = true;
          // this.removeAllBarCodeListeners();
          BarcodeScanner.removeAllListeners().then(() => {
            console.log("removeAllListeners");
            this.startScan();
          });          
        }else{
          if(result.camera === 'denied' || result.camera == "prompt"){
            this.presentsettingAlert();
          }
          this.isBarCodeCameraPermissionGranted = false;
        }
      }).catch(err => {
        console.log('checkCameraPermissionToSacn Error', err);
      });
    }else{
      this.barCodeNotExistAlert();
    }
  }
  removeAllBarCodeListeners(){
    BarcodeScanner.removeAllListeners().then(() => {
      console.log("removeAllListeners")
      BarcodeScanner.addListener(
        'barcodeScanned',
        (event) => {
          this.ngZone.run(() => {
            console.log('barcodeScanned', event);
            // const { state, progress } = event;
            // this.formGroup.patchValue({
            //   googleBarcodeScannerModuleInstallState: state,
            //   googleBarcodeScannerModuleInstallProgress: progress,
            // });
          });
        }
      );
    });
  }
  async startScan(): Promise<void> {
    const formats = this.formGroup.get('formats')?.value || this.barCodeFormats;
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;
    const modal = await this.popoverModalService.showModal({
      component: BarcodeScanningComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: formats,
        lensFacing: lensFacing,
      },
    });
    modal.onDidDismiss().then(async(result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
        if(barcode)this.checkScannedData(barcode);
    });
  }

async checkScannedData(barcodeDetails?:any){
  let forms = this.card?.card?.form;
  let resultValue='';
  this.formTypeName ='';
  // this.scannerFormName="upload_file";"F01-2402150016"
  // this.formTypeName="upload_file";
  let barCodeType=barcodeDetails?.format;
  let barcodeValue=this.parseIfObject(barcodeDetails?.displayValue);
  switch(barCodeType){
      case "CODE_128":
        this.formTypeName ="UPDATE";
        resultValue=barcodeDetails?.displayValue;
        break;
      default:
        if(forms){
          this.formTypeName = barcodeValue?.form_name;
          resultValue=barcodeValue?.serialId;
        }else{
          const confirm= await this.notificationService.showAlert('Barcode result','Please Scan the right Barcode',["Dismiss"]);
        }
  }
  if(!resultValue)await this.notificationService.showAlert('','Please Scan the right Barcode',["Dismiss"]);
  if(resultValue && resultValue!='')this.alertPopUp(forms,this.formTypeName,resultValue)
  // this.openScannedData(forms,this.formTypeName,resultValue)
  //   if(forms && forms[this.formTypeName] && resultValue != ''){
  //     this.scannerForm=true;
  //     this.data={
  //       filterFormData:{
  //         "serialId": resultValue
  //       }
  //     }
  //     this.ngOnChanges();
  //     this.data={};
  // }
}
openScannedData(forms:any,formTypeName:any,resultValue:any){
  // if(forms && forms[formTypeName] && resultValue != ''){
    this.scannerForm=true;
    this.loaderService.showLoader("Loading...");
    let criterai ="uniqueId;eq;"+resultValue+";STATIC";
    let payload = this.apiCallService.getPaylodWithCriteria(this.collectionname,"",[criterai],{});
    payload["pageSize"] = 25;
    payload["pageNo."] = 0;
    let finalPayload = {
      "data" : payload,
      "path" : null
    }
    this.apiService.getGridRunningData(finalPayload);
    // this.data={
    //   filterFormData:{
    //     "serialId": resultValue
    //   }
    // }
    // this.ngOnChanges();
    // this.data={};
  // }
}
parseIfObject(variable:any) {
  try {
      return JSON.parse(variable);
  } catch (error) {
      return variable;
  }
}

async alertPopUp(forms?:any,formTypeName?:any,resultValue?:any){
  let alertHeader:string = 'Scanned Value';
  let message: string = `Barcode value is <strong>${resultValue}</strong>`;
  let res=''
  const confirm= await this.notificationService.confirmAlert(alertHeader,message,"Proceed","Close");
  if(confirm=="confirm"){
    this.openScannedData(forms,this.formTypeName,resultValue);
  }
  // const alert = await this.alertController.create({
  //   cssClass: 'my-gps-class',
  //   header: alertHeader,
  //   message: message,
  //   buttons: [
  //     {
  //       text: 'CLOSE',
  //       role: 'cancel',
  //       handler: () => {
  //         console.log('Cancel clicked');
  //       },
  //     },
  //     {
  //       text: 'PROCEED',
  //       role: 'confirmed',
  //       handler:() => {
  //         console.log('proceed clicked');
  //         this.openScannedData(forms,this.formTypeName,resultValue);
  //       },
  //     }
  //   ],
  // })
  // await alert.present();
}

  async goToSampleSubmit(collectionCenter?:any,scannedData?:any): Promise<void> {
    const scannedDataList = await this.appStorageService.getObject('scannedData');
    scannedData = JSON.parse(scannedDataList);
    const obj :any = {
      'selectedCollectionCenter' : collectionCenter,
      'scannedData' : scannedData
    }
    const modal = await this.popoverModalService.showModal({
      component: SampleSubmitModelComponent,
      showBackdrop: false,
      componentProps: {
        'data': obj
      },
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then(async(result) => {
      if(result?.role && result?.role == 'close' || result?.role == 'submit'){
        this.router.navigate(['/home']);
      };
    });
  }
  async goToCollectioncenter(collectionCenter?:any): Promise<void> {
    const modal = await this.popoverModalService.showModal({
      component: CollectionCentreModelComponent,
      showBackdrop: false,
      componentProps: {
        'data': collectionCenter
      },
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then(async(result:any) => {      
      const fieldName = {
        "field" : "collection_center_list"
      }
      this.apiService.ResetStaticData(fieldName);

      this.unsubscribeStaticData();
      if(result?.role == 'submit' && result?.data?.data && result?.data?.data?.latitude){
        this.openGmapViewModal(result?.data?.data);
      }
    });
  }

  async openGmapViewModal(data){
    let additionaldata : any = {
      'barcodeCenter':data,
      'destinationAddress' : {
        'geometry': {
          'location': {
            'lat': data?.latitude,
            'lng': data?.longitude
          }
        },
        'formatted_address': data?.collectionCenterName
      },
      'currentLatLng':{
        'lat':this.userCurrentLocation.latitude,
        'lng':this.userCurrentLocation.longitude
      },
      'collectionName':'sample_collection',
      'customEntryForBarcode' : true
    }
    const modal = await this.modalController.create({
      component: GmapViewComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        "additionalData": additionaldata,
      },
      id: data._id,
      showBackdrop:true,
      backdropDismiss:false,
      initialBreakpoint : 1,
      breakpoints : [0.75, 1],
      backdropBreakpoint : 0.75,
      handleBehavior:'cycle'
    });
    modal.present();
    modal.componentProps.modal = modal;
    modal.onDidDismiss().then(async (result:any) => {
      if(result?.data && result.role == "submit"){
        this.goToSampleSubmit(result?.data);
      }
    });
  }
  
  public async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ multiple: false });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    const formats = this.formGroup.get('formats')?.value || [];
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path,
      formats,
    });
    this.barcodes = barcodes;
    let alertType = "GPS";
    let alertHeader:string = 'Barcode result';
    let message:string;
    if(this.barcodes.length==0){
        message = `Please select Correct Image`;
      }
      else{
       message= `your Barcode value is ${barcodes[0].displayValue}`;
      }
      const alert = await this.alertController.create({
        cssClass: 'my-gps-class',
        header: alertHeader,
        message: message,
        buttons: [
          {
            text: 'CLOSE',
            role: 'confirmed',
            handler: () => {
              console.log(alertType.toUpperCase() + " alert action : ", "Confirmed");
            },
          },
        ],
      })
      await alert.present();
    console.log(barcodes);
  }
  async prepareQrCodeData(barCode:any){
    const isGpsEnable = await this.app_googleService.checkGeolocationPermission();
    let currentposition:any = {};
    if(isGpsEnable){
      let userLocationAccess:boolean = await this.requestLocationPermission();
      if(userLocationAccess){
        currentposition = await this.app_googleService.getAddressFromLatLong(this.currentLatLng.lat,this.currentLatLng.lng);
      }
    }else{      
      await this.gpsEnableAlert('trackingAlert').then(async (confirm:any) => {
        if(this.gpsAlertResult && this.gpsAlertResult.role == "confirmed" && this.currentLatLng && this.currentLatLng.lat){ 
          this.notificationService.presentToastOnBottom("Getting your location, please wait..");          
          this.prepareQrCodeData(barCode,);
        }else{
          this.notificationService.presentToastOnBottom("Please enable GPS to serve you better !");
        }
      }).catch(error => {
        this.notificationService.presentToastOnBottom("Please enable GPS to serve you better !");
      })
    }
    if(!currentposition && !currentposition.lat ) return ;
    let data = {};
    let currentpositionDetails = currentposition['0'];
    let locationData = {
      'latitude' : this.currentLatLng.lat,
      'longitude' : this.currentLatLng.lng,
    }
    data['employee'] = this.storageService.GetUserReference();
    data['customer'] = barCode.displayValue;
    data['scannedLocation'] = locationData;
    data['currentDate'] = JSON.parse(JSON.stringify(new Date()));
    data['barCodeDetail'] = {
      "barcodeFormat": barCode.format,
      "barcodeValueType": barCode.valueType,
    };
    this.barcodes = [data];
    data['log'] = this.storageService.getUserLog();
    if(!data['refCode'] || data['refCode'] == '' || data['refCode'] == null){
      data['refCode'] = this.storageService.getRefCode();
    }
    if(!data['appId'] || data['appId'] == '' || data['appId'] == null){
      data['appId'] = this.storageService.getAppId();              
    }
    if(!this.coreFunctionService.isNotBlank(data['platForm'])){
      data['platForm'] = Capacitor.getPlatform().toUpperCase();              
    }
    const saveFromData = {
      'curTemp': this.collectionname,
      'data': data
    }
    this.saveQRcodeData(saveFromData);
  }
  saveQRcodeData(saveFromData){  
    // this.popoverModalService.
    this.apiService.SaveFormData(saveFromData);
  }
  async openSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }
  async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }
  async presentsettingAlert(): Promise<void> {
    let openSetting:any = await this.notificationService.confirmAlert('Permission denied','Please grant camera permission to use the barcode scanner. And try again.');
    if(openSetting == "confirm"){
      this.openSettings();
    }
  }
  onlySuccessAlert(responseData?:any){
    let successData = responseData;
    let alertMsg = '';
    if(this.collectionname == "daily_scan_visit"){
      if( successData && successData.customer){
        if(typeof successData.customer == "object"){
          alertMsg += `${successData.customer.name}` + ' scanned successfully !';
        }else{
          alertMsg += `${successData.customer}` + ' scanned successfully !';
        }
      }
    }else{      
      if( successData && successData.name){
        if(typeof successData.name == "object"){
          alertMsg += `${successData.name.name}` + 'added successfully !';
        }else{
          alertMsg += `${successData.name}` + 'added successfully !';
        }
      }
    }
    let alertOpt = {
      'header': "Success",
      'message':alertMsg,
      'buttons' : [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    }
    // this.popoverModalService.showAlert(alertOpt);
    this.notificationService.presentToastOnMiddle(alertMsg,"success");
    this.unsubscribedSavecall();
  }
  /*-------BarCode Functions End--------------*/

  
  /*-------Custom Functions for Demo scanner Start --------------*/

  getCollectionCenterList(){
    this.subscribeStaticData();
    this.getCollectionCentre = true;
    const api = "GET_NEARBY_GEO_LOCATION"
    const params = "QTMP:"+api;
    // const criteria = ["_id;eq;" + childrGridId + ";STATIC"];
    // let payload = {
    //   'data':data,
    //   'path':null
    // }
    let userObj = {};
    if(this.userCurrentLocation?.latitude != 0 && this.userCurrentLocation?.longitude !=0){
      userObj = {
        'userCurrentLocation' : this.userCurrentLocation
      }
    }
    const staticModalGroup = [];
    if(userObj)
    staticModalGroup.push(this.apiCallService.getPaylodWithCriteria(params, '', [], userObj));
    this.apiService.getStatiData(staticModalGroup);
  }
  subscribeStaticData(){
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    });
  }

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
      })
      if(this.staticData?.['collection_center_list']){
        this.getCollectionCentre = false;
        this.goToCollectioncenter(this.staticData);
      }
    }
  }
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
  async getCoordinatesOnBrowser(){
    const successCallback = (position) => {
      let latLng = position.coords;
      if(latLng && latLng['latitude'] && latLng['longitude']){ 
        const latitude= latLng['latitude'];
        const longitude = latLng['longitude'];
        this.userCurrentLocation.latitude = latitude;
        this.userCurrentLocation.longitude = longitude;
        // this.center = {
        //   lat:latLng.latitude,
        //   lng:latLng.longitude
        // }
        this.getCollectionCenterList();
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
        const latitude = currentLatLng.lat ? currentLatLng.lat : currentLatLng.latitude;
        const longitude = currentLatLng.lng ? currentLatLng.lng : currentLatLng.longitude;
        this.userCurrentLocation.latitude = latitude;
        this.userCurrentLocation.longitude = longitude;
        // this.center ={
        //   'lat':this.latitude,
        //   'lng':this.longitude
        // }
        this.getCollectionCenterList();
      }else{
        console.log("Error while getting Location")
      }
    }else{
      await this.getCoordinatesOnBrowser();
    }
    // this.zoom = 17;
  }

  
  /*-------Custom Functions for Demo scanner End --------------*/
  
  /* --------Let this below 2 functions at the end of this file--------------------------------- */
  async getGeocodeAddress(LatLng:any) {
    this.geocoder = new google.maps.Geocoder();
    // const latlngStr = ;
    const latlng = {
      lat: parseFloat(LatLng.lat),
      lng: parseFloat(LatLng.lng),
    };
  
    this.geocoder.geocode({ location: latlng }).then((response) => {
        if (response.results[0]) {
          console.log(response.results[0])
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  }

  convertBlobToBase64 = (blob :Blob)=>new Promise ((resolve,reject) =>{
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () =>{
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
  

}