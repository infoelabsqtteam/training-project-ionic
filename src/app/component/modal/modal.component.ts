import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() modalData:any;
  @Input() lastName:string;
  @Input() modal: any;

  constructor(private modalCtrl:ModalController) {  }

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
  
_dismiss(){
  this.modal.dismiss();
}

}
