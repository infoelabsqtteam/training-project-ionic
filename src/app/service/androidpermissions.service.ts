import { Injectable } from '@angular/core';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
// import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { App_googleService, NotificationService } from '@core/ionic-core';
import { AlertController, Platform } from '@ionic/angular';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { Filesystem, Directory, FilesystemDirectory } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

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
   // Small PDF
   smallFile = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

   // Large PDF (~25mb)
   largeFile = 'https://research.nhm.org/pdfs/10840/10840.pdf';

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

    // requestPermisiions() {
    //   this.androidPermission.requestPermissions(
    //     [this.androidPermission.PERMISSION.ACCESS_NETWORK_STATE, this.androidPermission.PERMISSION.READ_EXTERNAL_STORAGE,
    //     this.androidPermission.PERMISSION.WRITE_EXTERNAL_STORAGE, this.androidPermission.PERMISSION.CAMERA, this.androidPermission.PERMISSION.GET_ACCOUNTS,
    //     this.androidPermission.PERMISSION.ACCESS_FINE_LOCATION, this.androidPermission.PERMISSION.ACCESS_COARSE_LOCATION,
    //     this.androidPermission.PERMISSION.RECORD_AUDIO, this.androidPermission.PERMISSION.MODIFY_AUDIO_SETTINGS
    //     ]);
    // }

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

  // internetPermission(){
  //   return  this.androidPermission.checkPermission(this.androidPermission.PERMISSION.INTERNET || this.androidPermission.PERMISSION.ACCESS_WIFI_STATE).then(
  //     result => {
  //       if (result.hasPermission) {
  //         this.enableGPS();
  //         console.log("Internet Access");
  //       }else {
  //         this.androidPermission.requestPermission(this.androidPermission.PERMISSION.INTERNET);
  //         return true;
  //       }
  //     },
  //     error => {
  //       console.log(error);
  //       this.notificationService.showAlert("Your Device Has LOST Internet Access", 'No Internet',['OK'])
  //     }
  //   )
  // }

  // checkPermission() {
  //   return this.androidPermission.checkPermission(this.androidPermission.PERMISSION.ACCESS_COARSE_LOCATION).then(
  //      result => {
  //        if (result.hasPermission) {
  //          this.enableGPS();
  //        } else {
  //          this.locationAccPermission();
  //        }
  //      },
  //      error => {
  //          // alert("GPS not active. Please Enable GPS.");
  //          console.log(error);
  //      }
  //    );
  //  }
  
  //  locationAccPermission() {
  //    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
  //      if (canRequest) {
  //      } else {
  //        this.androidPermission.requestPermission(this.androidPermission.PERMISSION.ACCESS_COARSE_LOCATION)
  //          .then(
  //            () => {
  //            return  this.enableGPS();
  //            },
  //            error => {
  //              alert("GPS not active. Please Enable GPS.")
  //              console.log(error)
  //            }
  //          );
  //      }
  //    });
  //  }
  
  //  enableGPS() {
  //    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
  //      () => {
  //        this.getCurrentLocation();
  //        return true;
  //      },
  //      // error => alert(JSON.stringify(error))
  //      error => {
  //          // alert("GPS unable to locate your position. Please check GPS is Active.")
  //          this.notificationService.showAlert("GPS unable to locate your position.", 'Enable GPS',['OK'])
  //          console.log(JSON.stringify(error))
  //      }
  //    );
  //  }
  
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

  // Download and Print PDF

  async downloadAndPrintPdf(blobData: any,filename?:string): Promise<void> {
    try {
      const newFileName = new Date().toDateString().replace(/:/g, '-') + '.pdf'
      let data = {
        msg: "",
        status: false,
        fileName: filename ? filename : ''
      }
      let fileName = '';      
      if(filename){
        filename = fileName
      }else{
        fileName = "download-pdf.pdf"
      }
      // Check write permission
      let checkwritepermission = await Filesystem.checkPermissions();
      if(checkwritepermission){

      }else{
        checkwritepermission = await Filesystem.requestPermissions();
      }
      // Save the blob data as a PDF file
      const filePath = `${Directory.Documents}/${fileName}`;
      await Filesystem.writeFile({
        path: filePath,
        data: blobData,
        directory: Directory.Documents
      });
      // Write the blob to the app's local filesystem
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: blobData,
          directory: Directory.Documents
        });

      // Print the PDF file
      await this.printPdf(filePath);
    } catch (error) {
      console.error('Error downloading and printing PDF:', error);
    }
  }

  async printPdf(filePath: string): Promise<void> {
    try {
      // Print the PDF file using the Capacitor Filesystem plugin
      if (!filePath) {
        throw new Error(`Unable to download ${filePath}`);
      }
      await FileOpener.open({
        filePath: filePath,
        openWithDefault: true
      });

      await Filesystem.getUri({
        path: filePath,
        directory: Directory.Documents
      });
      const fileUrl:any = this.sanitizer.bypassSecurityTrustUrl(filePath);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  }

  // Download and Print PDF end
  /**
   * This will download a PDF file and open it using @capacitor-community/file-opener
   */

}
