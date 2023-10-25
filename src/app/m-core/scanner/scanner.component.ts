import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanningComponent } from '../modal/barcode-scanning/barcode-scanning.component';
import { Subject, Subscription } from 'rxjs';
import { ApiService, CommonFunctionService, CoreFunctionService, DataShareService, StorageService } from '@core/web-core';
import { AppPermissionService, App_googleService, NotificationService } from '@core/ionic-core';
import { ActionSheetController, AlertController, IonModal, ModalController, isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';
import { OverlayEventDetail } from '@ionic/core/components';
import { DataModalComponent } from './data-modal/data-modal.component';

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
    private modalCtrl: ModalController
  ) { 
    this.gridRealTimeDataSubscription = this.dataShareService.gridRunningData.subscribe(data =>{
      this.updateRunningData(data.data);
    })
  }

  ngOnInit() {
    this.checkBarcodeScannerSupportedorNot();
    this.isModalOpen = false;
    this.checkCameraPermissionToSacn();
  }
  ngOnDestroy(){    
    if(this.gridRealTimeDataSubscription){
      this.gridRealTimeDataSubscription.unsubscribe();
    }
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
            // this.getGridData(this.collectionname,);
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
  unsubscribedSavecall(){    
    if(this.saveResponceSubscription){
      this.saveResponceSubscription.unsubscribe();
    }
  }
  goBack(){
      this.router.navigateByUrl('home');
      // this.resetVariables();
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
    this.commonFunctionService.getRealTimeGridData(currentMenu, scannedData.displayValue);
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
    if(user && user.type == "customer"){
      this.collectionname = "daily_scan_visit";
    }else{
      this.collectionname = "daily_scan_visit";
    }
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

}
