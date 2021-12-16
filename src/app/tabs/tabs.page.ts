import { Component, OnInit } from '@angular/core';
import { StorageService } from '@core/ionic-core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private storageService:StorageService,) { }

  ngOnInit() {
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }
}
