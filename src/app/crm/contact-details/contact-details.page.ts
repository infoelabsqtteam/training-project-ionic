import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService, StorageService } from '@core/ionic-core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ModalController, PopoverController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { SocialOptionComponent } from '../social-option/social-option.component';
import { SmsRetriever } from '@ionic-native/sms-retriever'

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.page.html',
  styleUrls: ['./contact-details.page.scss'],
})
export class ContactDetailsPage implements OnInit {

  childData: any = {};
  tabMenu: any =[];
  result: any;
  childDataTitle: any;
  childLastName: any;
  designation: any;
  profileText: string;
  personName: string;
  mobile: number;
  selectedIndex=-1;
  cardType='';

  enquirydata = [
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'},
    {'enquiry': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'enqno': 'ENQ-15', 'enqdate': 'ENQ-15'}
  ]

  constructor(public popoverController: PopoverController, private modalController: ModalController,
    
    private dataShareService:DataShareServiceService,
    private envService: EnvService,
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router,
    private currencyPipe: CurrencyPipe,
    private callNumber: CallNumber,) {}

  ngOnInit() {
    this.childData = this.dataShareService.getchildCardData();
    this.tabMenu= this.childData.childtabmenu;
    this.childDataTitle = this.childData.childdata.first_name;
    this.cardType = this.childData.childcardtype.name;
    this.childLastName = this.childData.childdata.last_name;
    if(this.childDataTitle !=='' && this.childLastName !==''){
      this.profileText = this.childDataTitle[0] + this.childLastName[0];
      this.personName = this.childDataTitle + " " + this.childLastName;
    }else{
      this.profileText =this.childDataTitle[0];
      this.personName = this.childDataTitle;
    }
    this.designation = this.childData.childdata.designation;
    this.mobile = this.childData.childdata.mobile;
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: SocialOptionComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  call(providerNumber: any) {
    this.callNumber.callNumber(providerNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
      console.log(providerNumber);
  }
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    this.router.navigate(['crm/quotation']);
    this.dataShareService.setcardData(card);
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
