import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@core/ionic-core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private notificationService:NotificationService) { }

  ngOnInit() {
  }

  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...');
  }
}
