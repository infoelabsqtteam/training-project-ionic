import { Component, NgZone, OnInit } from '@angular/core';
import { App_googleService, NotificationService, AppPermissionService } from '@core/ionic-core';
import { AlertController, Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { CallbackID, Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-track-location',
  templateUrl: './track-location.page.html',
  styleUrls: ['./track-location.page.scss'],
})
export class TrackLocationPage implements OnInit {

  locationWatchStarted:boolean;
  locationSubscription:any;
  isGpsEnable : boolean;
  coordinate: any;

  locationTraces = [];
  watchCoordinate: any;
  watchId: any;
  canUseGPS:boolean;

  constructor(
    private app_googleService : App_googleService,
    private notificationService: NotificationService,
    private alertCtrl: AlertController,
    private permissionService: AppPermissionService,
    private zone: NgZone,
    private platform: Platform
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.onload();
  }

  async onload(){
    console.log(this.platform.is('hybrid'));
    if (this.platform.is('hybrid')) {
      const permResult = await this.permissionService.checkAppPermission("ACCESS_FINE_LOCATION");
      console.log('Perm request result: ', permResult);
      if(permResult){
        const canUseGPS = await this.app_googleService.askToTurnOnGPS();
        if(canUseGPS){
          this.canUseGPS = true;
        }else{
          this.canUseGPS = false;
        }
      }
    }else{
      await this.watchPosition();
    }
  }

  async requestPermissions() {
    // let permResult = await Geolocation.requestPermissions();
    const permResult = await this.permissionService.checkAppPermission("ACCESS_FINE_LOCATION");
    console.log('Perm request result: ', permResult);
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
          cssClass: 'my-custom-class',
          header: 'Enable GPS!',
          message: 'ITC collects Your location data to serve you better services. We will not save your location.',
          buttons: [
            {
              text: 'No, thanks',
              role: 'cancel',
            },
            {
              text: 'OK',
              handler: () => {
                this.enableGPSandgetCoordinates();
              },
            },
          ],
        });
    
      await alert.present();        
      
  }

  async enableGPSandgetCoordinates(canUseGPS?:any){
    canUseGPS = await this.app_googleService.askToTurnOnGPS();
      if(canUseGPS){
        this.canUseGPS = true;
        this.watchPosition();
      }else{
        this.canUseGPS = false;
        console.log("User denied gps permission.");
      }
  }

  getCurrentCoordinate() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      console.log('Plugin geolocation not available');
      return;
    }
    Geolocation.getCurrentPosition().then(resp => {
      this.coordinate = {
        latitude: resp.coords.latitude,
        longitude: resp.coords.longitude,
        accuracy: resp.coords.accuracy,
        timestamp: resp.timestamp
      };
      console.log(this.coordinate);
    }).catch(err => {
      console.error(err);
    });
  }

 async watchPosition() {
    try {
        this.watchId = await Geolocation.watchPosition({enableHighAccuracy:true,timeout:5000}, (position, err) => {
        console.log('Watch', position);
        this.canUseGPS = true;
        this.zone.run(() => {
          this.watchCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy:position.coords.accuracy,
            speed:position.coords.speed,
            timestamp:position.timestamp
          };
          this.locationTraces.push(this.watchCoordinate);
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  clearWatch() {
    if (this.watchId != null) {
      Geolocation.clearWatch({ id: this.watchId });
      this.locationTraces=[];
      this.watchCoordinate={};
      this.canUseGPS = false;
    }
  }

  checkGPS(){
    if(this.canUseGPS){
      this.clearWatch();
    }else{
      this.requestPermissions();
    }
  }



//   async onload(){
//       const coords = await this.app_googleService.watchPosition();
//       if(coords && coords.gpsenable == true){
//         this.isGpsEnable = true;
//         this.locationTraces.push({
//           latitude:coords.lat,
//           longitude:coords.lng,
//           accuracy:coords.accu,
//           timestamp:coords.time
//         });
//       }else{
//         this.isGpsEnable = false;
//       }
//   }

//   async trackme(){
//     if(!this.isGpsEnable){
      
//       const alert = await this.alertCtrl.create({
//         cssClass: 'my-custom-class',
//         header: 'Enable GPS!',
//         message: 'E-labs collects location data to serve you better services.',
//         buttons: [
//           {
//             text: 'No, thanks',
//             role: 'cancel',
//           },
//           {
//             text: 'OK',
//             handler: () => {
//               this.enableGPSandgetCoordinates();
//             },
//           },
//         ],
//       });
  
//       await alert.present();
      
//     }else{
//       this.getCoordinates();
//     }
//   }

//  async getCoordinates() {
//     let coords: any  = await this.app_googleService.getUserLocation()
//       if(coords && coords.gpsenable == true){

//         this.locationTraces.push({
//           latitude:coords.lat,
//           longitude:coords.lng,
//           accuracy:coords.accu,
//           timestamp:coords.time
//         });
//       }

//     coords = await this.app_googleService.watchPosition();
//     // coords.subscribe((resp) => {

//       this.locationWatchStarted = true;
//       this.locationTraces.push({
//         latitude:coords.lat,
//           longitude:coords.lng,
//           accuracy:coords.accu,
//           timestamp:coords.time
//       });

//     // });
    
//   }

//   async enableGPSandgetCoordinates(){
//     const GPSValue:any = await this.app_googleService.askToTurnOnGPS();
//       if(GPSValue){
//         this.getCoordinates();
//       }else{
//         console.log("User denied gps permission.");
//       }
//   }

}
