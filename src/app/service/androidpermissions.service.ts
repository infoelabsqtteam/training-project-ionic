import { Injectable } from '@angular/core';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
// import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { App_googleService, NotificationService } from '@core/ionic-core';
import { AlertController, Platform } from '@ionic/angular';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class AndroidpermissionsService {

  // geolocation
  coords:any;
  latitude: number;
  longitude:number;
  options: any;
  inputaddress: any;
  result: any;

  constructor(
    private nativeGeocoder: NativeGeocoder,
    // private locationAccuracy: LocationAccuracy,
    private androidPermission: AndroidPermissions,
    private app_googleService: App_googleService ,
    private dataShareService: DataShareServiceService,
    private notificationService: NotificationService,
    public alertController: AlertController,
    private nativeSettings: OpenNativeSettings,
    private platform: Platform,
    private http: HttpClient, 
    private sanitizer: DomSanitizer
  ) { }

  async internetExceptionError(){
      const alert = await this.alertController.create({
        header: 'No Internet Connection',
        backdropDismiss: false,
        message: 'You have lost internet connection',
        buttons: [{
          text: "OK",
          handler: () => {
            if(this.platform.is('hybrid')){
              alert.dismiss();
              // navigator['app'].exitApp(); //for exit the app on 'OK' click
            }else{
              console.log("Dissmiss No Internet Connection Alert");
              alert.dismiss();
            }
          }
        }]
      });
      await alert.present();
  }

  async createAlert(header, backdropDismiss, message, buttonOptions1, buttonOptions2?): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
    header,
    backdropDismiss,
    message,
    buttons: !buttonOptions2 ? [buttonOptions1] : [buttonOptions1, buttonOptions2]
    });
    return alert;
  }
  
  async getCurrentLocation(){
    try{
      // const coordinates = await Geolocation.getCurrentPosition();
      const coordinates = await this.app_googleService.getUserLocation();
      this.coords = coordinates;
      console.log("coords:", this.coords);
      this.latitude = this.coords.lat;
      this.dataShareService.setCurrentLatitude(this.latitude);
      this.longitude = this.coords.lng;
      this.dataShareService.setCurrentLongitude(this.longitude);

      let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 1
      };
        this.nativeGeocoder.reverseGeocode(this.latitude, this.longitude, options)
      .then((result: NativeGeocoderResult[]) =>{
        this.result = (JSON.stringify(result[0]));
        console.log(this.result);
        console.log(this.result.postalCode);
        this.dataShareService.setUserPostalCode(this.result.postalCode);
        return true;
        
      })
      .catch((error: any) => console.log(error));

    }catch(e) {
      // this.notificationService.showAlert("Please Enable GPS to Deliver you medicine", 'Enable GPS',['OK']);
      console.log('Error getting location: ', e);
    }
  }

  openNativeSettings(settingName:any){
    this.nativeSettings.open(settingName).then(()=>{
      console.log(settingName + "has been open");
    });
  }

}
