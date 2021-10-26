import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PickerController } from "@ionic/angular";
import { PickerOptions } from "@ionic/core";
import { take } from 'rxjs/operators';
import { RestService, StorageService, LocationAddress, ProductService, App_googleService, CoreUtilityService } from '@core/ionic-core';



@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  substituteList: any = [];
  list: any = [];
  product_detais: any = {};
  item_detais: any;
  cartItem: any = {};
  currentLocation: LocationAddress
  add_to_cart: boolean = false;
  slideOptsTwo = {
    initialSlide: 1,
    slidesPerView: 2.1,
    loop: true,
    spaceBetween: 15
  };
  slideOptsOne = {
    initialSlide: 1,
    slidesPerView: 2.1,
    loop: true,
    spaceBetween: 15
  };
  constructor(
    private restService: RestService, 
    private storageService: StorageService, 
    private pickerController: PickerController,
    private productService:ProductService,
    private googlService:App_googleService,
    private coreUtilService:CoreUtilityService
  ) { }

  ngOnInit() {
    this.list = [
      'assets/newdesign/Image 13@2x.png',
      'assets/newdesign/NoPath - Copy (5)@2x.png',
    ];
    this.productService.getProduct().pipe(take(1),).subscribe(resp => {
      this.product_detais = resp;
      this.product_detais.mediceaId = resp._id
      this.getStockItem(this.product_detais);
      this.searchProductSubstitute(resp._id);
    })
    this.googlService.location.subscribe(data => {
      if (data) {
        this.currentLocation = data;
      }
    })
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
  async selectQty() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            console.log(value);
            this.cartItem.quantity = value.qty.text;
          }
        }
      ],
      columns: [{
        name: 'qty',
        options: this.getQty()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }
  getQty() {
    let options = [];
    if (this.item_detais && this.item_detais.quantity) {
      let qty = Number(this.item_detais.quantity);
      for (let i = 0; i < qty; i++) {
        let no = i + 1;
        options.push({ value: "qty", text: String(no) });
      }
    }
    return options;
  }
  addToCart() {
    this.cartItem.name = this.item_detais.item_name;
    this.cartItem.mrp = this.item_detais.mrp;
    this.cartItem.packaging = this.item_detais.packaging;
    this.cartItem.store1 = this.item_detais.name;
    this.cartItem.price = parseFloat(this.cartItem.mrp) * this.cartItem.quantity;
    this.productService.addItemToCart(this.cartItem);
    //this.commonUtil.gotoPage('tab/cart-items');
  }
  async getStockItem(item) {
    let log = await this.storageService.getUserLog();
    let obj = {
      crList: [],
      key1: "MCLR01",
      key2: "CRM",
      data: item,
      log: log,
      pageNo: 0,
      pageSize: 100,
      value: "item_from_stock"
    }
    let api = `${this.coreUtilService.baseUrl('GET_GRID_DATA')}/null`;
    this.restService.postApiMethod(api, obj).subscribe((resp) => {
      if (resp['data'] && resp['data'].length > 0) {
        this.item_detais = resp['data'][0];
        this.add_to_cart = true;
        if (this.item_detais.quantity) {
          this.cartItem.quantity = "1";
        }
      }
    }, (err: HttpErrorResponse) => {
      //this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })
  }
  searchProductSubstitute(mediceaId) {
    let api = `${this.coreUtilService.baseUrl('PRODUCT_SUBSTITUTE')}`;
    let obj = { mediceaId: mediceaId }
    this.restService.postApiMethod(api, obj).subscribe((resp) => {
      if (resp['data'] && resp['data'].length > 0) {
        this.substituteList = resp['data'];
      }
    }, (err: HttpErrorResponse) => {
      //this.storageService.presentToast(err.error)
      console.log(err.error);
      // console.log(err.name);
      // console.log(err.message);
      // console.log(err.status);
    })
  }
  viewProduct(item) {
    this.product_detais = item;
    this.getStockItem(item);
    this.searchProductSubstitute(item.mediceaId);
  }

}
