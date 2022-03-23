import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-layout',
  templateUrl: './cards-layout.component.html',
  styleUrls: ['./cards-layout.component.scss'],
})
export class CardsLayoutComponent implements OnInit {

  @Input() cardType:any;

  constructor() { }

  ngOnInit() {}

  

}
