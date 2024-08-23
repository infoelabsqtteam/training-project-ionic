import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@core/ionic-core';
import { IonSelect, IonSelectOption, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-static-form',
  templateUrl: './custom-static-form.component.html',
  styleUrls: ['./custom-static-form.component.scss'],
})
export class CustomStaticFormComponent implements OnInit {
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
  initForm(){
    if(this.data && this.data?.userType == 'customer'){
      this.userType = this.data.userType;
    }
    if(this.data?.collectionName != ''){
      this.collectionName = this.data.collectionName;
    }
    if(this.collectionName === 'customer_complaint'){
      this.newSubmitForm = new FormGroup({
        complaintSubject: new FormControl ('', [Validators.required]),
        complaintDescription: new FormControl ('', [Validators.required])
      });
    }else if(this.collectionName === 'customer_requests'){
      this.newSubmitForm = new FormGroup({
        requestType: new FormControl ('', [Validators.required]),
        requestDescription: new FormControl ('', [Validators.required])
      });
    }
  }
  
  get f() { return this.newSubmitForm.controls; }

  dismissModal(data,role?:any){
    this.resetVariable();
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss(data,role);
    }else{
      let Cmodal = this.modalController.getTop();
      Cmodal.then( data => {
        data.dismiss({'dismissed': true},role,).catch(()=>{});
      })
    }
  }
  resetVariable(){    
    this.userType = '';
    this.collectionName = '';
    this.newSubmitForm.reset();
  }
  ionSelectChange(ev:any){
    console.log(ev);
  }
  ionSelectFocus(ev:any){
    console.log(ev);
  }
  clearDropdownField(e:any){
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
    this.dismissModal(payload,"confirm")
  } 


}
