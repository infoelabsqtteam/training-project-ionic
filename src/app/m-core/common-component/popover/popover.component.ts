import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  @Input() data:any;
  @Input() popover:any;
  @Input() triggerId:any;
  @Output() popoverOutput= new EventEmitter();
  items:any;

  constructor() { 
    this.items = [{"label":"Travel management"},{"label":"Travel Report"}];
  }

  ngOnInit() {}
  selectedItem(item:any){
    ///console.log(item);
    let popoverdata = item.label
    this.popoverOutput.emit(popoverdata);
  }

}
