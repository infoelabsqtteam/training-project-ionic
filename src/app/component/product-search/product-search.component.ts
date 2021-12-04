import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { CoreUtilityService, ProductService, RestService, StorageService, EnvService } from '@core/ionic-core';


@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.scss'],
})
export class ProductSearchComponent implements OnInit {
  @ViewChild('autofocus', { static: false }) searchbar: IonSearchbar;
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  name: string;
  productList: any = [];
  cart_count: number = 0;
  autocompleteItems: any = [];
  constructor(
    private modalCtrl: ModalController, 
    private renderer: Renderer2, 
    private elementRef: ElementRef,
    private coreUtilService:CoreUtilityService,
    private productService: ProductService,
    private restService:RestService,
    private storageService:StorageService,
    private envService: EnvService
  ) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
  }
  ionViewWillEnter() {
    setTimeout(() => this.searchbar.setFocus(), 800);
    this.productService.getCartCounter().subscribe(counter => {
      this.cart_count = counter;
    })
  }

  ngOnDestroy() {
    console.log('ondestroy');
    if (window.history.state.modal) {
      history.back();
    }
  }

  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    console.log('modal back button');
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }

  goToHome() {
    this._dismiss();
    this.coreUtilService.gotoPage('tab/home2');
  }
  async searchProduct(name) {
    if (name && name.length > 3) {
      let api = `${this.envService.baseUrl('MED_SEARCH')}`;

      let criteria: any = { alternateName: name, }
      let log = await this.storageService.getUserLog();
      criteria.log = { userId: log.userId, clientId: "MEDI151" };
      this.restService.postApiMethod(api, criteria).subscribe(resp => {
        if (resp) {
          this.productList = resp;
        }
      }, (err: HttpErrorResponse) => {
        //this.storageService.presentToast(err.error)
        console.log(err.error);
        // console.log(err.name);
        // console.log(err.message);
        // console.log(err.status);
      })
    }
  }

  async getStockItem(item: any) {
    this.productService.setProduct(item);
    this._dismiss();
    this.coreUtilService.gotoPage('product-details');
  }
  goToCart() {
    this._dismiss();
    this.coreUtilService.gotoPage('tab/cart-items');
  }
  onClose(name){
    console.log(name);
  }
}
