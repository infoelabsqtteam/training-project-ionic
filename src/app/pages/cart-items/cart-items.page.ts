import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UploadPrescriptionComponent } from 'src/app/component/upload-prescription/upload-prescription.component';
import { ProductSearchComponent } from '../../component/product-search/product-search.component';
import { AuthService, StorageService, LocationAddress, RestService, CoreUtilityService, App_googleService, ProductService, ModelService } from '@core/ionic-core';

@Component({
  selector: 'app-cart-items',
  templateUrl: './cart-items.page.html',
  styleUrls: ['./cart-items.page.scss'],
})
export class CartItemsPage implements OnInit {
  cartItems: any = [];
  presList: any = [];
  order: any = {};
  currentLocation: LocationAddress;
  constructor(
    private restApiService: RestService,
    private authService: AuthService,
    private storageService: StorageService,
    private modalController: ModalController,
    private coreUtilServie:CoreUtilityService,
    private googleService:App_googleService,
    private productService:ProductService,
    private modelServie:ModelService
  ) { }

  ngOnInit() {
    this.googleService.location.subscribe(address => {
      console.log("cart checkout");
      if (address) {
        this.currentLocation = address;
      }
    })
  }

  ionViewWillEnter() {
    this.order = {};
    //this.commonService.getCurrentAddress();
    this.getCartItems();
    //this.presList = [{ name: "bhanu" }, { name: "rana" }]
    this.getPresList();
  }

  async getCartItems() {
    let list = await this.storageService.getObject('cartData');
    if (list) {
      this.cartItems = list; this.calculateOrderAmount();
    } else {
      this.cartItems = [];
    }
  }
  plus(item: any, index: number) {
    this.cartItems[index].quantity = Number(this.cartItems[index].quantity) + 1;
    let price = parseFloat(this.cartItems[index].mrp) * this.cartItems[index].quantity;
    //this.cartItems[index].discount = 10;
    //let discount = (10 * price) / 100;
    this.cartItems[index].price = price;
    this.productService.addItemToCart(this.cartItems[index]);
    this.calculateOrderAmount();
    //this.cartItems[index].discountAmount = discount;

  }
  minus(item: any, index: number) {
    if (Number(this.cartItems[index].quantity) === 0) {
      return;
    }
    this.cartItems[index].quantity = Number(this.cartItems[index].quantity) - 1;
    let price = parseFloat(this.cartItems[index].mrp) * this.cartItems[index].quantity;
    // this.cartItems[index].discount = 10;
    // let discount = (10 * price) / 100;
    this.cartItems[index].price = price;
    this.productService.addItemToCart(this.cartItems[index]);
    this.calculateOrderAmount();
    // this.cartItems[index].discountAmount = discount;

  }
  async addToCart(item: any) {
    this.productService.addItemToCart(item);
    this.calculateOrderAmount();
  }
  calculateOrderAmount() {
    this.order = this.productService.calculateOrderAmount(this.cartItems);
  }
  async getPresList() {
    let list = await this.storageService.getObject('presData');
    if (list) {
      this.presList = list;
    } else {
      this.presList = [];
    }
  }
  async openPresModal() {
    const modal = await this.modalController.create({
      component: UploadPrescriptionComponent,
      componentProps: {
        "modalData": {},
        "headerVaue": "Upload Prescription"
      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        this.getPresList();
      });
    return await modal.present();
  }
  goToHome() {
    this.coreUtilServie.gotoPage('tab/home2');
  }
  goToCheckout() {
    this.coreUtilServie.gotoPage('order-summary');
  }
  removePres(index) {
    this.presList.splice(index, 1)
    this.storageService.setObject('presData', JSON.stringify(this.presList));
  }
  async openSearch() {
    this.modelServie.openSearchModal(ProductSearchComponent);
  }
  removeCartItem(index) {
    this.cartItems.splice(index, 1);
    this.storageService.setObject('cartData', JSON.stringify(this.cartItems));
    this.productService.setCartCounter();

  }

}
