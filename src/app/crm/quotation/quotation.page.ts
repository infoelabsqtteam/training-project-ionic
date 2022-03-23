import { Component, OnInit} from '@angular/core';
import { EnvService, StorageService } from '@core/ionic-core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})

export class QuotationPage implements OnInit {
  
  
  constructor(
    private platform: Platform,
    private envService: EnvService,
    private storageService: StorageService,
  ) 
  {
    
  }

  ngOnInit() {

  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }
  

}
