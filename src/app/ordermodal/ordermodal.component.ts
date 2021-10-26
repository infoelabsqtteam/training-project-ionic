import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController, NavParams  } from '@ionic/angular';


@Component({
  selector: 'app-ordermodal',
  templateUrl: './ordermodal.component.html',
  styleUrls: ['./ordermodal.component.scss'],
})
export class OrdermodalComponent implements OnInit {
  @Input() modalData:any;
  @Input() modal: any;
  // modalTitle: string;
  // modelId: number;

  constructor(private modalController:ModalController, private navParams: NavParams) { }

  ngOnInit() { 
    const modalState = {
      modal : true,
      desc : 'fake state for our modal'
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
  // async closeModal() {
  //   const onClosedData: string = "Wrapped Up!";
  //   await this.modalController.dismiss(onClosedData);
  // }
  closeModal(){
    this.modal.dismiss();
  }
  


}
