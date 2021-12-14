import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-quotation',
  templateUrl: './contact-quotation.page.html',
  styleUrls: ['./contact-quotation.page.scss'],
})
export class ContactQuotationPage implements OnInit {
  quotationdata = [
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
    {'quotation': 'Uera', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'},
  ]
  constructor() { }

  ngOnInit() {
  }

}
