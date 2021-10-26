import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AddAddressComponent } from 'src/app/component/add-address/add-address.component';
import { StorageService, AuthService, LoaderService, CoreUtilityService, LocationAddress, RestService, App_googleService, ProductService } from '@core/ionic-core';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.page.html',
  styleUrls: ['./order-summary.page.scss'],
})
export class OrderSummaryPage implements OnInit {
  addressList: any = [];
  cartItems: any = [];
  presList: any = [];
  selectedAddress: any = {};
  order: any = {};
  currentLocation: LocationAddress;
  constructor( 
    private alertController: AlertController, 
    private loader: LoaderService, 
    private restService: RestService, 
    private storageService: StorageService, 
    private authService: AuthService, 
    private coreUtilService:CoreUtilityService,
    private modalController: ModalController,
    private googleService:App_googleService,
    private productService:ProductService
  ) { }

  ngOnInit() {
    this.getAddrList()
    this.getCartItems();
    this.getPresList();
    this.googleService.location.subscribe(address => {
      console.log("order checkout");
      if (address) {
        this.currentLocation = address;
      }
    })
  }
  ionViewWillEnter() {
    //this.commonUtil.getCurrentAddress();
  }
  goToHome() {
    this.coreUtilService.gotoPage('tab/cart-items');
  }
  async getPresList() {
    let list = await this.storageService.getObject('presData');
    if (list) {
      this.presList = list;
    }
  }
  async getAddrList() {
    let list = await this.storageService.getObject('address');
    if (list) {
      this.addressList = list;
    }
  }
  async getCartItems() {
    let list = await this.storageService.getObject('cartData');
    if (list) { this.cartItems = list; this.calculateOrderAmount(); }
  }
  calculateOrderAmount() {
    this.order = this.productService.calculateOrderAmount(this.cartItems);
  }
  async addAddress() {

    const modal = await this.modalController.create({
      component: AddAddressComponent,
      componentProps: {
        "modalData": { address: this.currentLocation.address, lat: this.currentLocation.lat, lng: this.currentLocation.lng, searchAddress: false, newAddress: true, searchNewLocality: false },
        "headerVaue": ""

      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        this.getAddrList();
      });
    return await modal.present();
  }
  async confirmOrder() {
    this.loader.showLoader(null);
    const user = await this.storageService.getObject('user');
    const log = await this.storageService.getUserLog();
    let ulpoadData = await this.getPrescription();
    this.order.attachment = [];
    this.order.attachment.push({ uploadData: ulpoadData })
    this.order.items = this.cartItems;
    this.order.deliveryAddress = this.selectedAddress.address;
    this.order.paymentMode = "CASH";
    this.order.phone = user.mobile1;
    this.order.name = user.name;
    if (this.selectedAddress.lat) {
      this.order.latitude = this.selectedAddress.lat;
    }
    if (this.selectedAddress.lng) {
      this.order.longitude = this.selectedAddress.lng;
    }
    this.order.log = log;
    let api = `${this.coreUtilService.baseUrl('SAVE_FORM_DATA')}/order_mang`;
    this.restService.postApiMethod(api, this.order).subscribe((resp) => {
      this.loader.hideLoader();
      if (resp.hasOwnProperty("success") && resp['success'] == "success") {
        this.showAlert();
        this.storageService.removeObjectFromStorage("cartData");
        this.storageService.removeObjectFromStorage("presData");
        this.coreUtilService.gotoPage('tab/home2');
      } else if (resp.hasOwnProperty("error")) {
        this.storageService.presentToast(resp['error']);
      }

    }, (err: HttpErrorResponse) => {
      this.loader.hideLoader();
      //this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })
  }
  async getPrescription() {
    const log = await this.storageService.getUserLog();
    let uploadData = [];
    if (this.presList && this.presList.length > 0) {
      this.presList.forEach(element => {
        uploadData.push({
          fileData: element.base64Image,
          fileExtn: element.format,
          fileName: element.name,
          innerBucketPath: `${element.name}.${element.format}`,
          log: log
        })
      });
    }
    return uploadData;
  }
  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Order',
      message: 'Order placed successfully ! ',
      buttons: ['Close',]
    });

    await alert.present();
  }
}
