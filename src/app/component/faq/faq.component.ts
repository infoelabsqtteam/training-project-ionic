import { Component, OnInit } from '@angular/core';
import { CoreUtilityService } from '@core/ionic-core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {

  constructor(public coreUtilServie: CoreUtilityService) { }

  ngOnInit() { }

  goToHome() {
    this.coreUtilServie.gotoPage('tab/home2');
  }

}
