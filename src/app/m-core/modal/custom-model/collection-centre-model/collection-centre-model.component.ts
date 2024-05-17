import { Component, Input, OnInit } from '@angular/core';
import { AppStorageService, NotificationService } from '@core/ionic-core';
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
  @Input()
  private data:any;

  collectionCenterList:any = {}
  // staticData:any={};
  selectedCenter:any={};
  sampleFormDate:any=[{name:"F012",checked:false},{name:"F015",checked:false},{name:"F066",checked:false}];
  // staticDataSubscriber:Subscription
  constructor(
    private readonly popoverModalService: PopoverModalService,
    private alertController:AlertController,
    private apiService:ApiService,
    private apiCallService:ApiCallService,
    private dataShareService:DataShareService,
    private notificationService:NotificationService,
    private appStorageService: AppStorageService,
  ) {
    // this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
    //   console.log(data);
    //   // this.setStaticData(data);
    // });
   }

  ngOnInit() {
    this.onLoadSetData();
  }
  onLoadSetData(){
    if(this.data?.['collection_center_list']){
      this.collectionCenterList = this.data?.['collection_center_list']
      if(this.collectionCenterList.length>0)this.selectedCenter=this.collectionCenterList[0];
    }
    // this.staticData.collection_centre=[
    //   {
    //     "name": "Delhi",
    //     "_id": "1",
    //     "latitude": 28.704063,
    //     "longitude": 74.54
    //   },
    //   {
    //     "name": "Nagpur",
    //     "_id": "2",
    //     "latitude": 28.704063,
    //     "longitude": 74.54
    //   },
    //   {
    //     "name": "Lucknow",
    //     "_id": "3",
    //     "latitude": 28.704063,
    //     "longitude": 74.54
    //   },
    //   {
    //     "name": "Noida",
    //     "_id": "4",
    //     "latitude": 28.704063,
    //     "longitude": 74.54
    //   },
    //   {
    //     "name": "Punjab",
    //     "_id": "5",
    //     "latitude": 28.704063,
    //     "longitude": 74.54
    //   }
    // ]
  }

  public async closeModal(role?:string): Promise<void> {
    if(Object.keys(this.selectedCenter).length != 0 || role == 'close'){
      if(role=='NAVIGATE')this.setLeaveDateTime();
      if(this.modal && this.modal?.offsetParent['hasController']){
        this.modal?.offsetParent?.dismiss({
            'dismissed': true,
            'data':this.selectedCenter,
        },role);
      }else{        
        this.popoverModalService.dismissModal({
          'data': this.selectedCenter,
        },role);
      }
    }else if(role=='submit'){
      this.notificationService.presentToast("Please select collection center")
    }
  }
  async setLeaveDateTime() {
    let leaveDateAndTime=this.getDateAndTime();
    let time=JSON.parse(await this.appStorageService.getObject('leaveDateAndTime'));
    if(!time){
      this.appStorageService.setObject('leaveDateAndTime',leaveDateAndTime);
    }
  }
  getDateAndTime(){
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let amOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12) || 12; 
    let minutes = currentDate.getMinutes().toString().padStart(2, '0'); 
    let formattedTime = hours + ":" + minutes + " " + amOrPm;
    return {
      leaveDate:currentDate.toISOString(),
      leaveTime:formattedTime
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
  selectedCollectionCenter(selectedData:any){
    this.selectedCenter = selectedData;
  }

}
