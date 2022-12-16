import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid-info',
  templateUrl: './grid-info.component.html',
  styleUrls: ['./grid-info.component.scss'],
})
export class GridInfoComponent implements OnInit {

  @Input() Data:any;
  @Input() modal: any;
  infoData:any;


  constructor() {
  }

  ngOnInit() {
    if(this.Data){
      if(this.Data.value && this.Data.value.data && this.Data.value.data.length > 0){
        this.infoData = this.Data.value.data;
      }

    }
    
// if(this.Data){
    //   if(this.Data.value && this.Data.value.data && this.Data.value.data.length > 0){
    //     this.value = this.Data.value.data;
    //   }
    //   if(this.Data.field !=null){
    //     this.field = this.Data.field;
    //   }
    //   if(this.Data.index !=null){
    //     this.index = this.Data.index;
    //   }
    //   if(this.Data.field_name !=null){
    //     this.fieldName = this.Data.field_name;
    //   }
    //   if(this.Data.editemode !=null){
    //     this.fieldName = this.Data.editemode;
    //   }
      
    // }
  }

  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }


}
