import { IonLoaderService } from './../../../../service/ion-loader.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { App_googleService, NotificationService, AppStorageService, AppPermissionService, LoaderService } from '@core/ionic-core';
import { DataShareService,ApiCallService,ApiService } from '@core/web-core';
import { AlertController, isPlatform } from '@ionic/angular';
import { element } from 'protractor';
import { Subscription } from 'rxjs';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';

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
  selectedCenter:any={};
  staticData:any={};
  sampleFormDate:any=[{name:"F012",checked:false},{name:"F015",checked:false},{name:"F066",checked:false}];
  staticDataSubscriber:Subscription;  
  saveResponceSubscription:Subscription;
  userCurrentLocation = {
    'latitude' : 0,
    'longitude' : 0
  }  
  gpsAlertResult:any;
  scannedDataList:any = [];
  selectedItems: any = [];
  submitBtnText:string='Submit';
  submitLoader:boolean=false;


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
    private formBuilder: FormBuilder,
    private dataShareServiceService: DataShareServiceService,
    private loaderService: LoaderService
  ) {
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    });
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    });

   }

   ionViewwillLeave(){

   }
   ionViewDidLeave(){

   }

  ngOnInit() {
    this.data;
    this.initForm();
    this.onload();
    // this.getScannedData();
  }

  ngOnDestroy(){
    this.unsubscribe()
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
      if(this.selectedCenter != undefined) this.centerPresent = true;
    }
  }
  // async getScannedData(){
  //   this.scannedDataList = await this.appStorageService.getObject('scannedData');
  //   console.log(this.scannedDataList)
  // }
  getSelectedCenterFromList(){
    if(this.selectedCenter && this.staticData['collection_center_list'].length > 0){
      const staticData = this.staticData['collection_center_list']
      staticData.forEach(element => {
        if(element?._id == this.selectedCenter?._id){

        }
      });
    }
  }
  public async closeModal(value?: any,role?:string): Promise<void> {
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
        'dismissed': true,
        'data':value
      },role);
    }else{        
      this.popoverModalService.dismissModal({
        'data': value,
      },role);
    }
  }

  setValue(arg0: string,arg1: any,arg2: boolean) {
    throw new Error('Method not implemented.');
  }
  compareWith(o1, o2) {
    return o1 && o2 ? o1?._id === o2?._id : o1 === o2;
  }

  handleChange(ev) {
    this.selectedCenter = ev.target.value;
  }

  inputOnChangeFunc(event:any,item:any,index:number) {
    if(item){
      if(item?.checked){
        this.scannedDataList[index] = item;
      }else{
        delete item.checked;
        this.scannedDataList[index] = item;
      }
    }
  }

  selectAll(e:any){
    console.log(e);
    this.scannedDataList.forEach((element)=>{
      element.checked=!e?.target?.checked
    });
  }

  submit(){
    if(this.selectedCenter == undefined){
      return this.notificationService.presentToastOnBottom("Please select collection centre","danger");
    }
    const collectionCenter:any = {
      '_id' : this.selectedCenter?._id,
      'name' : this.selectedCenter?.name
    }
    const checkedSamples = this.scannedDataList.filter(sample => sample.checked);
    checkedSamples.forEach(item => {
      item['status'] = "SUBMIT";
      item['collectionCenter'] = collectionCenter;
      delete item.checked
    });

    if(checkedSamples?.length == 0){
      return this.notificationService.presentToastOnBottom("Please select sample to submit.","danger");
    }else if(checkedSamples?.length == this.scannedDataList.length){      
      this.dataShareServiceService.removeKeyFromStorage('scannedData');
    }else{
      if(checkedSamples?.length < this.scannedDataList.length){
        let newList:any = [] = this.scannedDataList;
        for (let x = 0; x < newList.length; x++) {
          const notSelectedElement = newList[x];
          for (let y = 0; y < checkedSamples.length; y++) {
            const selectedElement = checkedSamples[y];
            if(notSelectedElement['_id'] == selectedElement['_id']){
              newList.splice(x,1);
            }          
          }        
        }
        this.appStorageService.setObject('scannedData',newList);
      }
    }
    if(checkedSamples?.length > 0 ){
      this.selectedItems = checkedSamples;
      this.submitBtnText = "Please wait..";
      this.submitLoader = true;
      const openLoader = async () =>{
        this.loaderService.showLoader("Please wait...","crescent"); 
      }
      setTimeout(() => {   
        this.checkLoader();
      }, 60000); 
    }

    this.saveSelectedData(this.selectedItems[0]);

  }
  saveSelectedData(data:any){
    let payload = {
      'data': data,
      'curTemp' : this.dataShareServiceService.getCollectionName()
    }
    this.apiService.SaveFormData(payload);
    // let saveFromDataRsponce = {
    //   'success' : 'success'
    // }
    // this.setSaveResponce(saveFromDataRsponce);
  }
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '') {
        if (saveFromDataRsponce.success == 'success') {
          if(this.selectedItems?.length == 1){
            const check = async () =>{
              this.checkLoader();
            }
            this.submitBtnText='Submit';
            this.submitLoader=false;
            this.notificationService.showAlert("Sample Submited successfuly !","Success",['Dismiss']);
            this.closeModal('','submit');
          }else{
            this.selectedItems.splice(0,1);
            setTimeout(() => {   
              this.saveSelectedData(this.selectedItems[0]);
            }, 500);
          }
        }
      }
      this.apiService.ResetSaveResponce();
    }
  }
  async checkLoader() {
    new Promise(async (resolve)=>{
      let checkLoader = await this.loaderService.loadingCtrl.getTop();
      if(checkLoader && checkLoader['hasController']){
        this.loaderService.hideLoader();
      }
    });
  }
  async checkAlert() {
    new Promise(async (resolve)=>{
      let checkAlert = await this.alertController.getTop();
      if(checkAlert && checkAlert['hasController']){
        this.alertController.dismiss();
      }
    });
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
  unsubscribe(){
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
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
