import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { HttpHeaders, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { AuthService, StorageService, LoaderService } from '@core/ionic-core';

@Component({
  selector: 'app-quotation-amount',
  templateUrl: './quotation-amount.component.html',
  styleUrls: ['./quotation-amount.component.scss'],
})
export class QuotationAmountComponent implements OnInit {

  @Input() modalData: any;
  @Input() modal: any;
  name: any;
  searchData: any = [];
  constructor(private modalCtrl: ModalController,
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private http: HttpClient,) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
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

  saveQuotationAmount(modalData) {
    this.modal.dismiss(this.modalData);
  }
  caculateAmount(event, param) {
    let net_amount = 0;
    if (this.modalData.parameter_quantum && param == "parameter_quantum") {
      this.modalData['quantum_rate'] = (+this.modalData.quotation_rate) * (+this.modalData.parameter_quantum);
      this.modalData['quotation_effective_rate'] = (+this.modalData.qty) * (+this.modalData.quantum_rate);
      net_amount = +this.modalData.quotation_effective_rate
      if (this.modalData.discount_percent) {
        let discount = ((+this.modalData.quotation_effective_rate) * (+this.modalData.discount_percent)) / 100;
        this.modalData['discount_amount'] = discount;
        net_amount = (+this.modalData.quotation_effective_rate) - discount;
      }

      this.modalData['net_amount'] = net_amount
    }
    if (this.modalData.qty && param == "qty") {
      this.modalData['quotation_effective_rate'] = (+this.modalData.qty) * (+this.modalData.quantum_rate);
      net_amount = +this.modalData.quotation_effective_rate
      if (this.modalData.discount_percent) {
        let discount = ((+this.modalData.quotation_effective_rate) * (+this.modalData.discount_percent)) / 100;
        this.modalData['discount_amount'] = discount;
        net_amount = (+this.modalData.quotation_effective_rate) - discount;
      }
      // if(data.discount_amount){
      //   net_amount = data.quotation_effective_rate-data.discount_amount;
      // }
      this.modalData['net_amount'] = net_amount
    }

    if ((this.modalData.discount_percent == 0 && param == "discount_percent") || (this.modalData.discount_percent && param == "discount_percent")) {
      let discount = ((+this.modalData.quotation_effective_rate) * (+this.modalData.discount_percent)) / 100;
      net_amount = (+this.modalData.quotation_effective_rate) - discount;
      this.modalData['discount_amount'] = discount;
      this.modalData['net_amount'] = net_amount
    }

    if ((this.modalData.discount_amount == 0 && param == "discount_amount") || (this.modalData.discount_amount && param == "discount_amount")) {
      net_amount = (+this.modalData.quotation_effective_rate) - (+this.modalData.discount_amount);
      let discount_per = ((+this.modalData.discount_amount) * 100) / (+this.modalData.quotation_effective_rate);
      this.modalData['net_amount'] = net_amount;
      this.modalData['discount_percent'] = discount_per
    }

  }

}
