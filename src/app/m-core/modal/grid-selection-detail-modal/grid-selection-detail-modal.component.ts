import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-grid-selection-detail-modal',
  templateUrl: './grid-selection-detail-modal.component.html',
  styleUrls: ['./grid-selection-detail-modal.component.scss'],
})
export class GridSelectionDetailModalComponent implements OnInit {
  
  @Input() childCardType: any;
  @Input() Data: any;
  @Input() modal: any;

  cardType:any;
  columnlistNew :any;


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}
  
  ionViewWillEnter(){
    this.cardType = this.childCardType;
    this.columnlistNew = this.Data[0];
  }
  ionViewDidEnter(){}
  ionViewWillLeave(){}  
  ionViewDidLeave(){}

  
  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

}
