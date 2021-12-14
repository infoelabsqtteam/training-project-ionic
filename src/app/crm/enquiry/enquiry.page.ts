import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.page.html',
  styleUrls: ['./enquiry.page.scss'],
})
export class EnquiryPage implements OnInit {
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
