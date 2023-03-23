import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { App_googleService, DataShareService, EnvService, NotificationService, PermissionService, CoreUtilityService, RestService, ApiService } from '@core/ionic-core';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { GoogleMap, MapType } from '@capacitor/google-maps';
import { map } from 'rxjs';
import { DatePipe } from '@angular/common';

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
  @Output() outputdata = new EventEmitter();
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



  constructor(
    private app_googleService : App_googleService,
    private notificationService: NotificationService,
    private alertCtrl: AlertController,
    private permissionService: PermissionService,
    private ngZone: NgZone,
    private platform: Platform,
    private envService: EnvService,
    private dataShareService: DataShareService,
    private renderer: Renderer2,
    private actionSheetController: ActionSheetController,
    private coreFunctionService: CoreUtilityService,
    private restService: RestService,
    private apiService: ApiService,
    private datePipe: DatePipe,
  ) {   
    this.currentPostionIconUrl = '../../../../assets/img/icons/current-location-1.png';
    this.destinationPostionIconUrl = '../../../../assets/img/icons/destination-location-1.png';
    this.isTracking = false;
    this.gridDataSubscription = this.dataShareService.gridData.subscribe(data =>{
      this.setGridData(data);
    })
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })
    // this.currentMenu = this.storageService.GetActiveMenu();
    // if (this.currentMenu.name != '') {
    //   this.getMaplist({});
    // }
    // const payloadList = [
    //   {
    //     "api_params" : 'location_tracker',
    //     "call_back_field" : 'location_list',
    //     "criteria":[],
    //     'object' : {}
    //   }
    // ]
    // this.getCall(payloadList);

  }

  ngOnInit() {

  }

  ionViewDidEnter(){
    this.onload();
    this.checkPermissionandRequest();
  }
  dismissModal(data?:any){
    this.modal.dismiss(data);
  }

  async onload(){
    if(this.selectedRowData){
      
      this.getCall(this.selectedRowData);

      if(this.selectedRowData.name){
        this.SelectedItemName = this.selectedRowData.name;
      }
      if(this.selectedRowData.endPoint){
        if(this.selectedRowData.endPoint && this.selectedRowData.endPoint !=null){
          
          if(this.selectedRowData && this.selectedRowData.destinationName){
            this.destinationLocationData['heading'] = this.selectedRowData.destinationName;
          }else{
            this.destinationLocationData['heading'] = "Destination Location";
          }
          this.destinationLatLng = this.selectedRowData.endPoint;
          this.destinationLocationData['latlng'] = this.destinationLatLng
          // this.destinationLatLng = {
          //   lat: this.selectedRowData.endPoint.lat,
          //   lng: this.selectedRowData.endPoint.lng,
          // }
          if(this.additionalData && this.additionalData.currentLatLng && this.additionalData.currentLatLng.lat){
            this.currentLatLng = this.additionalData.currentLatLng;
            this.loadMap();
          }
          // this.createMap(this.center);
          // this.loadMap();
        }
      }
    }
  }

  async checkPermissionandRequest(){
    if (this.platform.is('hybrid')) {
      const permResult = await this.permissionService.checkAppPermission("ACCESS_FINE_LOCATION");
      console.log('ACCESS_FINE_LOCATION request result: ', permResult);
      if(permResult){
        this.enableGPSandgetCoordinates();
      }else{
        this.requestPermissions();
      }
    }else{
      if (navigator.geolocation) {
        // const successCallback = (position) => {
        //   console.log(position);
        //   this.canUseGPS=true;
        //   this.storeWatchPosition(position);
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
        //     this.storeWatchPosition(value);
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
      enableGPS = await this.checkGPSPermission();
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
  storeWatchPosition(resp){    
    this.isTracking = true;
    this.locationTraces.push({
      accuracy:resp.coords.accuracy,
      altitude:resp.coords.altitude,
      altitudeAccuracy:resp.coords.altitudeAccuracy,
      heading:resp.coords.heading,
      latitude:resp.coords.latitude,
      longitude:resp.coords.latitude,
      speed:resp.coords.speed,
      timestamp:resp.timestamp        
    });
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
  packagedelivered(){
    let deliveredTime = this.datePipe.transform(new Date(), "dd-MM-yyyyThh:mm:ss");
    if(this.elements && this.elements.length == 1){
      const element = this.elements[0];
      element['endTimeStamp'] = deliveredTime;
      element['waypoints'] = this.waypoints;
      let payload = {
        "curTemp" : "location_tracker",
        "data":element
      }
      this.apiService.SaveFormData(payload);
      
      this.selectedRowData.status = "DELIVERED";
      // let packagePayload = {
      //   "curTemp":this.collectionname,
      //   "data":data
      // }
      // this.apiService.SaveFormData(packagePayload);
      this.clearWatch();
      this.dismissModal(this.selectedRowData);

    }else{
      this.getCall(this.selectedRowData);
      this.notificationService.presentToastOnBottom("Please wait for a while!");
    }
  }

  async checkGPSPermission(){
    if(this.platform.is('hybrid')){
      const enableGPS = await this.app_googleService.askToTurnOnGPS();
      return enableGPS;
    }else{
      let canUseGPS :any= {}
      // let canUseGPS:any = await this.app_googleService.requestLocationPermission();
      canUseGPS = await (await Geolocation.checkPermissions()).location;
      if(canUseGPS == "granted"){
        return true;
      }else{
        return false;
      }
    }
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
    const enableGPS = await this.checkGPSPermission();
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
          // this.storeWatchPosition(position);
        };      
        const errorCallback = (error: any) => {
          console.log(error);
          this.notificationService.presentToastOnBottom(error, "danger");
        };
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        // let coordinates:any =  await Geolocation.getCurrentPosition(this.positionOptions);
        // let coordinates:any = await this.app_googleService.getUserLocation();
        if(coordinates && coordinates['message'] == "Timeout expired"){
          this.getCurrentLocation();
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

  getCall(selectedData){
    let crList:any = [];
    const cr = "packageRef._id;eq;" + selectedData._id + ";STATIC";
    crList.push(cr);

    let data = this.restService.getPaylodWithCriteria('location_tracker','',crList,'');
    data['pageNo'] = 0;
    data['pageSize'] = 50;
    let payload = {
      'data':data,
      'path':"null"
    }
    this.apiService.getGridData(payload);

    
    // const payloadList = [
    //     {
    //       "api_params" : 'location_tracker',
    //       "call_back_field" : 'location_list',
    //       "criteria":crList,
    //       'object' : {}
    //     }
    //   ]

    // const stati_group = [];
    // payloadList.forEach(element => {
    //   const getCompanyPayload = this.restService.getPaylodWithCriteria(element.api_params,element.call_back_field,element.criteria,element.object)
    //   stati_group.push(getCompanyPayload);
    // });
    // if(stati_group.length > 0){
    //   // this.store.dispatch(
    //   //   new CusTemGenAction.GetStaticData(stati_group)
    //   // )  
    //   this.apiService.getStatiData(stati_group);      
    // }
  }

  // JS Google Map Func.
  async loadMap(){
    try{
      let googleMaps = await this.app_googleService.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const mapEl = this.mapRef.nativeElement;
      const mapOptions = {
        center: this.center,
        zoom: 12,
        disableDefaultUI: false,
        // mapTypeId: 'satellite'
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
      await this.drawRoute();

      this.map.setCenter(this.currentLatLng);
      this.renderer.addClass(mapEl, 'visible');
      this.watchPosition();
      
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
      this.ongoogleMapDestinationMarkerClick();
  }
  async drawRoute(){
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
        // console.log("directionsData: ", directionsData);
        // const distance = directionsData.distance.text;
        // const duration = directionsData.duration.text;
        // console.log("duration : ", duration)
      }else{
        console.log("status: ", status);
        // this.notificationService.presentToastOnBottom("status", "danger");
      }
    }
    );

  }
  ongoogleMapDestinationMarkerClick(){
    const contentString = '<h1 id="googleMarkerHeading" class="googleMarkerHeading" style="font-size:16px;margin:0;">'+this.destinationLocationData.heading+'</h1>' + '<p><a aria-label="Show location on map" title="Show location on map" target="_blank" href="https://www.google.com/maps/@'+ this.destinationLatLng.lat +','+ this.destinationLatLng.lng +','+ '13z?hl=en-US&amp;gl=US" class="gm-iv-marker-link">View on Google Maps</a></p>'
    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      ariaLabel: this.destinationLocationData.heading,
      
    });
    this.markerClickListener = this.googleMaps.event.addListener(this.destinationLocationMarkerId, "click", () => {
      if (this.destinationLocationMarkerId.getAnimation() !== null) {
        this.destinationLocationMarkerId.setAnimation(null);
      } else {
        window.setTimeout(() => {
          this.destinationLocationMarkerId.setAnimation(google.maps.Animation.BOUNCE);          
        }, 3000);
      }
      this.map.setZoom(16);
      this.map.setCenter(this.destinationLocationMarkerId.getPosition() as google.maps.LatLng);
      infowindow.open(this.map, this.destinationLocationMarkerId);
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
