import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  modal: any;
  userdata = [
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'},
    {'name': 'Amit Tomer', 'profile': 'Project Manager', 'company': 'E-Labs', 'mobile': '9205280930'}
  ]
 
  constructor(private router: Router,) { }

  ngOnInit() {
  }
}
