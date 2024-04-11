import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { App_googleService, NotificationService, AppStorageService, AppPermissionService } from '@core/ionic-core';
import { DataShareService,ApiCallService,ApiService } from '@core/web-core';
import { AlertController, isPlatform } from '@ionic/angular';
import { element } from 'protractor';
import { Subscription } from 'rxjs';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';

@Component({
  selector: 'app-sample-submit-model',
  templateUrl: './sample-submit-model.component.html',
  styleUrls: ['./sample-submit-model.component.scss'],
})
export class SampleSubmitModelComponent implements OnInit, OnDestroy {


  @Input()
  public modal:any;
  @Input()
  private data:any;

  submitForm: UntypedFormGroup;
  centerPresent:boolean = false;
  selectedCenter:any;
  staticData:any={};
  sampleFormDate:any=[{name:"F012",checked:false},{name:"F015",checked:false},{name:"F066",checked:false}];
  staticDataSubscriber:Subscription;  
  userCurrentLocation = {
    'latitude' : 0,
    'longitude' : 0
  }  
  gpsAlertResult:any;
  scannedDataList:any = [];
  selectedItems: any = [];


  constructor(
    private readonly popoverModalService: PopoverModalService,
    private alertController:AlertController,
    private apiService:ApiService,
    private apiCallService:ApiCallService,
    private dataShareService:DataShareService,
    private app_googleService: App_googleService,
    private notificationService: NotificationService,
    private appStorageService: AppStorageService,
    private appPermissionService: AppPermissionService,
    private formBuilder: FormBuilder
  ) {
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    });
    
   }

  ngOnInit() {
    this.initForm();
    this.onload();
    console.log(this.data)
    // this.getScannedData();
  }

  ngOnDestroy(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
  }

  initForm(){
    // this.submitForm = this.formBuilder.group({
    //   collectionCenter: ['', [Validators.required]],
    //   sampleList: ['', [Validators.required]],
    // });
  }
  async onload(){
    await this.checkPermissionandRequest();
    if(this.data){
      this.selectedCenter = this.data?.selectedCollectionCenter;
      this.scannedDataList = this.data?.scannedData;
    }
    // this.staticData.collection_centre=[{"name": "Delhi"},
    //   {
    //     "name": "Nagpur",
    //   },
    //   {
    //     "name": "Lucknow",
    //   },
    //   {
    //     "name": "Noida",
    //   },
    //   {
    //     "name": "Punjab",
    //   }
    // ]
  }
  // async getScannedData(){
  //   this.scannedDataList = await this.appStorageService.getObject('scannedData');
  //   console.log(this.scannedDataList)
  // }
  getSelectedCenterFromList(){
    if(this.selectedCenter && this.staticData['collection_center_list'].length > 0){

    }
  }
  public async closeModal(value?: any): Promise<void> {
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({'dismissed': true},value);
    }else{        
      this.popoverModalService.dismissModal({
        value: value,
      });
    }
  }

  setValue(arg0: string,arg1: any,arg2: boolean) {
    throw new Error('Method not implemented.');
  }

  inputOnChangeFunc(parent,field) {
    if(parent && parent != '' && parent.field_name && parent.field_name != ""){
      field['parent'] = parent.field_name;
    }
    if(field){

    }
  }

  selectAll(e:any){
    console.log(e);
    this.scannedDataList.forEach((element)=>{
      element.checked=!e?.target?.checked
    });
  }

  submit(){
    console.log(this.sampleFormDate);
  }
  // Dependency functions
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
    }
  }
  getCollectionCenterList(){
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
    }else{
      this.checkPermissionandRequest();
    }
    const staticModalGroup = [];
    if(userObj)
    staticModalGroup.push(this.apiCallService.getPaylodWithCriteria(params, '', [], userObj));
    this.apiService.getStatiData(staticModalGroup);
  }

  // End Dependency Functions 

  // Handle Enable Location functions on both platform
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
          const userLocation = await this.app_googleService.getUserLocation();
          if(userLocation !=null && (userLocation.lat !=null || userLocation.latitude !=null)){
            this.userCurrentLocation ={
              'latitude':userLocation.lat ? userLocation.lat : userLocation.latitude,
              'longitude':userLocation.lng ? userLocation.lng : userLocation.longitude
            }
            // let currentlatlngdetails:any = await this.app_googleService.getAddressFromLatLong(this.currentLatLng.lat,this.currentLatLng.lng);
            return true;
          }
        }else{
          this.userCurrentLocation = {
            'latitude': 0,
            'longitude': 0
          }
        }
      }
    }else{ 
      await this.getCurrentPosition();
    }    
  }
  async getCurrentPosition(){
    if(navigator?.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = position;
        this.userCurrentLocation = {
          'latitude': position.coords.latitude,
          'longitude': position.coords.longitude,
        };
        return true;
      });
    }else{
      this.notificationService.presentToastOnBottom("Browser doesn't support Geolocation.");
      this.userCurrentLocation = {
        'latitude': 0,
        'longitude': 0
      }
    }
  }
  // End Location functions

}
