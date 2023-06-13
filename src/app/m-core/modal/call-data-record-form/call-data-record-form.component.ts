import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, CoreFunctionService, DataShareService, NotificationService } from '@core/ionic-core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { IonDatetime } from '@ionic/angular';
import { format, parseISO, getDate, getMonth, getYear, getTime } from 'date-fns';

@Component({
  selector: 'app-call-data-record-form',
  templateUrl: './call-data-record-form.component.html',
  styleUrls: ['./call-data-record-form.component.scss'],
})
export class CallDataRecordFormComponent implements OnInit {

  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;

  @Input() cardData: any;
  @Input() selectedIndex:any;
  @Input() startTime:any;
  @Input() modal: any;
  
  cdrForm: FormGroup;
  followupDate:any='';
  followupTime:any='';
  contactNumber:any;
  contactName:any;
  saveResponceSubscription:any;
  saveResponceData:any={};
  mobileList:boolean=false;

  statusList = [
    { val: 'Active'},
    { val: 'Inactive'},
    { val: 'Implementation'},
    { val: 'Quotation'},
    { val: 'Follow-up'},
    { val: 'NotInterested'},
    { val: 'New'},
    { val: 'Not Answered'},
    { val: 'Busy'}
  ];

  constructor(    
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private dataShareService:DataShareService,
    private notificationService: NotificationService,
    private callNumber: CallNumber,
    private coreFunctionService: CoreFunctionService
  ) {
    
    this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
      this.setSaveResponce(responce);
    });

   }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.cdrForm = this.formBuilder.group({
      // accountname: [''],
      // contactname: [''],
      // contacttype: [''],
      // contactnumber: [''],
      // callstarttime: [''],
      // calldate: [''],
      // calldurationtime: [''],
      description: [''],
      leadstatus: [''],
      followupdate: [''],
      followuptime: [''],
    });
    
    this.setData();
  }

  setData(){
    if(this.coreFunctionService.isNotBlank(this.cardData?.mobile) && this.cardData?.mobile.length > 0){
      // this.mobileList= true
      this.contactNumber = this.cardData.mobile;
    }else if(this.coreFunctionService.isNotBlank(this.cardData?.phone) && this.cardData?.phone.length >=10){
      this.contactNumber = this.cardData.phone;
    }else{
      this.contactNumber = '';
    }

    if(this.coreFunctionService.isNotBlank(this.cardData?.name)){
      this.contactName = this.cardData.name;
    }else if(this.coreFunctionService.isNotBlank(this.cardData?.first_name) && this.coreFunctionService.isNotBlank(this.cardData?.last_name)){
      this.contactName = this.cardData.first_name + " " + this.cardData.last_name;
    }else if(this.coreFunctionService.isNotBlank(this.cardData?.first_name)){
      this.contactName = this.cardData.first_name;
    }else{
      this.contactName = '';
    }
  }

  get f() { return this.cdrForm.controls; }

  async onSubmit() {

    let endTime:any = new Date();
    let endTimeMs:any = endTime.getTime(endTime);
    let callduration:any = await this.getDataDiff(endTimeMs);
    
    let cdr = this.cdrForm.value;
    const date:any = new Date(Date.now());
    let obj: any = {};
    if(this.coreFunctionService.isNotBlank(this.cardData?.account_name)){
      obj.account_name= this.cardData.name;
    }else{
      obj.account_name= "";
    }
    
    obj.contact_name= this.contactName;
    
    if(this.coreFunctionService.isNotBlank(this.cardData.contact_type)){
      obj.contact_type= this.cardData.contact_type;      
    }else{      
      obj.contact_type= "";
    }
    obj.contact_number= this.contactNumber;
    obj.call_start_time= this.datePipe.transform(this.startTime, 'hh:mm:ss a');
    obj.call_date= date;
    obj.call_duration_time= callduration;
    obj.description= cdr.description;
    obj.lead_status= cdr.leadstatus;
    obj.next_followup_date= cdr.followupdate;
    obj.next_followup_time= this.datePipe.transform(cdr.followuptime, 'hh:mm a');

    const saveFromData = {
      curTemp: 'call_data_record',
      data: obj
    }
    this.apiService.SaveFormData(saveFromData);
    this.cdrForm.reset();
    this.dismissModal();
  }

  dismissModal(){
    this.modal?.offsetParent.dismiss({'dismissed': true},"backClicked");
  }
  
  async getDataDiff(endTimeMs:any) {    
    let  diffMillisec:any = endTimeMs - this.startTime;

    let seconds = (diffMillisec / 1000).toFixed(0);
    let minutes = Math.floor(Number(seconds) / 60).toString();
    let hours;
    if (Number(minutes) > 59) {
      hours = Math.floor(Number(minutes) / 60);
      hours = (hours >= 10) ? hours : "0" + hours;
      minutes = (Number(minutes) - (hours * 60)).toString();
      minutes = (Number(minutes) >= 10) ? minutes : "0" + minutes;
    }
    seconds = Math.floor(Number(seconds) % 60).toString();
    seconds = (Number(seconds) >= 10) ? seconds : "0" + seconds;
    if (!hours) {
      hours = "00";
    }
    if (!minutes) {
      minutes = "00";
    }
    if (!seconds) {
      seconds = "00";
    }
    
      return hours + ":" + minutes + ":" + seconds;
    
    // let  minutes:any = Math.floor(diffMillisec / 60000);
    // let seconds:any = ((diffMillisec % 60000) / 1000).toFixed(0);
    // return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

  }
  
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '') {
        if (saveFromDataRsponce.success == 'success') {
          if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }else{
            this.notificationService.showAlert(" Form Data Save successfull !!!" ,'',['Dismiss']);
          }
        }
        this.apiService.ResetSaveResponce();
      }
      else if (saveFromDataRsponce.error && saveFromDataRsponce.error != '') {
        this.notificationService.showAlert(saveFromDataRsponce.error,'',['Dismiss']);
        this.apiService.ResetSaveResponce()
      }
      else{
        this.notificationService.showAlert("No data return",'',['Dismiss']);
      }
    }
  }

  call(Number:any) {
    let callingNumber:any = Number;
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));

      this.mobileList= false;
  }
  
}
