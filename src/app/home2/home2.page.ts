import { Component, OnInit } from '@angular/core';
import { Platform, AlertController, ModalController } from '@ionic/angular';

import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Media, MediaObject, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { UploadPrescriptionComponent } from '../component/upload-prescription/upload-prescription.component';
import { AddAddressComponent } from '../component/add-address/add-address.component';
import { ProductSearchComponent } from '../component/product-search/product-search.component';
import { FaqComponent } from '../component/faq/faq.component';
import { FilterComponent } from '../component/filter/filter.component';
import { CategoryListPage } from '../pages/category-list/category-list.page';
import { AuthService, StorageService, CoreUtilityService, LocationAddress, RestService, App_googleService, ModelService, ProductService, LoaderService } from '@core/ionic-core';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.page.html',
  styleUrls: ['./home2.page.scss'],
})
export class Home2Page implements OnInit {

  bannerData: any;
  appModules: any = [];
  audioFile: MediaObject;
  headerTitle: string = "Gurgaon";
  list: any = [];
  mList: any = [];
  categoryByProductList: any = [];
  locationAddress: string;
  lat: number;
  lng: number;
  cart_count: number = 0;
  currentLocation: LocationAddress;
  modal: any;
  slideOpts1 = {
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  };
  slideOptsTwo = {
    initialSlide: 1,
    slidesPerView: 2.1,
    loop: true,
    spaceBetween: 15
  };

  constructor(private platform: Platform,
    private modalController: ModalController,
    private _location: Location,
    public alertController: AlertController,
    private authService: AuthService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private http: HttpClient,
    private restService: RestService,
    private googleService:App_googleService,
    private modelService:ModelService,
    private media: Media,
    private file: File,
    private productService:ProductService,
    private loaderService:LoaderService

  ) {
    this.initializeApp();
  }


  ngOnInit() {
    this.googleService.location.subscribe(data => {
      if (data) {
        this.currentLocation = data;
      } else {
        this.googleService.getCurrentAddress();
      }
    })

  }
  ionViewWillEnter() {
    this.productService.setCartCounter();
    this.list = [
      // 'https://www.sanjivanichemist.com/assets/front/images/services/service-one.jpg',
      'https://www.sanjivanichemist.com/assets/img/slider1.png',
      'https://www.sanjivanichemist.com/assets/img/slider1.png',
      'https://www.sanjivanichemist.com/assets/img/service1.jpg',
      'https://www.sanjivanichemist.com/assets/img/slider3.png',
    ];
    this.mList = [{ name: "Medicine", imgPath: "assets/orders.png" }, { name: "My Orders", imgPath: "assets/invoice_01.png" }, { name: "Support", imgPath: "assets/HRMS.png" }, { name: "Health Products", imgPath: "assets/leaves.png" }]
    this.productService.getCartCounter().subscribe(counter => {
      this.cart_count = counter;
    })
    // this.getModules();
    // this.getBannersData();
    //this.getCurrentLocationAddress();

  }
  initializeApp() {
    this.platform.ready().then(() => {

    });

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this._location.isCurrentPathEqualTo('/tab/home2')) {
        if (this.modal) {
          this.modal.dismiss();
          this.modal = null;
        } else {
          this.showExitConfirm();
          processNextHandler();
        }
      } else if (this._location.isCurrentPathEqualTo('/auth/signin')) {

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

        let api = this.coreUtilService.baseUrl('GET_USER_PERMISSION');
        this.http.post(api, obj, header).subscribe(
          respData => {
            if (respData && respData['authenticated'] === "true") {
              console.log(respData);
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
        let api = this.coreUtilService.baseUrl('GET_APP_BANNERS')
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
    if (param != null && param != "") {
      this.coreUtilService.gotoPage(param);
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

  // async getCurrentLocationAddress() {
  //   this.commonFunctionService.checkPermission('ACCESS_FINE_LOCATION').then(async (hasPermission) => {
  //     //alert(hasPermission);
  //     if (hasPermission) {
  //       const location = await this.commonFunctionService.watchPosition();
  //       //alert(JSON.stringify(location))
  //       if ('lat' in location && 'lng' in location) {
  //         //alert(`success  ${location['lat']},${location['lng']} watch id is ${location.watchId}`);
  //         const address = await this.commonFunctionService.getAddressFromLatLong(location.lat, location.lng);
  //         if (address) {
  //           console.log(address);
  //           this.headerTitle = this.commonFunctionService.extractFromAdress(address[0].address_components, "locality")
  //           this.locationAddress = address[0].formatted_address;
  //           this.lat = address[0].geometry.location.lat();
  //           this.lng = address[0].geometry.location.lng();
  //           // console.log(`${this.lat} ${this.lng}`)
  //         }
  //         // this.commonFunctionService.getAddress(location.lat, location.lng).then((address) => {
  //         //   alert(`Get Address  ${JSON.stringify(address)}`);
  //         //   if (address) {
  //         //     this.headerTitle = address.address;
  //         //   }
  //         // })

  //         this.commonFunctionService.clearWatch(location.watchId);
  //         // this.headerTitle = address;
  //       }
  //     } else {
  //       this.commonFunctionService.checkPermission('ACCESS_FINE_LOCATION');
  //     }
  //   })
  // }

  async openPresModal() {
    this.modelService.openPresModal(UploadPrescriptionComponent);
  }

  async addAddress() {
    this.loaderService.hideLoader();
    this.modal = await this.modalController.create({
      component: AddAddressComponent,
      componentProps: {
        "modalData": { address: this.currentLocation.address, lat: this.currentLocation.lat, lng: this.currentLocation.lng, searchAddress: true, newAddress: false, searchNewLocality: true },
        "headerVaue": ""

      }
    });
    this.modal.componentProps.modal = this.modal;
    this.modal.onDidDismiss()
      .then((data) => {
        if (data['data'] && data['data'] != undefined) {
          let address = data['data'];
          this.headerTitle = address.locality;
        }
      });
    return await this.modal.present();
  }
  async openSearch() {

    this.modal = await this.modalController.create({
      component: ProductSearchComponent,
      componentProps: {
        "modalData": {},
        "headerVaue": ""
      }
    });
    this.modal.componentProps.modal = this.modal;
    return await this.modal.present();
  }
  getProductByCategory() {
    this.coreUtilService.gotoPage('cat');
    // let log = await this.storageService.getUserLog();
    // let obj = {
    //   crList: [],
    //   key1: "MCLR01",
    //   key2: "CRM",
    //   log: log,
    //   pageNo: 0,
    //   pageSize: 100,
    //   value: "stock_master"
    // }
    // this.restService.getProductByCategory(obj).subscribe(resp => {
    //   if (resp['data'] && resp['data'].length > 0) {
    //     this.categoryByProductList = resp['data'];
    //   }
    // }, (err: HttpErrorResponse) => {
    //   console.log(err.error);
    // })
  }
  ngOnDestroy() {
    this.modal = null;
    //this.isCurrentView = false;
  }


}