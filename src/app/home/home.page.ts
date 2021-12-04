import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture/ngx';
import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { AuthService, StorageService, EnvService, CoreUtilityService, RestService } from '@core/ionic-core';
import { core } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  bannerData: any;
  appModules: any = [];
  audioFile: MediaObject;
  list: any = [];
  slideOpts1 = {
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  };
  web_site:string='';

  constructor(private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private _location: Location,
    public alertController: AlertController,
    private authService: AuthService,
    private storageService: StorageService,
    private envService:EnvService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private restService: RestService,
    private mediaCapture: MediaCapture,
    private media: Media,
    private file: File,
    private callNumber: CallNumber
  ) {
    this.initializeApp();
    this.list = [
      // 'https://www.sanjivanichemist.com/assets/img/services/service-one.jpg',
      'https://www.sanjivanichemist.com/assets/img/slider1.png',
      'https://www.sanjivanichemist.com/assets/img/slider1.png',
      'https://www.sanjivanichemist.com/assets/img/service1.jpg',
      'https://www.sanjivanichemist.com/assets/img/slider3.png',
    ];
    this.web_site = this.envService.getWebSiteName();
  }


  ngOnInit() {
    this.getBannersData();
  }
  ionViewWillEnter() {
    this.getModules();
    //this.getBannersData();
    //this.commonFunctionService.gotoPage('/notification');
  }
  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
    });

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/home')) {

        // Show Exit Alert!
        console.log('Show Exit Alert!');
        this.showExitConfirm();
        processNextHandler();
      } else {

        // Navigate to back page
        console.log('Navigate to back page');
        this._location.back();

      }

    });

    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Handler called to force close!');
      this.alertController.getTop().then(r => {
        if (r) {
          navigator['app'].exitApp();
        }
      }).catch(e => {
        console.log(e);
      })
    });

  }
  getModules() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        };

        let obj = {
          key: val.idToken
        };

        let api = this.envService.baseUrl('GET_USER_PERMISSION');
        this.http.post(api, obj, header).subscribe(
          respData => {
            if (respData && respData['authenticated'] === "true") {
              //console.log(respData);
              if (respData.hasOwnProperty("app_modules") && respData['app_modules'].length > 0) {
                this.appModules = respData['app_modules'];
              } else {
                this.appModules = [];
              }

            } else {
              this.appModules = [];
            }
          },
          (err: HttpErrorResponse) => {
            // console.log(err.error);
            // console.log(err.name);
            console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })
  }



  showExitConfirm() {
    this.alertController.create({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        cssClass: 'primary',
        handler: () => {
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        cssClass: 'danger',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }

  getBannersData() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }

        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 50,
          value: "quotation_letter"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_APP_BANNERS')
        this.http.post(api, obj, header).subscribe(
          (respData) => {
            this.bannerData = respData['success'];
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
          }
        )
      }
    })

  }

  showMessage() {
    this.storageService.presentToast('Comming Soon...');
  }
  goToPage(param: any) {
    if (param.url != null && param.url != "") {
      this.coreUtilService.gotoPage(param.url);
    } else {
      this.showMessage();
    }

  }
  captureAudio() {
    let filename = Date.now().toString();
    filename = filename + '.mp3';
    //let audioPath = this.file.externalDataDirectory + filename;
    // let audio = this.mediaCapture.create(this.audioPath.replace(/file:\/\//g, ''));

    // this.mediaCapture.captureAudio()
    //   .then(
    //     (data: MediaFile[]) => { alert("success"); alert(data) },
    //     (err: CaptureError) => { alert(JSON.stringify(err)) }
    //   );

    //const file: MediaObject = this.media.create(audioPath);
    //   let audioPath = this.file.externalRootDirectory.replace(/file:\/\//g, '') + 'record12354.m4a';
    //   this.audioFile = this.media.create(audioPath);
    //   this.audioFile.release();
    //   this.audioFile.startRecord();
    //   setTimeout(() => {
    //     alert("success");
    //     this.audioFile.stopRecord();
    //     this.audioFile.play();

    //     this.file.resolveLocalFilesystemUrl(audioPath)
    //       .then(r => alert(r))
    //       .catch(e => alert('Error #2: ' + e));


    //     alert('duration' + this.audioFile.getDuration());
    //     alert(audioPath);
    //   }, 15000);

    // }
    // call() {
    //   this.callNumber.callNumber("7206589979", true)
    //     .then(res => alert('Launched dialer!' + res))
    //     .catch(err => alert('Error launching dialer' + err));

    this.file.createFile(this.file.externalApplicationStorageDirectory, 'my_file.mp3', true).then(() => {
      // Get file created -> my_file.mp3
      let audioObject: MediaObject = this.media.create(this.file.externalApplicationStorageDirectory.replace(/file:\/\//g, '') + 'my_file.mp3');
      audioObject.release();
      // Start Record
      audioObject.startRecord();

      // This method is very important to know your execution process
      // In my case the recording interface is not shown as in IOS
      audioObject.onStatusUpdate.forEach(n => {
        switch (n) {
          case MEDIA_STATUS.RUNNING: // return code 2 = recording audio
            // recording
            break;
          case MEDIA_STATUS.STOPPED: // return code 4 = stopped audio
            alert('stopped')
            this.file.readAsDataURL(this.file.externalApplicationStorageDirectory, 'my_file.mp3').then(audioo => {
              alert(audioo);
              // base64 audio
            });
            break;
        }

      });

      window.setTimeout(() => audioObject.stopRecord(), 9000);
    });
  }
  // getCallLogs() {
  //   this.callLog.requestReadPermission().then((data) => {
  //     alert(data);
  //     let filters: CallLogObject[] = [{
  //       "name": "number",
  //       "value": "7206589979",
  //       "operator": "like",
  //     }];
  //     this.callLog.getCallLog(filters).then((data) => { alert(data.length) },
  //       (err) => { alert('error while get call logs' + err) })

  //   },
  //     (err) => { alert(err) })



  // }

}