import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SocialOptionComponent } from '../social-option/social-option.component';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.page.html',
  styleUrls: ['./contact-details.page.scss'],
})
export class ContactDetailsPage implements OnInit {

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
  constructor(public popoverController: PopoverController) {}

  ngOnInit() {
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

}
