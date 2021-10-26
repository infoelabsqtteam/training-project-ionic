import { HttpErrorResponse } from '@angular/common/http';
import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { CoreUtilityService,RestService, ProductService } from '@core/ionic-core';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.page.html',
  styleUrls: ['./item-search.page.scss'],
})
export class ItemSearchPage implements OnInit {
  allProducts: any = [];
  name: string;
  value = 1;
  constructor(
    private restService: RestService, 
    private coreUtilService:CoreUtilityService ,
    private productService:ProductService
  ) {}

  ngOnInit() {
  }

  plus(item: any, index: number) {
    this.allProducts[index].qty = this.allProducts[index].qty + 1;
    let price = parseFloat(this.allProducts[index].mrp) * this.allProducts[index].qty;
    this.allProducts[index].discount = 10;
    let discount = (10 * price) / 100;
    this.allProducts[index].price = price;
    this.allProducts[index].discountAmount = discount;
  }
  minus(item: any, index: number) {
    if (this.allProducts[index].qty === 0) {
      return;
    }
    this.allProducts[index].qty = this.allProducts[index].qty - 1;
    let price = parseFloat(this.allProducts[index].mrp) * this.allProducts[index].qty;
    this.allProducts[index].discount = 10;
    let discount = (10 * price) / 100;
    this.allProducts[index].price = price;
    this.allProducts[index].discountAmount = discount;
  }

  onChangeValue(param) {
    if (param && param.length > 2) {
      let obj = {
        crList: [{ fName: "name", fValue: param, operator: "stwic" }],
        key1: "MCLR01",
        key2: "ECOM",
        log: { userId: "vksh6623@gmail.com", appId: "ECOM", refCode: "MCLR01" },
        pageNo: 0,
        pageSize: 100,
        value: "items_master"
      }
      let api = `${this.coreUtilService.baseUrl('GET_GRID_DATA')}/null`;
      this.restService.postApiMethod(api, obj).subscribe(success => {
        console.log(success);
        if ('data' in success) {
          this.allProducts = success['data'];
          this.allProducts.forEach(element => {
            element.qty = 0;
          });
        } else {
          this.allProducts = [];
        }
      },
        (err: HttpErrorResponse) => {
          console.log(err.error);
          // console.log(err.name);
          // console.log(err.message);
          // console.log(err.status);
        }

      )
    } else {
      this.allProducts = [];
    }
  }
  onClose(param) {
    param = "";
    this.allProducts = [];
  }

  async addToCart(item: any) {
    this.productService.addItemToCart(item);
  }

}
