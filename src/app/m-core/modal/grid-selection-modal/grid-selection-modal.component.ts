import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GridSelectionDetailModalComponent } from '../grid-selection-detail-modal/grid-selection-detail-modal.component';

@Component({
  selector: 'app-grid-selection-modal',
  templateUrl: './grid-selection-modal.component.html',
  styleUrls: ['./grid-selection-modal.component.scss'],
})
export class GridSelectionModalComponent implements OnInit {

  @Input() Data : any;
  @Input() modal: any;

  
  // test array
  data :any =
      [
          {"cardType":"demo","company_name":"abc pvt ltd","final_amount":0.00,"quotation_no":"B01-220405RQ00001","contact_person":"Aggregate Bedding Sand 2","mobile":"3887722","email":"jhduy@gmail.com","address1":"patel nagar/delhi","country":"india","state":"Delhi","department_name":"building","class_name":"test"}
      ]

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  async addremoveparticipant(){
    const modal = await this.modalController.create({
      component: GridSelectionDetailModalComponent,
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
