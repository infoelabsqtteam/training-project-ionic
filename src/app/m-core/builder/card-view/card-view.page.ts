import { Component, OnInit, Optional, OnDestroy} from '@angular/core';
import { EnvService, StorageService, ApiService, RestService, CoreUtilityService, DataShareService, CommonDataShareService } from '@core/ionic-core';
import { Platform, ModalController, IonRouterOutlet} from '@ionic/angular';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.page.html',
  styleUrls: ['./card-view.page.scss'],
})

export class CardViewPage implements OnInit, OnDestroy {

    //common function
    cardList: any = [];
    selectedIndex= -1;
    tabMenu: any = [];
    cardListSubscription:any;
    columnList: any = [];
    carddata: any;
    cardtitle: any;
    cardType = "summary"; //default cardtype
    childColumns : any;
    childColumn: any = {};
    filterForm: FormGroup;
    createFormgroup: boolean = true;
    collectionname: any;
  
    card:any={};
    data :any ={};
  
    // new var
    gridDataSubscription: any;
    
    
    constructor(
      private storageService: StorageService,
      private coreUtilityService :CoreUtilityService,
      private commonDataShareService:CommonDataShareService,
      public modalController: ModalController,
      @Optional() private readonly routerOutlet?: IonRouterOutlet,
    ) 
    {
      
    }
  
    ionViewWillEnter(){
      this.load();
    }

    ngOnInit() {    
      // this.router.events.pipe(
      //   filter((event: RouterEvent) => event instanceof NavigationEnd)
      // ).subscribe(() => {
      //   const index = this.commonDataShareService.getSelectdTabIndex();
      //   this.getCardDataByCollection(index);      
      // });
    }
  
    load(){
      this.carddata = [];
      const index = this.commonDataShareService.getSelectdTabIndex();
      this.getCardDataByCollection(index);
    }
  
    resetVariables(){
      this.card = {}
    }
  
    ngOnDestroy(): void {
      this.resetVariables();
      if (this.cardListSubscription) {
        this.cardListSubscription.unsubscribe();
      }
      if (this.gridDataSubscription) {
        this.gridDataSubscription.unsubscribe();
      }
    }
  
    private getCardDataByCollection(i) {
      const cardWithTab = this.coreUtilityService.getCard(i); 
      if(cardWithTab && cardWithTab.card){
        this.card = cardWithTab
        ;
      }     
    }
    
    comingSoon() {
      this.storageService.presentToast('Comming Soon...');
    }
  
  }