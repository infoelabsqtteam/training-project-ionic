import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ProductSearchComponent } from '../../component/product-search/product-search.component';
import { ProductService, StorageService, RestService, CoreUtilityService, LoaderService, ModelService, GallaryService } from '@core/ionic-core';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
})
export class CategoryListPage implements OnInit {
  categoryByProductList: any = [];
  cart_count: number = 0;
  order: any = {};
  cartItems: any = [];
  addOrRemoveQty: boolean = false;
  slideOptsTwo = {
    initialSlide: 1,
    slidesPerView: 2.1,
    loop: true,
    spaceBetween: 15
  };
  constructor(
    private productService:ProductService, 
    private storageService: StorageService, 
    private restService: RestService,
    private coreUtilService:CoreUtilityService,
    private loaderService:LoaderService,
    private modelService:ModelService,
    private galleryService:GallaryService
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.productService.getCartCounter().subscribe(counter => {
      this.cart_count = counter;

    })
    this.getProductByCategory();
    this.cartItems = await this.storageService.getObject('cartData');
    this.calculateOrderAmount();

  }
  goToHome() {
    this.coreUtilService.gotoPage('/tab/home2');
  }
  async getProductByCategory() {
    this.loaderService.showImageLoader(null);
    let log = await this.storageService.getUserLog();
    let obj = {
      crList: [],
      key1: "MCLR01",
      key2: "CRM",
      log: log,
      pageNo: 0,
      pageSize: 100,
      value: "stock_master"
    }
    this.productService.getProductByCategory(obj).subscribe(resp => {
      this.loaderService.hideLoader();
      if (resp['data'] && resp['data'].length > 0) {
        this.categoryByProductList = resp['data'];
        if ((this.cartItems && this.cartItems.length > 0) && (this.categoryByProductList && this.categoryByProductList.length > 0))
          this.cartItems.forEach(element => {
            this.categoryByProductList.forEach((category, index) => {
              if (element.name._id === category.item_name._id) {
                this.categoryByProductList[index].addQuantity = true;
                this.categoryByProductList[index].quantity = element.quantity;

              }
            });
          });
      }
    }, (err: HttpErrorResponse) => {
      this.loaderService.hideLoader();
      console.log(err.error);
    })
  }

  async addToCart(index) {
    let cartItem: any = {};
    cartItem.name = this.categoryByProductList[index].item_name;
    this.categoryByProductList[index].quantity = 1;
    cartItem.mrp = this.categoryByProductList[index].mrp;
    cartItem.packaging = this.categoryByProductList[index].packaging;
    cartItem.store1 = this.categoryByProductList[index].name;
    cartItem.quantity = this.categoryByProductList[index].quantity;
    cartItem.price = parseFloat(this.categoryByProductList[index].mrp) * cartItem.quantity;
    this.categoryByProductList[index].addQuantity = true;
    this.productService.addItemToCart(cartItem);
    setTimeout(async () => {
      this.cartItems = await this.storageService.getObject('cartData');
      this.calculateOrderAmount();
    }, 800);


  }
  async openSearch() {
    this.modelService.openSearchModal(ProductSearchComponent);
  }

  async removeQuantity(index) {
    this.cartItems = await this.storageService.getObject('cartData');
    let cartIndex = this.cartItems.findIndex(item => item.name._id === this.categoryByProductList[index].item_name._id);
    if (cartIndex === -1) {
      return;
    }
    if (this.categoryByProductList[index].quantity === 1) {
      this.categoryByProductList[index].addQuantity = false;
      this.cartItems.splice(cartIndex, 1);
      //if (this.cartItems && this.cartItems.length)
      this.storageService.setObject('cartData', JSON.stringify(this.cartItems));
      this.calculateOrderAmount();
      this.productService.setCartCounter();
      return;
    }

    this.categoryByProductList[index].quantity = this.categoryByProductList[index].quantity - 1;
    this.cartItems[cartIndex].quantity = this.categoryByProductList[index].quantity;
    this.cartItems[cartIndex].price = parseFloat(this.categoryByProductList[index].mrp) * this.categoryByProductList[index].quantity;
    this.productService.addItemToCart(this.cartItems[cartIndex]);
    this.calculateOrderAmount();
  }
  async addQuantity(index) {
    this.cartItems = await this.storageService.getObject('cartData');
    let cartIndex = this.cartItems.findIndex(item => item.name._id === this.categoryByProductList[index].item_name._id);
    this.categoryByProductList[index].quantity = this.categoryByProductList[index].quantity + 1;
    this.cartItems[cartIndex].quantity = this.categoryByProductList[index].quantity;
    this.cartItems[cartIndex].price = parseFloat(this.categoryByProductList[index].mrp) * this.cartItems[cartIndex].quantity;
    this.productService.addItemToCart(this.cartItems[cartIndex]);
    this.calculateOrderAmount();

  }
  calculateOrderAmount() {
    this.order = this.productService.calculateOrderAmount(this.cartItems);
  }
  getImageFromGallery(){
    this.galleryService.getImageFromGallery();
  }
  clickPicture(){
    this.galleryService.clickPicture();
  }

}
