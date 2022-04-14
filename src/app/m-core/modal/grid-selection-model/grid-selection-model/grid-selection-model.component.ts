import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalDetailCardComponent } from 'src/app/m-core/common-component/modal-detail-card/modal-detail-card.component';

@Component({
  selector: 'app-grid-selection-model',
  templateUrl: './grid-selection-model.component.html',
  styleUrls: ['./grid-selection-model.component.scss'],
})
export class GridSelectionModelComponent implements OnInit {

  data:any;
  
  @Input() Data : any;
  @Input() modal: any;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  async addremoveparticipant(){
    const modal = await this.modalController.create({
      component: ModalDetailCardComponent,
      componentProps: {
        "Data": this.data,
        "childCardType" : "demo1"
      },
      swipeToClose: false
    });
    modal.componentProps.modal = modal;
    return await modal.present();
  }
  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

}
