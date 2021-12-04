import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddAddressComponent } from 'src/app/component/add-address/add-address.component';
import { AuthService, StorageService, CoreUtilityService, EnvService, RestService, ProductService } from '@core/ionic-core';
declare var RazorpayCheckout: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  cartItems: any = [];
  presList: any = [];
  order: any = {};
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private coreUtilService:CoreUtilityService,
    private envService:EnvService,
    private modalController: ModalController,
    private restService: RestService,
    private productService:ProductService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.order.paymentMode = 'ONLINE';
    this.getCartItems();
    this.getPresList();
    this.getAddrList();

  }
  async getCartItems() {
    let list = await this.storageService.getObject('cartData');
    if (list) { this.cartItems = list; this.calculateOrderAmount(); }
  }
  async getPresList() {
    let list = await this.storageService.getObject('presData');
    if (list) {
      this.presList = list;
    }
  }
  async addAddress() {
    const modal = await this.modalController.create({
      component: AddAddressComponent,
      componentProps: {
        "modalData": {},
        "headerVaue": ""
      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        if (data['data'] != undefined) {

        }
      });
    return await modal.present();
  }

  calculateOrderAmount() {
    this.order = this.productService.calculateOrderAmount(this.cartItems);
  }
  async getAddrList() {
    let list = await this.storageService.getObject('address');
    if (list) {
      list.forEach(element => {
        if (element.selected && element.selected === true) {
          this.order.deliveryAddress = element;
        }
      });
      if (!this.order.hasOwnProperty('deliveryAddress')) {
        this.order.deliveryAddress = list[1];
      }
    }
  }

  async payWithRazor() {
    var options = {
      description: 'Sanjivani Chemist',
      image: 'https://i.imgur.com/3g7nmJC.png',
      //order_id: 'order_DBJOWzybf0sJbb',
      currency: 'INR',
      key: this.envService.getRazorPayKey(),
      amount: this.order.netAmount * 100,
      name: 'Sanjivani',
      theme: {
        color: '#FE6F61'
      }
    }
    var successCallback = (success) => {
      this.order.razorpay_payment_id = success.razorpay_payment_id;
      this.order.razorpay_order_id = success.razorpay_order_id;
      this.order.razorpay_signature = success.razorpay_signature;
      this.storageService.presentToast('Payment Successfull !!');
      this.setPaymentResponse();
      // var orderId = success.razorpay_order_id
      // var signature = success.razorpay_signature
    }
    var cancelCallback = (error) => {
      this.paymentCancelCallback(error);
      //alert(error.description + ' (Error ' + error.code + ')');
    }
    RazorpayCheckout.on('payment.success', successCallback)
    RazorpayCheckout.on('payment.cancel', cancelCallback)
    RazorpayCheckout.open(options)
  }
  setPaymentResponse() {
    let items = [];
    this.cartItems.forEach(element => {
      let item: any = {};
      item.mrp = element.mrp;
      item.packaging = element.packaging;
      item.quantity = Number(element.qty).toString();
      item.name = this.coreUtilService.getReferenceObject(element);
      items.push(item);
    });
    this.order.items = items
    const deliveryAddress = this.order.deliveryAddress;
    this.order.deliveryAddress = `${deliveryAddress.locality}, ${deliveryAddress.landmark}, ${deliveryAddress.address}`;
    this.order.log = { "userId": "vksh6623@gmail.com", "appId": "ECOM", "refCode": "MCLR01" };

    let api = `${this.envService.baseUrl('SAVE_FORM_DATA')}/order_mang`;
    this.restService.postApiMethod(api, this.order).subscribe((success) => {
      console.log(success);
      if ('success' in success) {
        this.storageService.removeObjectFromStorage('cartData');
        this.storageService.presentToast('Order Placed Successfully !!!');
        this.coreUtilService.gotoPage('/home');
      }

    }, (err: HttpErrorResponse) => {
      this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })

  }
  paymentCancelCallback(error) {
    alert(error.description + ' (Error ' + error.code + ')');
    this.storageService.presentToast(`Payment Failed : ${error.description} `);
  }
  payWithCash() {
    this.setPaymentResponse();
  }
}
