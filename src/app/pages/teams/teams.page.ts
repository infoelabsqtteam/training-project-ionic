import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService, StorageService } from '@core/ionic-core';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { DataService } from 'src/app/api/data.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {

  // get local data of card
  web_site_name:string='';
  carddata: any;


  // get local serv data
  // apiurl: "https://uatserverqualiteklab.e-labs.ai/rest/";
  teamsdata: any;
  teamsList: any = [];
  cardType: 'card1'; //default cardtype = card1
  filterTerm: string;

  constructor(    
    private platform: Platform,
    private envService: EnvService,
    private http: HttpClient,
    private storageService: StorageService,
    private dataService: DataService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
    private datePipe: DatePipe
  ) 
  {
    this.initializeApp();
    
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }

  ngOnInit() {

    fetch('./assets/data/card_data_teams.json').then(res => res.json())
      .then(json => {
        this.teamsList = json.fields;
        this.cardType = json.card_type;
      });

    // get local card data and store in cadrdata
      fetch('./assets/data/cards.json').then(res => res.json())
      .then(json => {
        this.carddata = json;
        console.log(this.carddata);
      });
  }
  mailTo(){
    console.log("Mail Function");
  }

}
function ngOnInit() {
  throw new Error('Function not implemented.');
}

