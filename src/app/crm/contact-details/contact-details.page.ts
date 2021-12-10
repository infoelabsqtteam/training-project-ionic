import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

}
