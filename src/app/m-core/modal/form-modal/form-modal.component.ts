import { Component, Input, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'lib-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {
  @Input() data:Data;

  constructor() { }

  ngOnInit() {
  }

  

}
