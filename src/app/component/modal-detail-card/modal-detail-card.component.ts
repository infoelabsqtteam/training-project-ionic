import { Component, Input, OnInit } from '@angular/core';
import { CoreUtilityService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-detail-card',
  templateUrl: './modal-detail-card.component.html',
  styleUrls: ['./modal-detail-card.component.scss'],
})
export class ModalDetailCardComponent implements OnInit {

  cardType = "detail1";

  @Input() childColumns:any;
  @Input() childDataTitle:any;
  @Input() childData: any;
  @Input() childCardType: any;
  @Input() modal: any;
  
  constructor(
    private modalController: ModalController,
    private coreUtilityService: CoreUtilityService
    ) { }

    
  ngOnInit() {
    if(this.childCardType && this.childCardType.name !=''){
      this.cardType = this.childCardType.name
    }
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }
  
  getValueForGrid(field,object){
    return this.coreUtilityService.getValueForGrid(field,object);
  }
  
  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

  ngOnDestroy() { }

}
