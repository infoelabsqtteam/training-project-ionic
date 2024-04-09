import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanningComponent } from '../modal/barcode-scanning/barcode-scanning.component';
import { Subject, Subscription } from 'rxjs';
import { ApiCallService, ApiService, CommonFunctionService, CoreFunctionService, DataShareService, StorageService } from '@core/web-core';
import { AppPermissionService, AppStorageService, App_googleService, NotificationService } from '@core/ionic-core';
import { ActionSheetController, AlertController, IonModal, ModalController, Platform, isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';
import { OverlayEventDetail } from '@ionic/core/components';
import { DataModalComponent } from './data-modal/data-modal.component';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { CustomStaticFormComponent } from './custom-static-form/custom-static-form.component';

@Component({
  selector: 'my-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class MyScannerComponent implements OnInit {

  // ------IonMOdal-------------------------
  
  @ViewChild(IonModal) modal: IonModal;

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;
  isModalOpen = false;
  /* --------BarCode Scanning Variables------------------------------------------- */
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new FormGroup({
    formats: new FormControl([]),
    lensFacing: new FormControl(LensFacing.Back),
    // googleBarcodeScannerModuleInstallState: new FormControl(0),
    // googleBarcodeScannerModuleInstallProgress: new FormControl(0),
  });
  public barcodes = [];
  public isBarCodeScannerSupported = false;
  public isBarCodeCameraPermissionGranted = false;
  public barCodeFormats = [
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
  scannedData:any;
  /* --------BarCode Scanning Variables End------------------------------------------- */

  gpsAlertResult:any;
  updateMode:boolean = false;
  currentLatLng:any;
  userLocation:any;
  saveResponceSubscription:Subscription;
  collectionname:any;
  gridRealTimeDataSubscription:Subscription;
  ConfirmScannedResult: string;
  banner_img:any = [
    'assets/img/home/banner1.jpg',
    'assets/img/home/banner2.jpg',
    'assets/img/home/banner3.jpg',
    'assets/img/home/banner4.jpg'
  ];
  userType:string = 'customer';
  selectedTab:String;
  isExitAlertOpen:boolean = false;
  gridDataSubscription:Subscription;
  appCardMasterDataSize:number = 200;
  cardList: any = [];
  errorTitle:String = '';
  errorMessage:String = '';
  headerTitle:String = '';

  constructor(
    private popoverModalService: PopoverModalService,
    private readonly ngZone: NgZone,
    private dataShareService:DataShareService,
    private apiService: ApiService,
    private app_googleService: App_googleService,
    private appPermissionService: AppPermissionService,
    private notificationService: NotificationService,
    private alertController: AlertController,
    private storageService: StorageService,
    private coreFunctionService: CoreFunctionService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private commonFunctionService: CommonFunctionService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private _location: Location,
    private appStorageService: AppStorageService,
    private apiCallService: ApiCallService
  ) { 
    this.initializeApp();    
    this.appCardMasterDataSize = this.appStorageService.getAppCardMasterDataSize();
    this.checkCameraPermissionToSacn();
    this.gridRealTimeDataSubscription = this.dataShareService.gridRunningData.subscribe(data =>{
      this.updateRunningData(data.data);
    });

    this.gridDataSubscription = this.dataShareService.gridData.subscribe((data:any) =>{
      if(data && data.data && data.data.length > 0){
        this.cardList = data.data;
        // this.commonAppDataShareService.setModuleList(this.cardMasterList);
        // this.cardList = this.menuOrModuleCommonService.getUserAutherisedCards(this.cardMasterList);
      }else{
        this.cardList = [];
        if(this.userType == 'employee'){
          this.errorTitle = "No Daily Visits Found !";
          this.errorMessage = "Please Scan QR to View Visits.";
        }else{
          if(this.userType == 'customer' && this.collectionname == 'customer_complaint'){
            this.errorTitle = "No Complaints Found !";
            this.errorMessage = "There are no complaints available at the moment. Please raise !";            
          }else{
            this.errorTitle = "No Requestes Found !";
            this.errorMessage = "There are no requestes available at the moment. Please raise !";
          }
        }
      }
    });
  }
  initializeApp() {
    this.platform.ready().then(() => {});

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if(this.isExitAlertOpen){
        this.notificationService.presentToastOnBottom("Please Click On the exit button to exit the app.");
      }else{
        if(this._location.isCurrentPathEqualTo('/scanner')){
          this.showExitConfirm();
          // processNextHandler();
        }
      }
    });
  }

  ionViewDidEnter(){
    this.onLoad();
  }
  ionViewDidLeave(){
    this.unsubscribeVariable();
  }
  
  ngOnInit() {
    // this.onLoad();
  }
  onLoad(){
    let user = this.storageService.GetUserInfo();
    this.selectedTab = 'tab1';
    if(user && user.type != ''){
      this.userType = user.type;
      if(this.userType == 'employee'){
        this.headerTitle = "Scanner";
        this.collectionname = "daily_scan_visit";
        this.checkBarcodeScannerSupportedorNot();
        this.isModalOpen = false;
        this.checkCameraPermissionToSacn();        
      }else{
        if(this.userType == 'customer'){
          if(this.selectedTab == 'tab1'){
            this.headerTitle = 'Complaint Service';
            this.collectionname = 'customer_complaint';
          }else{
            this.collectionname = 'customer_requests';
            this.headerTitle = 'Request Service';
          }
        }
      }
      if(this.collectionname != '') this.getGridData();
    }else{
      console.log("UserType Not defined !");
    }
  }
  ngOnDestroy(){    
    if(this.gridRealTimeDataSubscription){
      this.gridRealTimeDataSubscription.unsubscribe();
    }
    this.unsubscribeVariable();
  }

  unsubscribeVariable(){
    if (this.gridDataSubscription) {
      this.gridDataSubscription.unsubscribe();
    }
    this.resetVariables();
  }
  resetVariables(){
    this.cardList = [];
    this.collectionname = '';
    this.userType = '';
    this.isModalOpen = false;
  }
  saveCallSubscribe(){
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    })
  }
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '') {
        if (saveFromDataRsponce.success == 'success' && !this.updateMode) {
          let card:any;
          let criteria:any = [];
          // if(this.card && this.card.card){
          //   card = this.card.card;
          // }
          // if(card && card.api_params_criteria && card.api_params_criteria.length > 0){
          //   card.api_params_criteria.forEach(element => {
          //     criteria.push(element);
          //   });
          // }
            this.getGridData();
            this.onlySuccessAlert(saveFromDataRsponce.data);
          // this.setCardDetails(this.card.card);
        }
        // else if (saveFromDataRsponce.success == 'success' && this.updateMode) {
        //   this.carddata[this.editedRowIndex] == saveFromDataRsponce.data;
        //   if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
        //     this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
        //   }
        // }
      }
      this.apiService.ResetSaveResponce();
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
  unsubscribeSavecall(){    
    if(this.saveResponceSubscription){
      this.saveResponceSubscription.unsubscribe();
    }
  }
  goBack(){
      this.router.navigateByUrl('home');
      this.resetVariables();
  } 

  /*----BarCode Functions------------------------------------------------------------------------- */
  checkBarcodeScannerSupportedorNot(){
    BarcodeScanner.isSupported().then((result) => {
      this.isBarCodeScannerSupported = result.supported;
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
  checkCameraPermissionToSacn(){
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
          if(result.camera === 'denied'){
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
    modal.onDidDismiss().then((result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.getScannedDataById(barcode);
      }
    });
  }
  getScannedDataById(scannedData){
    this.scannedData = scannedData;
    let scannedId = '';
    scannedData.displayValue = JSON.parse(scannedData.displayValue);
    if(scannedData.displayValue['_id'] != ''){
      scannedId = scannedData.displayValue['_id'];
    }
    let user = this.storageService.GetUserInfo();
    let currentMenu = {
      'name' : 'user'
    }
    this.apiCallService.getRealTimeGridData(currentMenu, scannedData.displayValue);
  }
  updateRunningData(data){
    this.openDataModal(data)
    // this.presentConfirmationActionSheet(data).then((result:any) => {
    //   if (this.ConfirmScannedResult === "confirm") {
    //     this.saveCallSubscribe();
    //     // barcode.displayValue = JSON.parse(barcode.displayValue);
    //     // barcode.rawValue = JSON.parse(barcode.rawValue);
    //     // this.prepareQrCodeData(barcode);
    //   }else{
    //     this.startScan();
    //   }
    // })
  }
  async openDataModal(dbData:any) {
    let dataWithId = dbData['0'];
    const modal = await this.modalCtrl.create({
      component: DataModalComponent,
      cssClass: 'my-data-modal-css',
      componentProps: { 
        "data": dbData,
      },
      id: dataWithId._id,
      showBackdrop:true,
      backdropDismiss:false,
      initialBreakpoint : 0.75,
      breakpoints : [0.75, 1],
      backdropBreakpoint : 0.75
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.saveCallSubscribe();
      this.prepareQrCodeData(data);
    }else{
      if(role === 'newScan'){
        this.startScan();
      }else{
        console.log("Data Modal Dismissed with cancel")
      }
    }
  }
  async presentConfirmationActionSheet(data?:any) {
    let objectData:any;
    if(data && data.length > 0){
      objectData = data[0];
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: objectData?.name,
      subHeader: objectData?.email,
      buttons: [
        {
          text: 'New Scan',
          role: 'newScan',
          icon: 'scan',
          data: {
            action: 'newScan',
          },
        },
        {
          text: 'Confirmed',
          role: 'confirm',
          icon: 'checkmark-done-outline',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
    await actionSheet.onDidDismiss().then(data => {
        this.ConfirmScannedResult = data.role;
    });
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
    data['customer'] = this.scannedData.displayValue;
    data['scannedLocation'] = locationData;
    data['currentDate'] = JSON.parse(JSON.stringify(new Date()));
    data['barCodeDetail'] = {
      "barcodeFormat": this.scannedData.format,
      "barcodeValueType": this.scannedData.valueType,
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
    let user = this.storageService.GetUserInfo();
    // if(user && user.type == "employee"){
    //   this.collectionname = "daily_scan_visit";
    // }else{
    //   this.collectionname = "daily_scan_visit";
    // }
    const saveFromData = {
      'curTemp': this.collectionname,
      'data': data
    }

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
          alertMsg += 'Data scanned successfully !';
        }
      }
    }else{
      if(this.collectionname == 'customer_complaint'){
        alertMsg += 'Complaint raised successfully !';
      }else{
        alertMsg += 'Request raised successfully !';
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
    this.popoverModalService.showAlert(alertOpt);
    // this.notificationService.presentToastOnMiddle(alertMsg,"success");
    this.unsubscribeSavecall();
  }
  /*-------BarCode Functions End--------------*/
  // merging both scenerios
  segmentChanged(ev: any) {
    this.selectedTab = ev.target.value;
    if(this.userType == 'customer'){
      if(this.selectedTab == 'tab1'){
        this.headerTitle = 'Complaint Service';
        this.collectionname = 'customer_complaint';
      }else{
        this.collectionname = 'customer_requests';
        this.headerTitle = 'Request Service';
      }
    }else{
      if(this.selectedTab == 'tab1'){
        this.headerTitle = 'Scanner';
        this.collectionname = '';
      }else if(this.selectedTab == 'tab2'){
        this.headerTitle = 'Daily Visits';
        this.collectionname = 'daily_scan_visit';
      }
    }
    if(this.collectionname != '') this.getGridData();
  }
  getGridData(criteria?){
    let criteriaList = [];
    if(criteria){
      criteriaList = criteria;
    }
    // const params = 'card_master';
    let data = this.apiCallService.getPaylodWithCriteria(this.collectionname,'',criteria,{});
    data['pageNo'] = 0;
    data['pageSize'] = this.appCardMasterDataSize;
    let payload = {
      'data':data,
      'path':null
    }
    this.apiService.getGridData(payload);
  }

  showExitConfirm() {
    this.isExitAlertOpen = true;
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
          this.isExitAlertOpen = false;
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        cssClass: 'danger',
        handler: () => {
          this.isExitAlertOpen = false;
          App.exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }

  // Pull from Top to Do refreshing or update card list 
  doRefresh(event:any) {
    console.log('Begin doRefresh async operation');
    setTimeout(() => {
      event.target.complete();
      this.getGridData();
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }

  async addNewForm(item?:any){
    let ndata = {
      "userType":this.userType,
      "collectionName": this.collectionname,
    };
    const modal = await this.modalCtrl.create({
      component: CustomStaticFormComponent,
      cssClass: 'my-data-modal-css',
      componentProps: { 
        "data": ndata,
      },
      showBackdrop:true,
      backdropDismiss:false,
      // initialBreakpoint : 1,
      // breakpoints : [0.75, 1],
      // backdropBreakpoint : 0.75
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.saveCallSubscribe();
      this.prepareSaveData(data);
    }
    
  }
  prepareSaveData(data: any){
    if(this.collectionname == 'customer_requests' || this.collectionname == 'customer_complaint'){
      data['customer'] = this.storageService.GetUserReference();
    }else{

    }
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

    this.apiService.SaveFormData(saveFromData);
  }

}
