import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { StorageService, LoaderService, RestService } from '@core/ionic-core';



@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  name: string;
  productList: any = [];
  cart_count: number = 0;
  constructor(
    private modalCtrl: ModalController, 
    private loader: LoaderService, 
    private storageService: StorageService, 
    private restService: RestService, 
    private platform: Platform) {

  }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
  }
  ionViewWillEnter() {

  }
  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }
  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }


}
