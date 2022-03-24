import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { ApiService, CommonDataShareService, CoreUtilityService, DataShareService, RestService } from '@core/ionic-core';
import { ModalController } from '@ionic/angular';
import { PopoverModalService } from 'src/app/service/modal-service/popover-modal.service';

interface User {
  id: number;
  first: string;
  last: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {

  @Input() editedRowIndex: number;
  @Input() formName: string;
  @Input() childData: any;  
  @Input() addform: any;
  @Input() modal: any;

  
  ionicForm: FormGroup;
  defaultDate = "1987-06-30";
  isSubmitted = false;

  templateForm: FormGroup;
  form:any ={};
  tableFields:any=[];
  formFieldButtons:any=[];
  currentMenu:any={};
  elements:any=[];
  showIfFieldList:any=[];
  disableIfFieldList:any=[];
  createFormgroup:boolean=false;
  checkBoxFieldListValue:any=[];
  selectedRowIndex: any = -1;
  minDate: Date;
  maxDate: Date;
  filePreviewFields:any=[];
  isStepper:boolean = false;
  getTableField:boolean = true;
  staticData: any = {};
  copyStaticData:any={};
  dinamic_form:any={};

  dinamicFormSubscription:any;
  staticDataSubscriber:any;
  nestedFormSubscription:any;
  users:User[] =[
    {
      id: 1,
      first: 'Alice',
      last: 'Smith',
    },
    {
      id: 2,
      first: 'Bob',
      last: 'Davis',
    },
    {
      id: 3,
      first: 'Charlie',
      last: 'Rosenburg',
    }
  ]
  

  constructor(
    public formBuilder: FormBuilder,
    private popoverModalService:PopoverModalService,
    private router: Router,
    private commonFunctionService:CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private modalController:ModalController,
    private commonDataShareService:CommonDataShareService,
    ) {

      this.staticDataSubscriber = this.dataShareService.staticData.subscribe(data =>{
        this.setStaticData(data);
      })
      this.dinamicFormSubscription = this.dataShareService.form.subscribe(form =>{
        this.setDinamicForm(form);
      });
      this.nestedFormSubscription = this.dataShareService.nestedForm.subscribe(form => {
        //console.log(form);
        this.form = form;
        this.resetFlag();
        this.setForm();
      })
    }

  resetFlag(){
    this.createFormgroup = true;
    this.editedRowIndex = -1;
  }
    
  ngOnInit() {
    this.initForm();
    const id:any = this.commonDataShareService.getFormId();
    this.getNextFormById(id);
  }

  initForm(){
    this.ionicForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      dob: [this.defaultDate],
      mobile: ['', [Validators.required]],
      user : ['' , [Validators.required]]
    })
  }

  

  getNextFormById(id: string) {
    const params = "form";
    const criteria = ["_id;eq;" + id + ";STATIC"];
    const payload = this.restService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetNestedForm(payload);
  }

  setStaticData(staticData:any){
    this.staticData = staticData; 
    Object.keys(this.staticData).forEach(key => {        
      this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
    })    
  }
  setDinamicForm(form:any){
    if(form && form.DINAMIC_FORM){
      this.dinamic_form = form.DINAMIC_FORM;
      if(this.formName == 'DINAMIC_FORM' && this.getTableField){
        this.form = this.dinamic_form
        this.setForm();
      }        
    }
  }
  async setForm(){
    if(this.form.details && this.form.details.collection_name && this.form.details.collection_name != ''){
      if(this.currentMenu == undefined){
        this.currentMenu = {};
      }
      this.currentMenu['name'] = this.form.details.collection_name;
    }
      
    if(this.form['tableFields'] && this.form['tableFields'] != undefined && this.form['tableFields'] != null){
      this.tableFields = JSON.parse(JSON.stringify(this.form['tableFields']));
      this.getTableField = false;
    }else{
      this.tableFields = [];
    }  
    if(this.form.tab_list_buttons && this.form.tab_list_buttons != undefined && this.form.tab_list_buttons.length > 0){
      this.formFieldButtons = this.form.tab_list_buttons; 
    } 

    this.showIfFieldList=[];
    this.disableIfFieldList=[];
    if (this.tableFields.length > 0 && this.createFormgroup) {
      this.createFormgroup = false;
      const forControl = {};
      this.checkBoxFieldListValue = []
      // this.filePreviewFields=[];
      this.tableFields.forEach(element => {
        if(element.type == 'pdf_view'){
          const object = this.elements[this.selectedRowIndex];
          staticModalGroup.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object))
        } 
        if(element.field_name && element.field_name != ''){             
          switch (element.type) {
            case "list_of_checkbox":
              this.commonFunctionService.createFormControl(forControl, element, [], "list")
              this.checkBoxFieldListValue.push(element);
              break;
            case "checkbox":
              this.commonFunctionService.createFormControl(forControl, element, false, "checkbox")
              break; 
            case "date":
              let currentYear = new Date().getFullYear();
              if(element.datatype == 'object'){
                this.minDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.minDate){
                    if(element.etc_fields.minDate == '-1'){
                      this.minDate = new Date(currentYear - 100, 0, 1);
                    }else{
                      this.minDate.setDate(new Date().getDate() - Number(element.etc_fields.minDate));
                    }
                  }
                }
                this.maxDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.maxDate){
                    if(element.etc_fields.maxDate == '-1'){
                      this.maxDate = new Date(currentYear + 1, 11, 31);
                    }else{
                      this.maxDate.setDate(new Date().getDate() + Number(element.etc_fields.maxDate));
                    }
                  }
                }
              }else{
                this.minDate = new Date(currentYear - 100, 0, 1);
                this.maxDate = new Date(currentYear + 1, 11, 31);
              }                  
              element['minDate'] = this.minDate
              element['maxDate'] = this.maxDate;
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break; 
            case "daterange":
              const date_range = {};
              let list_of_dates = [
                {field_name : 'start'},
                {field_name : 'end'}
              ]
              if (element.list_of_dates.length > 0) {
                list_of_dates.forEach((data) => {
                  
                  this.commonFunctionService.createFormControl(date_range, data, '', "text")
                });
              }
              this.commonFunctionService.createFormControl(forControl, element, date_range, "group")                                    
              break;            
            case "list_of_fields":
            case "group_of_fields":
              const list_of_fields = {};
              if (element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((data) => {
                  let modifyData = JSON.parse(JSON.stringify(data));
                  modifyData.parent = element.field_name;
                  //show if handling
                  if(data.show_if && data.show_if != ''){
                    this.showIfFieldList.push(modifyData);
                  }
                  //disable if handling
                  if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null)){                          
                    this.disableIfFieldList.push(modifyData);
                  }                      
                  if(element.type == 'list_of_fields'){
                    modifyData.is_mandatory=false;
                  }
                  if(data.field_name && data.field_name != ''){
                    switch (data.type) {
                      case "list_of_checkbox":
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, [], "list")
                        this.checkBoxFieldListValue.push(modifyData);
                        break;
                      case "date":
                        let currentYear = new Date().getFullYear();
                        if(data.datatype == 'object'){
                          this.minDate = new Date();
                          if(data.etc_fields && data.etc_fields != null){
                            if(data.etc_fields.minDate){
                              if(data.etc_fields.minDate == '-1'){
                                this.minDate = new Date(currentYear - 100, 0, 1);
                              }else{
                                this.minDate.setDate(new Date().getDate() - Number(data.etc_fields.minDate));
                              }
                            }
                          }
                          this.maxDate = new Date();
                          if(data.etc_fields && data.etc_fields != null){
                            if(data.etc_fields.maxDate){
                              if(data.etc_fields.maxDate == '-1'){
                                this.maxDate = new Date(currentYear + 1, 11, 31);
                              }else{
                                this.maxDate.setDate(new Date().getDate() + Number(data.etc_fields.maxDate));
                              }
                            }
                          }
                        }else{
                          this.minDate = new Date(currentYear - 100, 0, 1);
                          this.maxDate = new Date(currentYear + 1, 11, 31);
                        }                  
                        data['minDate'] = this.minDate
                        data['maxDate'] = this.maxDate;
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, '', "text")
                        break; 
                    
                      default:
                        this.commonFunctionService.createFormControl(list_of_fields, modifyData, '', "text")
                        break;
                    } 
                  }                 
                });
              }
              this.commonFunctionService.createFormControl(forControl, element, list_of_fields, "group");                
              break;
            case "stepper":                  
              if(element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((step) => {                      
                  if(step.list_of_fields != undefined){
                    const stepper_of_fields = {};
                    step.list_of_fields.forEach((data) =>{
                      let modifyData = JSON.parse(JSON.stringify(data));
                      modifyData.parent = step.field_name;
                      //show if handling
                      if(data.show_if && data.show_if != ''){
                        this.showIfFieldList.push(modifyData);
                      }
                      //disable if handling
                      if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null)){                          
                        this.disableIfFieldList.push(modifyData);
                      }                     
                      
                      this.commonFunctionService.createFormControl(stepper_of_fields, modifyData, '', "text")
                      if(data.tree_view_object && data.tree_view_object.field_name != ""){
                        let treeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));                
                        treeModifyData.is_mandatory=false;
                        this.commonFunctionService.createFormControl(stepper_of_fields, treeModifyData , '', "text")
                      }
                    });
                    this.commonFunctionService.createFormControl(forControl, step, stepper_of_fields, "group")
                  } 
                }); 
                this.isStepper = true;
              }                    
              break;
            case "pdf_view" : 
              const object = this.elements[this.selectedRowIndex];
              staticModalGroup.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object))
            break;
            case "input_with_uploadfile":
              element.is_disabled = true;
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break;
            default:
              this.commonFunctionService.createFormControl(forControl, element, '', "text")
              break;
          }
          

          if(element.tree_view_object && element.tree_view_object.field_name != ""){
            let treeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));                
            treeModifyData.is_mandatory=false;
            this.commonFunctionService.createFormControl(forControl, treeModifyData , '', "text")
          }
        }
        //show if handling
        if(element.show_if && element.show_if != ''){
          this.showIfFieldList.push(element);
        }
        //disable if handling
        if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null)){                  
          this.disableIfFieldList.push(element);
        }
        // if(element.type && element.type == 'pdf_view'){
        //   this.filePreviewFields.push(element)
        // }
        if(element.type && element.type == 'info_html'){
          this.filePreviewFields.push(element)
        }
      });
      if(this.formFieldButtons.length > 0){
        this.formFieldButtons.forEach(element => {
          if(element.field_name && element.field_name != ''){              
            switch (element.type) {
              case "dropdown":
                this.commonFunctionService.createFormControl(forControl, element, '', "text")
                break;
              default:
                break;
            }
          }
          if(element.show_if && element.show_if != ''){
            this.showIfFieldList.push(element);
          }
          if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null)){                  
            this.disableIfFieldList.push(element);
          }
        });
      }
      if (forControl) {
        this.templateForm = this.formBuilder.group(forControl);        
      }
      
      let staticModal=[];
     
      
      let object =this.templateForm.getRawValue();
      let staticModalGroup = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,object);
      if(staticModalGroup != undefined && staticModalGroup != null){
        if(staticModalGroup.length > 0){
          staticModalGroup.forEach(data =>{
            staticModal.push(data);
          })
        }
      }
      
      if(this.form && this.form.api_params && this.form.api_params != null && this.form.api_params != "" && this.form.api_params != undefined && this.selectedRowIndex == -1){            
                  
        let criteria = [];
        if(this.form.api_params_criteria && this.form.api_params_criteria != null){
          criteria=this.form.api_params_criteria
        }
        staticModal.push(this.restService.getPaylodWithCriteria(this.form.api_params,this.form.call_back_field,criteria,this.templateForm.getRawValue()))
        
      }
      if(staticModal.length > 0 && this.editedRowIndex == -1){
        this.apiService.getStatiData(staticModal);        
      }
      

    }
  }

  getDate(e) {
    let date = new Date(e.target.value).toISOString().substring(0, 10);
    this.ionicForm.get('dob').setValue(date, {
      onlyself: true
    })
  }
  get errorControl() {
    return this.ionicForm.controls;
  }
  submitForm() {
    this.isSubmitted = true;
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.ionicForm.value)
      this.router.navigate(['home']);
    }
  }

  compareWith(o1: User, o2: User) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  take_action_on_click(action){
    console.log(action);
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(true,null,'form-modal');
    this.modal.dismiss();
  }
  cancil(){
    this.router.navigate(['crm/quotation']);
  }

  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }
  

}
