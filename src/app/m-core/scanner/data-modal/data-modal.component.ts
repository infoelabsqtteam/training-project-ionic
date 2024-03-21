import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-data-modal',
  templateUrl: './data-modal.component.html',
  styleUrls: ['./data-modal.component.scss'],
})
export class DataModalComponent implements OnInit {
  @Input() data;
  @Input() modal;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log("data :", this.data)
  }
  dismissModal(role?:any){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss(this.data,role);
    }else{
      let Cmodal = this.modalController.getTop();
    }
  }

}
