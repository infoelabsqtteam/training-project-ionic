import { Component, OnInit } from '@angular/core';
import * as appConstants from '../shared/app.constants';

@Component({
  selector: 'app-lead-reminder-tab',
  templateUrl: './lead-reminder-tab.page.html',
  styleUrls: ['./lead-reminder-tab.page.scss'],
})
export class LeadReminderTabPage implements OnInit {

  web_site_name:string='';
  constructor() {
    this.web_site_name = appConstants.siteName;
   }

  ngOnInit() {
  }

}
