import { Component, Input, OnInit } from '@angular/core';
import { DataShareService,ApiCallService,ApiService } from '@core/web-core';
import { AlertController } from '@ionic/angular';
import { element } from 'protractor';
import { Subscription } from 'rxjs';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';
@Component({
  selector: 'app-collection-centre-model',
  templateUrl: './collection-centre-model.component.html',
  styleUrls: ['./collection-centre-model.component.scss'],
})
export class CollectionCentreModelComponent implements OnInit {

  @Input()
  public modal:any;

  staticData:any={};
  selectedCenter:any='';
  sampleFormDate:any=[{name:"F012",checked:false},{name:"F015",checked:false},{name:"F066",checked:false}];
  staticDataSubscriber:Subscription
  constructor(
    private readonly popoverModalService: PopoverModalService,
    private alertController:AlertController,
    private apiService:ApiService,
    private apiCallService:ApiCallService,
    private dataShareService:DataShareService,
  ) {
    this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
      console.log(data);
      // this.setStaticData(data);
    });
   }

  ngOnInit() {
    console.log("collection");
    this.staticData.collection_centre=[{"name": "Delhi"},
      {
        "name": "Nagpur",
      },
      {
        "name": "Lucknow",
      },
      {
        "name": "Noida",
      },
      {
        "name": "Punjab",
      }
    ]
  }

  public async closeModal(value?: any): Promise<void> {
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({
          'dismissed': true,
          'value':value
      });
    }else{        
      this.popoverModalService.dismissModal({
        value: value,
      });
    }
  }

  setValue(arg0: string,arg1: any,arg2: boolean) {
    throw new Error('Method not implemented.');
  }

  inputOnChangeFunc(parent,field) {
    if(parent && parent != '' && parent.field_name && parent.field_name != ""){
      field['parent'] = parent.field_name;
    }
  }

  selectAll(e:any){
    console.log(e);
    this.sampleFormDate.forEach((element)=>{element.checked=!e?.target?.checked})
  }

  submit(){
    console.log(this.sampleFormDate);
  }

}
