import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@core/ionic-core';
import { IonSelect, IonSelectOption, ModalController } from '@ionic/angular';

@Component({
  selector: 'lib-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {
  @Input() data;
  @Input() modal;

  newSubmitForm: FormGroup;
  userType:string = '';
  collectionName:string = '';

  constructor(
    private modalController: ModalController,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    console.log("data :", this.data);
    this.initForm();
  }
  // scanner Custom and Static Form for Customer
  initForm(){
    if(this.data && this.data?.userType == 'customer'){
      this.userType = this.data.userType;
      if(this.data?.collectionName === 'customer_complaint'){        
      this.collectionName = this.data.collectionName;
        this.newSubmitForm = new FormGroup({
          complaintSubject: new FormControl ('', [Validators.required]),
          complaintDescription: new FormControl ('', [Validators.required]),
          status: new FormControl ('Pending', [Validators.required]),
        });
      }else if(this.data && this.data?.collectionName === 'customer_requests'){
        this.newSubmitForm = new FormGroup({
          requestType: new FormControl ('', [Validators.required]),
          requestDescription: new FormControl ('', [Validators.required]),
          status: new FormControl ('In Review', [Validators.required]),
        });
      }

    }else{

    }
  }
  dismissModal(role?:any){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss(this.data,role);
    }else{
      let Cmodal = this.modalController.getTop();
    }
  }
  ionSelectChange(ev:IonSelect){

  }
  ionSelectFocus(ev:IonSelectOption){

  }
  clearDropdownField(e:any,field:any){
    if(e.target.value && e.target.value.name){      
      e.target.value = "";
    }else{
      e.target.value = "";
    }
  }
  onSubmit(){
    if (this.newSubmitForm.invalid) {
      this.notificationService.presentToastOnBottom("Please fill all * mark fields","danger");
      return;
    }
    const payload = this.newSubmitForm.getRawValue();
    let userId = "";
    if(payload != ''){

    }
  }

  

}
