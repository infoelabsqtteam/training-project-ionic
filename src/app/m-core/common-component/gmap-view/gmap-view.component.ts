import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { App_googleService, AppDataShareService, EnvService, NotificationService, PermissionService, CoreUtilityService, RestService, StorageService, AppApiService } from '@core/ionic-core';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { GoogleMap, MapType } from '@capacitor/google-maps';
import { map } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { ApiService, DataShareService } from '@core/web-core';

@Component({
  selector: 'app-gmap-view',
  templateUrl: './gmap-view.component.html',
  styleUrls: ['./gmap-view.component.scss'],
})
export class GmapViewComponent implements OnInit {

  @ViewChild('map') mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap;

  @Input() selectedRowData:any ={};
  @Input() selectedRowIndex:number;
  @Output() mapOutPutData = new EventEmitter();
  @Input() additionalData:any = {};
  @Input() modal: any;
  SelectedItemName:string="";

  locationSubscription:any;
  isGpsEnable : boolean;
  coordinate: any;
  isTracking:boolean = false;
  locationTraces = [];
  watchCoordinate: any;
  watchId:any = '';
  canUseGPS:boolean=false;
  positionOptions:any = {
    enableHighAccuracy:false,
    timeout: 30000,
  
  }
  center:any = {
    lat: 28.5846658,
    lng: 77.3146088,
  }
  destinationLocationMarkerId: any;
  destinationLocationData:any={};
  currentLocationMarkerId:any
  
  // for saving data variables
  zoom:number = 12;
  lat = 41.85;
  lng = -87.65;
  elements:any=[];
  staticData: any = {};
  copyStaticData:any={};
  // waypoints:any = [
  //    {location: { lat: 39.0921167, lng: -94.8559005 }},
  //    {location: { lat: 41.8339037, lng: -87.8720468 }}
  // ];
  waypoints:any=[];
  gridDataSubscription;
  staticDataSubscription;

  //javascript GoogleMaps Variables
  googleMaps:any;
  map:any;
  mapClickListener:any;
  markerClickListener:any;
  markers:any=[];
  currentLatLng:any = {};
  destinationLatLng:any = {};
  directionsService:any;
  directionsDisplay:any;
  directionsData:any={}; 
  currentPostionIconUrl:any = '../../../../assets/img/icons/current-location-1.png';
  destinationPostionIconUrl:any = '../../../../assets/img/icons/destination-location-1.png';
  googleAddress:any;
  reachBtn:boolean = false;
  leftBtn:boolean = false;
  deliverBtn:boolean = false;
  reachBtnText:string = "";
  leftBtnText:string = "";
  reachBtnSpinner:boolean = false;
  leftBtnSpinner:boolean = false;


  constructor(
    private app_googleService : App_googleService,
    private notificationService: NotificationService,
    private alertCtrl: AlertController,
    private permissionService: PermissionService,
    private platform: Platform,
    private envService: EnvService,
    private dataShareService: DataShareService,
    private renderer: Renderer2,
    private actionSheetController: ActionSheetController,
    private restService: RestService,
    private apiService: ApiService,
    private ngZone: NgZone,
    private coreUtilityService: CoreUtilityService,
    private datePipe: DatePipe,
    private storageService: StorageService,
    private dataShareServiceService: DataShareServiceService,
    private appApiService: AppApiService,
    private appDataShareService: AppDataShareService
  ) {   
    this.currentPostionIconUrl = '../../../../assets/img/icons/current-location-1.png';
    this.destinationPostionIconUrl = '../../../../assets/img/icons/destination-location-1.png';
    this.isTracking = false;
    this.gridDataSubscription = this.appDataShareService.gridData.subscribe(data =>{
      this.setGridData(data);
    })
    this.staticDataSubscription = this.appDataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })

  }

  ngOnInit() {

  }

  ionViewDidEnter(){
    this.onload();
    this.checkPermissionandRequest();
  }
  ngonDestroy(){
    if(this.gridDataSubscription){
      this.gridDataSubscription.unsubscribe();
    }
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
  }

  async onload(){
    // this.googleMaps = JSON.parse(JSON.stringify(localStorage.getItem('JsGoogleMap')));
    if(this.selectedRowData){      
      this.collectionCustomFunction(this.selectedRowData);      
    }else{
      // this.notificationService.presentToastOnBottom("Something went wrong.");
    }
  }

  async collectionCustomFunction(selectedrowdata:any){
    let collectionName:any ='';
    if(this.additionalData && this.additionalData.collectionName){
      collectionName= this.additionalData.collectionName
    }
    switch (collectionName.toLowerCase()) {
      case "travel_tracking_master":
        this.isTracking = true;
        if(selectedrowdata.name){
          this.SelectedItemName = selectedrowdata.name;
        }
        if(selectedrowdata.leftDateTime ==null){
          this.leftBtn = false;
        }else{
          this.leftBtn = true;
        }        
        if(this.leftBtn){
          this.leftBtnText = "Delivered";
        }else{
          this.leftBtnText = "Left";
        }
        if(selectedrowdata.reachDateTime ==null){
          this.reachBtn = false;
        }else{
          this.reachBtn = true;
        }
        if(this.reachBtn){
          this.reachBtnText = "Reached";
        }else{
          this.reachBtnText = "Reach";
        }
        if(this.additionalData?.destinationAddress && this.additionalData?.destinationAddress?.formatted_address){
          this.destinationLocationData['heading'] = this.additionalData?.destinationAddress?.formatted_address;
        }else if(selectedrowdata && selectedrowdata.customerAddress){
          this.destinationLocationData['heading'] = selectedrowdata.customerAddress;
        }else{
          this.destinationLocationData['heading'] = "Destination Location";
        }
        if(this.additionalData && this.additionalData.currentLatLng && this.additionalData.currentLatLng.lat && this.additionalData?.destinationAddress && this.additionalData?.destinationAddress?.geometry.location){
          this.destinationLatLng = this.additionalData?.destinationAddress?.geometry.location;
          this.currentLatLng = this.additionalData.currentLatLng;
          this.loadMap();
        }
        // this.createMap(this.center);
        break;
      default: 
        // this.notificationService.presentToast("error ");
    }

      
  }

  async checkPermissionandRequest(){
    if (this.platform.is('hybrid')) {
      let permResult = await this.app_googleService.checkGPSPermission();
      if(!permResult){
        this.enableGPSandgetCoordinates();
      }
    }else{
      if (navigator.geolocation) {
        // const successCallback = (position) => {
        //   console.log(position);
        //   this.canUseGPS=true;
        // };      
        // const errorCallback = (error) => {
        //   console.log(error);
        //   this.canUseGPS=false;
        //   this.notificationService.presentToastOnBottom(error, "danger");
        // };
        // this.watchId = navigator.geolocation.watchPosition(successCallback, errorCallback,this.positionOptions);
        this.enableGPSandgetCoordinates(true);
        // this.watchPosition();

        // const watchPosition:any = this.app_googleService.watchPosition(this.positionOptions);
        // watchPosition.then((value) => {
        //   console.log(value);
        //   if(value && value['message']){
        //     this.notificationService.presentToastOnBottom(value['message'],"danger");
        //   }else{
        //   }
        // });
      } else { 
        this.notificationService.presentToastOnBottom("Geolocation is not supported by this browser.", "danger");
      }
    }
  }
  async requestPermissions() {
    const permResult = await this.permissionService.checkAppPermission("ACCESS_FINE_LOCATION");
    console.log('ACCESS_FINE_LOCATION: ', permResult);
    let geopermResult = await this.app_googleService.requestLocationPermission();
    console.log("geopermResult: ", geopermResult);
    if(permResult){
      if(this.platform.is('hybrid')) {
        this.gpsEnableAlert();
      }
      else { 
        this.enableGPSandgetCoordinates(true);
      }
    }else {
      const permResult = await this.permissionService.requestPermission("ACCESS_FINE_LOCATION");
      if (permResult) {
        if (this.platform.is('hybrid')) {
          this.gpsEnableAlert();
        }
        else { this.enableGPSandgetCoordinates(true); }
      }
      else {
        console.log("User denied location permission");
      }
    }
  }

  async gpsEnableAlert(){     
      const alert = await this.alertCtrl.create({
        cssClass: 'my-gps-class',
        header: 'Please Enable GPS !',
        message: 'ITC collects Your location data to serve you better service',
        buttons: [
          {
            text: 'No, thanks',
            role: 'cancel',
          },
          {
            text: 'OK',
            role: 'confirmed',
            handler: () => {
              this.enableGPSandgetCoordinates();
            },
          },
        ],
      });
  
    await alert.present();
  }

  async enableGPSandgetCoordinates(enableGPS?:any){
    if(this.platform.is('hybrid')){
      enableGPS = await this.app_googleService.checkGPSPermission();
      if(enableGPS){
        this.canUseGPS = true;
        this.positionOptions['enableHighAccuracy'] = enableGPS;   
      }else{
        this.canUseGPS = false;
        this.gpsEnableAlert();
      }
    }else{
      this.positionOptions['enableHighAccuracy'] = enableGPS;
      this.positionOptions['timeout'] = 10000;
    }
  }
 async watchPosition() {
    try {
        this.isTracking = true;
        this.watchId = await Geolocation.watchPosition(this.positionOptions, (position, err) => {
        // this.ngZone.run(() => {
          // if (err) { console.log('watchPosition error :', err); return; }
          this.canUseGPS = true;
          if(position!=null && position.coords){          
            this.watchCoordinate = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy:position.coords.accuracy,
              speed:position.coords.speed,
              altitude:position.coords.altitude,
              altitudeAccuracy:position.coords.altitudeAccuracy,
              heading:position.coords.heading,
              timestamp:position.timestamp
            };
            let latlng = {
              lat : this.watchCoordinate.latitude,
              lng : this.watchCoordinate.longitude
            }
            this.currentLatLng = latlng;
            this.waypoints.push(latlng);
            if(this.waypoints.length > 1){
            this.updateCurrentPositionMarker(latlng);
            }
          }
        // });
      });
    } catch (err) { 
      console.log('watcherror', err) 
    }
  }
  async updateCurrentPositionMarker(latlng){
    if (this.currentLocationMarkerId) {
      this.currentLocationMarkerId = new this.googleMaps.Marker({
        position: this.googleMaps.LatLng(latlng.lat, latlng.lng),
        map: this.map,
        title: 'Current Location'
      });
      this.currentLocationMarkerId.setMap(this.map);
    } else {
      console.log("Current Location MarkerId NOt Available");
      // this.currentLocationMarkerId.setPosition(new this.googleMaps.LatLng(latlng.lat, latlng.lng));
    }
  }

  async clearWatch() {
    if (this.watchId != null && this.watchId != undefined) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.resetVariables();
    }
  }
  resetVariables(){
    this.locationTraces=[];
    this.watchCoordinate={};
    this.isTracking=false;
    this.watchId = '';
    this.waypoints = [];
    this.destinationLocationMarkerId = '';
    this.currentLocationMarkerId = '';
  }
  async customButtonClick(buttonName?:any){
    const isGpsEnable = await this.app_googleService.checkGPSPermission();
    if(isGpsEnable){
      if(buttonName == "reach"){
        this.reachBtn = true;
        this.reachBtnSpinner = true;
      }else if(buttonName == "left"){
        this.leftBtn = true;
        this.leftBtnSpinner = true;
      }else if(buttonName == "deliver"){
        this.deliverBtn = true;
      }
      let currentposition:any = await this.app_googleService.getUserLocation();
      if(currentposition && currentposition.lat !=null && currentposition.lng !=null){
        let currentlatlng: any = {
          'latitude': currentposition.lat,
          'longitude': currentposition.lng,
        }
        if(buttonName == "reach"){
          this.selectedRowData['reachDateTime'] = JSON.parse(JSON.stringify(new Date()));
          this.selectedRowData['reachTime'] = await this.dataShareServiceService.getCurrentTime(new Date()); 
          this.selectedRowData['reachLocation'] = currentlatlng;
          this.selectedRowData['trackingStatus'] = "REACHED";
          this.reachBtn = false;
          this.reachBtnSpinner=false;
        }else if(buttonName == "left"){
          this.selectedRowData['leftDateTime'] = JSON.parse(JSON.stringify(new Date()));
          this.selectedRowData['leftTime'] = await this.dataShareServiceService.getCurrentTime(new Date()); 
          this.selectedRowData['leftLocation'] = currentlatlng;
          this.selectedRowData['trackingStatus'] = "DELIVERED";
          this.leftBtn = false;
          this.leftBtnSpinner = false;
          await this.clearWatch();
          this.dismissModal(this.selectedRowData,"delivered");
        }else if(buttonName == "deliver"){
          this.selectedRowData['deliverDateTime'] = JSON.parse(JSON.stringify(new Date()));
          this.selectedRowData['deliverLocation'] = currentlatlng;
        }
        
        this.collectionCustomFunction(this.selectedRowData);      
        this.saveData(this.selectedRowData);

      }else{
        if(!currentposition.gpsenable){
          if(buttonName == "reach"){
            this.reachBtn = false;
            this.reachBtnSpinner = false;
          }else if(buttonName == "left")
          this.leftBtn = false;
          this.leftBtnSpinner = false;
        }
        this.notificationService.presentToastOnBottom("Something went wrong, please try again.");
      }
    }

    // }else{
    //   this.getCall(this.selectedRowData);
    //   this.notificationService.presentToastOnBottom("Please wait for a while!, Something went wrong.");
    // }
  }
  dismissModal(data?:any,role?:any){
    if(data !=null){
      this.modal?.offsetParent.dismiss(data,role);      
    }else{
      this.modal?.offsetParent.dismiss(this.selectedRowData,)
    }
  }
  async saveData(selectedRowData){    
    let payload = {
      "curTemp" : this.additionalData.collectionName,
      "data":selectedRowData
    }
    this.apiService.SaveFormData(payload);
  }

  async editPackage(){
    this.mapOutPutData.emit(this.selectedRowIndex);
  }

  async postGPSPermission(canUseGPS: boolean) {
    if (canUseGPS) { this.watchPosition(); }
    else {
      this.notificationService.presentToastOnBottom("Please turn on GPS to get started.");
    }
  }

  // create Capacitor  map and add markers
  async createMap(data) {
    try{
      this.newMap = await GoogleMap.create({
        id: 'google-map'+"-"+this.selectedRowData.recordId,
        element: this.mapRef.nativeElement,
        apiKey: this.envService.getGoogleMapApiKey(),
        config: {
          center: data,
          zoom: 15,
        },
      });
      console.log("NewMap Created :",this.newMap);
      await this.addMarker(this.destinationLocationData);     
      await this.newMap.enableTrafficLayer(true);
      if(this.platform.is('hybrid')){
        await this.newMap.enableIndoorMaps(true);
        await this.newMap.setMapType(MapType.Satellite);
        await this.newMap.enableCurrentLocation(true); 
      }
      this.addListeners();
    }catch(e){
      console.log("createMap Error :", e);
    }
  }
  async addMarker(marker){
    if(this.destinationLocationMarkerId) this.removeMarker(this.destinationLocationMarkerId);
    this.destinationLocationMarkerId = await this.newMap.addMarker({
      coordinate: {
        lat: marker.latitude,
        lng: marker.longitude
      },
      title: marker.heading,
      snippet: marker.heading,
      draggable : false,
    })
    const CameraConfig:any = {
      coordinate: {
        lat: marker.latitude,
        lng: marker.longitude
      },
      zoom: 15
    }
    this.newMap.setCamera(CameraConfig);
  }
  async removeMarker(markerId?:any){
    await  this.newMap.removeMarker(markerId);
  }
  async addListeners(){
    await this.newMap.setOnMarkerClickListener((event) => {
      console.log("setOnMarkerClickListener :",event);
    })
    // await this.newMap.setOnMapClickListener((event) => {
    //   console.log("setOnMapClickListener :",event);
    //   this.addMarker(event);
    // })
    await this.newMap.setOnMyLocationButtonClickListener((event) => {
      console.log("setOnMyLocationButtonClickListener :",event);
      this.addMarker(event);
    })
    await this.newMap.setOnMyLocationClickListener((event) => {
      console.log("setOnMyLocationClickListener :",event);
      this.addMarker(event);
    })
    
  }
  
  async getCurrentLocation() {
    const enableGPS = await this.app_googleService.checkGPSPermission();
    if(enableGPS){
      if(this.platform.is("hybrid")){
        const currentLatLng = await this.app_googleService.getUserLocation();
        console.log(currentLatLng);
        if(currentLatLng && currentLatLng['lat'] && currentLatLng['lng']){
          this.currentLatLng = {
            lat:currentLatLng['lat'],
            lng:currentLatLng['lng']
          }
          return true;
        }
      }else{
        this.positionOptions={
          enableHighAccuracy: true,
        }
        let coordinates:any = {};
        const successCallback = (position) => {
          coordinates = position.coords;
          if(coordinates && coordinates['latitude'] && coordinates['longitude']){          
            this.currentLatLng = {
              lat:coordinates.latitude,
              lng:coordinates.longitude
            }
            return true;
          }
        };      
        const errorCallback = (error: any) => {
          console.log(error);
          this.notificationService.presentToastOnBottom(error, "danger");
        };
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        // let coordinates:any =  await Geolocation.getCurrentPosition(this.positionOptions);
        // let coordinates:any = await this.app_googleService.getUserLocation();
        if(coordinates && coordinates['message'] == "Timeout expired"){
          this.notificationService.presentToastOnBottom("Something Went wrong. Please try again.");
        }else if(coordinates && coordinates['lat'] && coordinates['lng']){          
          this.center = {
            lat:coordinates.lat,
            lng:coordinates.lng
          }
          // this.addMarkerOnCurrentLocation(coordinates);
        }else if(coordinates && coordinates['latitude'] && coordinates['longitude']){
          this.center = {
            lat:coordinates.lat,
            lng:coordinates.lng
          }
        }

      }
    }else{
      this.gpsEnableAlert();
    }
  }
  async addMarkerOnCurrentLocation(CurrentPostionlatLng){
    if(this.currentLocationMarkerId) this.removeMarker(this.currentLocationMarkerId);
    this.currentLocationMarkerId = await this.newMap.addMarker({
      coordinate: {
        lat: CurrentPostionlatLng.latitude,
        lng: CurrentPostionlatLng.longitude
      },
      title: CurrentPostionlatLng.heading,
      draggable : false,
      snippet: CurrentPostionlatLng.heading
    })
    const CameraConfig:any = {
      coordinate: {
        lat: CurrentPostionlatLng.latitude,
        lng: CurrentPostionlatLng.longitude
      },
      zoom: 8
    }
    await this.newMap.setMapType(MapType.Terrain);
    this.newMap.setCamera(CameraConfig);
  }
  // End create Capacitor  map and add markers

  setGridData(gridData){
    if (gridData) {
      // if(this.watchId ==''){
        if (gridData.data && gridData.data.length > 0) {
          this.elements = JSON.parse(JSON.stringify(gridData.data));
            this.waypoints =[];
            this.elements.forEach((element,i) => {
              element.waypoints.forEach((waypoints,j) => {
                const object  = { 
                  "lat": waypoints.lat, 
                  "lng": waypoints.lng 
                }
                if(j == 0){
                  this.currentLatLng = object;
                }else if(waypoints.length - 1 == i){
                  this.destinationLatLng = object;
                  this.lat = waypoints.lat;
                  this.lng = waypoints.lng;
                }else{
                  this.waypoints.push(object);
                }
                
              });
            // if(element.waypoints && element.waypoints.length > 0){
            //   element.waypoints.forEach(waypoint => {
            //     this.waypoints.push(waypoint);            
            //   });
            // }
            });
        } else {
          this.elements = [];
        }
      // }
    }
  }
  setStaticData(staticData){
    if (staticData) {
      this.staticData = staticData; 
      Object.keys(this.staticData).forEach(key => {        
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      })
    }
  }

  // getCall(selectedData){
  //   let crList:any = [];
  //   const cr = "_id;eq;" + selectedData._id + ";STATIC";
  //   crList.push(cr);

  //   let data = this.coreUtilityService.getPaylodWithCriteria('location_tracker','',crList,'');
  //   data['pageNo'] = 0;
  //   data['pageSize'] = 50;
  //   let payload = {
  //     'data':data,
  //     'path':"null"
  //   }
  //   this.appApiService.getGridData(payload);
  // }

  // JS Google Map Func.
  async loadMap(){
    try{
      // let googleMaps = this.googleMaps
      let googleMaps = await this.app_googleService.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const mapEl = this.mapRef.nativeElement;
      const mapOptions = {
        center: this.center,
        zoom: 12,
        disableDefaultUI: false,
        // mapTypeId: 'roadmap', //satellite, roadmap
      };

      this.map = new googleMaps.Map(mapEl,mapOptions);

      this.directionsService = new googleMaps.DirectionsService();
      this.directionsService = new googleMaps.DirectionsService;
      this.directionsDisplay = new googleMaps.DirectionsRenderer;
      this.directionsDisplay = new googleMaps.DirectionsRenderer();      
      
      // const location = new googleMaps.LatLng(this.center.lat, this.center.lng);\

      await this.gmcurrentPositionMarker(this.currentLatLng);
      await this.gmdestinationPositionMarker(this.destinationLatLng);

      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setOptions({
        polylineOptions: {
          stroleWeight: 6,
          strokeOpacity: 1,
          strokeColor: 'green'
        },
        suppressMarkers: true
      });
      await this.gmDrawRoute();

      this.map.setCenter(this.currentLatLng);
      this.renderer.addClass(mapEl, 'visible');
      // if(this.watchId == ''){
      //   this.watchPosition();
      // }
      
      // this.addDestinationMarker(currentLatLng);
      // this.ongoogleMapClick();
    }catch(e){
      console.log("loadMap error :",e);
    }
  }
  async gmcurrentPositionMarker(currentlatlng){
    let currentLatLng = new google.maps.LatLng(currentlatlng.lat, currentlatlng.lng);
    let currentPositionIcon = {
      url: this.currentPostionIconUrl,
      scaledSize: new google.maps.Size(30, 30), //scaled Size
      origin: new google.maps.Point(0, 0), //origin
      anchor: new google.maps.Point(0, 0) //anchor
    };
    let currentIconMarker = new google.maps.Marker({
      map: this.map,
      position: currentLatLng,
      animation: google.maps.Animation.DROP,
      icon: currentPositionIcon,
      title: "Current Location"
    });
    this.currentLocationMarkerId = currentIconMarker;
    currentIconMarker.setMap(this.map);

  }
  async gmdestinationPositionMarker(destinationlatlng){
      let destinationLatLng = new google.maps.LatLng(destinationlatlng.lat, destinationlatlng.lng);
      // let destinationLatLng = destinationlatlng;
      let destinationPositionIcon = {
        url: this.destinationPostionIconUrl,
        scaledSize: new google.maps.Size(30, 30), //scaled Size
        origin: new google.maps.Point(0, 0), //origin
        anchor: new google.maps.Point(0, 0) //anchor
      };
      let destinationIconMarker = new google.maps.Marker({
        map: this.map,
        position: destinationLatLng,
        animation: google.maps.Animation.DROP,
        icon: destinationPositionIcon,
        title: this.destinationLocationData.heading
      });
      this.destinationLocationMarkerId = destinationIconMarker;      
      destinationIconMarker.setMap(this.map);
      // this.ongoogleMapDestinationMarkerClick();
  }
  async gmDrawRoute(){
    const directionRequest = {
      origin: this.currentLatLng, //For Curent laction use this.currentLatLng , For Dummy Location use this.center
      destination: this.destinationLatLng,
      travelMode: "DRIVING", // DRIVING, WALKING, BYCYCLING, AND TRANSIT 
      provideRouteAlternatives: true,
    }
    this.directionsService.route(directionRequest, (response, status) => {
      if(status === 'OK'){
        this.directionsDisplay.setDirections(response);
        console.log("directionsDisplay: ", response);
        const directionsData = response.routes[0].legs[0];
        this.directionsData = directionsData;
        this.ongoogleMapDestinationMarkerClick();
        this.ongoogleMapOriginMarkerClick();
      }else{
        console.log("status: ", status);
        // this.notificationService.presentToastOnBottom("status", "danger");
      }
    }
    );

  }
  ongoogleMapDestinationMarkerClick(){
    let origin = "&origin=" + this.currentLatLng.lat + "," + this.currentLatLng.lng;
    let destination = "&destination=" + this.destinationLatLng.lat + "," + this.destinationLatLng.lng;
    let markerHeading = "";
    if(this.directionsData && this.directionsData.end_address){
      markerHeading = this.directionsData.end_address
    }else{
      markerHeading = this.destinationLocationData.heading
    } 
    const contentString = '<h1 id="googleMarkerHeading" class="googleMarkerHeading" style="font-size:16px;margin:0;">'+ markerHeading +'</h1>' + '<p><a aria-label="Show location on map" title="Show location on map" target="_blank" href="https://www.google.com/maps/dir/?api=1'+ origin + destination +'&travelmode=driving'+ ',13z?hl=en-US&amp;gl=US" class="gm-iv-marker-link">View on Google Maps</a></p>'
    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: this.destinationLocationData.heading,
      
    });
    this.markerClickListener = this.googleMaps.event.addListener(this.destinationLocationMarkerId, "click", () => {
      this.map.setCenter(this.destinationLocationMarkerId.getPosition() as google.maps.LatLng);
      this.map.setZoom(16);
      infowindow.open(this.map, this.destinationLocationMarkerId);
    });
  }
  ongoogleMapOriginMarkerClick(){
    let markerHeading = "";
    if(this.directionsData && this.directionsData.start_address){
      markerHeading = this.directionsData.start_address
    } 
    const contentString = '<h1 id="googleMarkerHeading" class="googleMarkerHeading" style="font-size:16px;margin:0;">'+ markerHeading +'</h1>'
    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: this.directionsData.start_address,      
    });
    this.markerClickListener = this.googleMaps.event.addListener(this.currentLocationMarkerId, "click", () => {
      this.map.setCenter(this.currentLocationMarkerId.getPosition() as google.maps.LatLng)
      infowindow.open(this.map, this.currentLocationMarkerId);      
    });
  }
  //End JS Google Map Func.

  // Testing Functions and sample example
  addDestinationMarker(location){
    let googleMaps:any = this.googleMaps;
    const icon = {
      url: '../../../../assets/img/icons/location-1.png',
      scaledSize: new googleMaps.Size(50, 50),
    }
    const marker = new google.maps.Marker({
      position: location,
      map:this.map,
      icon: icon,
      animation: this.googleMaps.Animation.Drop,
      draggable: false
    });
    this.destinationLocationMarkerId = marker;
  }
  ongoogleMapClick(){
    this.mapClickListener = this.googleMaps.event.addListener(this.map, "click", (mapMouseEvent) => {
      console.log("mapClickListener : ",mapMouseEvent.latLng.toJSON());
      // this.addDestinationMarker(mapMouseEvent.latLng);
    })
  }
  ongoogleMapMarkerClick(){
    this.markerClickListener = this.googleMaps.event.addListener(this.destinationLocationMarkerId, "click", () => {
      console.log("markerClickListener : ",this.destinationLocationMarkerId);
      this.checkAndRemoveMarker(this.destinationLocationMarkerId);
    })
  }
  checkAndRemoveMarker(marker:any){
    const index = this.markers.findIndex(x => x.position.lat() == marker.position.lat() && x.position.lng() == marker.position.lng());
    console.log('Is marker already: ',index);
    if(index >= 0){
      this.presentActionSheet(index);
    }
  }
  async presentActionSheet(data) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Albums',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.googleMapsRemoveMarker(data);
        }
      }, {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
  
    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    let nresult = JSON.stringify(result, null, 2);
  }
  googleMapsRemoveMarker(data?:any){
    this.markers[data].setMap(null);
  }
  //END Testing Functions and sample example


}
