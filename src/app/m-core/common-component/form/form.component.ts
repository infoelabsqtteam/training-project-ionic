import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DOCUMENT, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common'; 
import { Router } from '@angular/router';
import { ApiService, CommonDataShareService, CoreUtilityService, DataShareService, NotificationService, PermissionService, RestService, StorageService } from '@core/ionic-core';

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
export class FormComponent implements OnInit, OnDestroy {

  @Input() editedRowIndex: number;
  @Input() formName: string;
  @Input() childData: any;  
  @Input() addform: any;
  @Input() modal: any;

  
  ionicForm: FormGroup;
  defaultDate = "1987-06-30";
  isSubmitted = false;

  templateForm: FormGroup;

  forms:any={};
  form:any ={};
  formIndex:number=0;
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
  currentActionButton:any={};
  close_form_on_success:boolean=false;
  getSavePayload:boolean=false;
  updateMode: boolean = false;
  dataSaveInProgress: boolean = true;
  showNotify: boolean = false;
  submitted:boolean=false;
  complete_object_payload_mode:boolean=false;
  selectedRow: any={};
  dataListForUpload:any = {};
  saveResponceData:any={};
  nextIndex:boolean = false;
  custmizedFormValue: any = {};
  multipleFormCollection:any=[];
  donotResetFieldLists:any={};
  typeAheadData: string[] = [];
  treeViewData: any = {};

  dinamicFormSubscription:any;
  staticDataSubscriber:any;
  nestedFormSubscription:any;
  saveResponceSubscription:any;
 
  

  constructor(
    public formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private commonFunctionService:CoreUtilityService,
    private restService:RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private commonDataShareService:CommonDataShareService,
    private permissionService:PermissionService,
    private storageService:StorageService,
    private notificationService:NotificationService
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
      this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
        this.setSaveResponce(responce);
      })
    }

  resetFlag(){
    this.createFormgroup = true;
    this.editedRowIndex = -1;
  }
    
  ngOnDestroy() {
    if(this.staticDataSubscriber){
      this.staticDataSubscriber.unsubscribe();
    }
    if(this.dinamicFormSubscription){
      this.dinamicFormSubscription.unsubscribe();
    }
    if(this.nestedFormSubscription){
      this.nestedFormSubscription.unsubscribe();
    }
    if(this.templateForm){
      this.templateForm.reset(); 
    }
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
  setSaveResponce(saveFromDataRsponce){
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '' && this.showNotify) {
        if (saveFromDataRsponce.success == 'success' && !this.updateMode) {
          if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick.success_msg && this.currentActionButton.onclick.success_msg != ''){
            this.notificationService.showAlert(this.currentActionButton.onclick.success_msg,'',['Dismiss']);
          }else if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }else{
            this.notificationService.showAlert(" Form Data Save successfull !!!" ,'',['Dismiss']);
          }
          //this.templateForm.reset();
          //this.formGroupDirective.resetForm()
          
          this.resetForm();
          // this.custmizedFormValue = {};
          this.dataListForUpload = {}
          //this.addAndUpdateResponce.emit('add');
          this.saveResponceData = saveFromDataRsponce.data;
        } else if (saveFromDataRsponce.success == 'success' && this.updateMode) {
          if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick.success_msg && this.currentActionButton.onclick.success_msg != ''){
            this.notificationService.showAlert(this.currentActionButton.onclick.success_msg,'',['Dismiss']);
          }else if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            this.notificationService.showAlert(saveFromDataRsponce.success_msg,'',['Dismiss']);
          }else{
            this.notificationService.showAlert(" Form Data Update successfull !!!",'',['Dismiss']);
          }
          //this.templateForm.reset();
          //this.formGroupDirective.resetForm()
          if(this.nextIndex){              
            //this.next();
          }else{
            this.resetForm();
            //this.addAndUpdateResponce.emit('update'); 
            this.updateMode = false;
          }                     
          this.custmizedFormValue = {};  
          this.dataListForUpload = {} 
          this.saveResponceData = saveFromDataRsponce.data;
        }
        if(this.close_form_on_success){
          this.close_form_on_success=false;
          this.close();
        }
        else if(this.multipleFormCollection.length > 0){
          this.close();
        }
        else{
          //this.commonFunctionService.getStaticData();
          const payload = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,this.getFormValue(false));
          this.apiService.getStatiData(payload);
        }
        // if(this.isStepper){
        //   this.stepper.reset();
        // }

        // if(this.envService.getRequestType() == 'PUBLIC'){
        //   this.complete_object_payload_mode = false;
        //   let _id = this.saveResponceData["_id"];
        //   if(this.coreFunctionService.isNotBlank(this.form["details"]) && this.coreFunctionService.isNotBlank(this.form["details"]["on_success_url_key"] != "")){
        //     let public_key = this.form["details"]["on_success_url_key"]
        //     const data = {
        //       "obj":public_key,
        //       "key":_id,
        //       "key1": "key2",
        //       "key2" : "key3",
        //     }
        //     let payloaddata = {};
        //     this.storageService.removeDataFormStorage();
        //     const getFormData = {
        //       data: payloaddata,
        //       _id:_id
        //     }
        //     getFormData.data=data;
        //     this.apiService.GetForm(getFormData);
        //     let navigation_url = "template/"+public_key+"/"+_id+"/ie09/cnf00v";
        //     this.router.navigate([navigation_url]);
        //   }else{
        //     this.router.navigate(["home_page"]);
        //   }
         
        // }
        
        //this.close()
        this.showNotify = false;
        this.dataSaveInProgress = true;
        this.apiService.ResetSaveResponce()
        this.checkOnSuccessAction();
      }
      else if (saveFromDataRsponce.error && saveFromDataRsponce.error != '' && this.showNotify) {
        this.notificationService.showAlert(saveFromDataRsponce.error,'',['Dismiss']);
        this.showNotify = false;
        this.dataSaveInProgress = true;
        this.apiService.ResetSaveResponce()
      }
      else{
        this.notificationService.showAlert("No data return",'',['Dismiss']);
        this.dataSaveInProgress = true;
      }
    }
  }
  setForm(){
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
  take_action_on_click(action_button){
    let api='';
    this.currentActionButton=action_button;
    if(this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.api && this.currentActionButton.onclick.api != null){
      if(this.currentActionButton.onclick.close_form_on_success){
        this.close_form_on_success = this.currentActionButton.onclick.close_form_on_success;
      } 
      api = this.currentActionButton.onclick.api        
      switch (api.toLowerCase()) {
        case "save":
        case "update":
          this.close_form_on_success = true;
          this.saveFormData();
          break; 
        default:
          //this.partialDataSave(action_button.onclick,null)
          break;
      } 
    } 
  }
  getFormValue(check){    
    let formValue = this.templateForm.getRawValue();
    let selectedRow = { ...this.selectedRow };     
    let modifyFormValue = {};   
    let valueOfForm = {};
    if (this.updateMode || this.complete_object_payload_mode){      
      this.tableFields.forEach(element => {
        switch (element.type) {
          case 'stepper':
            element.list_of_fields.forEach(step => {
              if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                step.list_of_fields.forEach(data => {
                  selectedRow[data.field_name] = formValue[step.field_name][data.field_name]
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){                  
                    const treeViewField = data.tree_view_object.field_name;
                    selectedRow[treeViewField] = formValue[step.field_name][treeViewField]
                  }
                });
              }
            });
            break;
          case 'group_of_fields':
            element.list_of_fields.forEach(data => {
              switch (data.type) {
                case 'date':
                  if(data && data.date_format && data.date_format != ''){
                    if(typeof formValue[element.field_name][data.field_name] != 'string'){
                      selectedRow[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                    }else{
                      selectedRow[element.field_name] = formValue[element.field_name];
                    }
                  }else{
                    selectedRow[element.field_name] = formValue[element.field_name];
                  }            
                  break;
              
                default:
                  selectedRow[element.field_name] = formValue[element.field_name];
                  break;
              }
            });
            break;
          // case 'gmap':
          //   selectedRow['latitude'] = this.latitude;
          //   selectedRow['longitude'] = this.longitude;
          //   selectedRow['address'] = this.address;
          //   break;
          case 'date':
            if(element && element.date_format && element.date_format != ''){
              selectedRow[element.field_name] = this.datePipe.transform(selectedRow[element.field_name],element.date_format);
            }            
            break;
          default:
            selectedRow[element.field_name] = formValue[element.field_name];
            break;
        }
      });
    }else{
      this.tableFields.forEach(element => {
        switch (element.type) {
          case 'stepper':
            element.list_of_fields.forEach(step => {
              if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                step.list_of_fields.forEach(data => {
                  modifyFormValue[data.field_name] = formValue[step.field_name][data.field_name]
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){                  
                    const treeViewField = data.tree_view_object.field_name;
                    modifyFormValue[treeViewField] = formValue[step.field_name][treeViewField]
                  }
                });
              }
            });
            break;
          case 'group_of_fields':
            element.list_of_fields.forEach(data => {
              switch (data.type) {
                case 'date':
                  if(data && data.date_format && data.date_format != ''){
                    modifyFormValue[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                  }            
                  break;
              
                default:
                  modifyFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name];
                  break;
              }
            });
            break;
          // case 'gmap':
          //   modifyFormValue['latitude'] = this.latitude;
          //   modifyFormValue['longitude'] = this.longitude;
          //   modifyFormValue['address'] = this.address;
          //   break;
          case 'date':
            if(element && element.date_format && element.date_format != ''){
              modifyFormValue[element.field_name] = this.datePipe.transform(formValue[element.field_name],element.date_format);
            }            
            break;
          default:
            modifyFormValue = formValue;
            break;
        }
      });
    }
    // if(check){
    //   Object.keys(this.custmizedFormValue).forEach(key => {
    //     if (this.updateMode || this.complete_object_payload_mode) {
    //       if(this.custmizedFormValue[key] && this.custmizedFormValue[key] != null && !Array.isArray(this.custmizedFormValue[key]) && typeof this.custmizedFormValue[key] === "object"){
    //         this.tableFields.forEach(element => {            
    //           if(element.field_name == key){
    //             if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
    //               selectedRow[key] = this.custmizedFormValue[key];
    //             }else{
    //               Object.keys(this.custmizedFormValue[key]).forEach(child =>{
    //                 selectedRow[key][child] = this.custmizedFormValue[key][child];
    //               })
    //             }
    //           }
    //         });          
    //       }else{
    //           selectedRow[key] = this.custmizedFormValue[key];
    //       }
    //     } else {
    //       if(this.custmizedFormValue[key] && this.custmizedFormValue[key] != null && !Array.isArray(this.custmizedFormValue[key]) && typeof this.custmizedFormValue[key] === "object"){
    //         this.tableFields.forEach(element => {
    //           if(element.field_name == key){
    //             if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
    //               modifyFormValue[key] = this.custmizedFormValue[key];
    //             }else{
    //               Object.keys(this.custmizedFormValue[key]).forEach(child =>{
    //                 modifyFormValue[key][child] = this.custmizedFormValue[key][child];
    //               })
    //             }
    //           }
    //         });          
    //       }else{
    //         modifyFormValue[key] = this.custmizedFormValue[key];
    //       }       
          
    //     }
    //   })
    //   if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
    //     this.checkBoxFieldListValue.forEach(element => {
    //       if (this.staticData[element.ddn_field]) {
    //         const listOfCheckboxData = [];
    //         let data = [];
    //         if(this.updateMode || this.complete_object_payload_mode){
    //           if(element.parent){
    //             data = selectedRow[element.parent][element.field_name];
    //           }else{
    //             data = selectedRow[element.field_name];
    //           }
    //         }else{
    //           if(element.parent){
    //             data = modifyFormValue[element.parent][element.field_name];
    //           }else{
    //             data = modifyFormValue[element.field_name];
    //           }
    //         }
    //         let currentData = this.staticData[element.ddn_field];
    //         if(data && data.length > 0){
    //           data.forEach((data, i) => {
    //             if (data) {
    //               listOfCheckboxData.push(currentData[i]);
    //             }
    //           });
    //         }
    //         if (this.updateMode || this.complete_object_payload_mode) {
    //           if(element.parent){
    //             selectedRow[element.parent][element.field_name] = listOfCheckboxData;
    //           }else{
    //             selectedRow[element.field_name] = listOfCheckboxData;
    //           }
    //         } else {
    //           if(element.parent){
    //             modifyFormValue[element.parent][element.field_name] = listOfCheckboxData;
    //           }else{
    //             modifyFormValue[element.field_name] = listOfCheckboxData
    //           }
    //         }
    //       }
    //     });
    //   }
    //   Object.keys(this.dataListForUpload).forEach(key => {
    //     if (this.updateMode || this.complete_object_payload_mode) {
    //       if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
    //         this.tableFields.forEach(element => {            
    //           if(element.field_name == key){                
    //             Object.keys(this.dataListForUpload[key]).forEach(child =>{
    //               selectedRow[key][child] = this.modifyUploadFiles(this.dataListForUpload[key][child]);
    //             })
    //           }
    //         });          
    //       }else{
    //           selectedRow[key] = this.modifyUploadFiles(this.dataListForUpload[key]);
    //       }
    //     } else {
    //       if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
    //         this.tableFields.forEach(element => {
    //           if(element.field_name == key){                
    //             Object.keys(this.dataListForUpload[key]).forEach(child =>{
    //               modifyFormValue[key][child] = this.modifyUploadFiles(this.dataListForUpload[key][child]);
    //             })
    //           }
    //         });          
    //       }else{
    //         modifyFormValue[key] = this.modifyUploadFiles(this.dataListForUpload[key]);
    //       }       
          
    //     }
    //   })
    // } 

    valueOfForm = this.updateMode || this.complete_object_payload_mode ? selectedRow : modifyFormValue;
       
       
    return valueOfForm;
  }
  getSavePayloadData() {
    this.getSavePayload = false;
    this.submitted = true;
    let hasPermission;
    if(this.currentMenu && this.currentMenu.name){
      hasPermission = this.permissionService.checkPermission(this.currentMenu.name.toLowerCase( ),'add')
    }
    if(this.updateMode){
      hasPermission = this.permissionService.checkPermission(this.currentMenu.name.toLowerCase( ),'edit')
    }
    // if(this.envService.getRequestType() == 'PUBLIC'){
    //   hasPermission = true;
    // }
    let formValue = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(true),false);
       
    if(hasPermission){      
      if(this.templateForm.valid){
        if(this.commonFunctionService.checkCustmizedValuValidation(this.tableFields,formValue)){
          if (this.dataSaveInProgress) {
            this.showNotify = true;
            this.dataSaveInProgress = false;            
            formValue['log'] = this.storageService.getUserLog();
            if(!formValue['refCode'] || formValue['refCode'] == '' || formValue['refCode'] == null){
              formValue['refCode'] = this.storageService.getRefcode();
            } 
            if(!formValue['appId'] || formValue['appId'] == '' || formValue['appId'] == null){
              //formValue['appId'] = this.commonFunctionService.getAppId();
              formValue['appId'] = this.storageService.getRefcode();
              
            }            
            // this.custmizedFormValue.forEach(element => {
            //   this.templateForm.value[element.name] = element.value;
            // });
            
            // formValue = this.commonFunctionService.sanitizeObject(this.tableFields,formValue);
            if (this.updateMode) {              
              if(this.formName == 'cancel'){
                formValue['status'] = 'CANCELLED';
              }                                          
            }              

            const saveFromData = {
              curTemp: this.currentMenu.name,
              data: formValue
            }
            this.getSavePayload = true;
            return saveFromData;
            
          }
        }else{
          this.getSavePayload = false;
        }
      }else{
        this.getSavePayload = false;
        this.notificationService.showAlert("Some fields are mendatory",'',['Dismiss']);
      }
    }else{
      this.getSavePayload = false;
      this.notificationService.showAlert("Permission denied !!!",'',['Dismiss']);
    }
  }
  saveFormData(){
    let checkValidatiaon = this.commonFunctionService.sanitizeObject(this.tableFields,this.getFormValue(false),true,this.getFormValue(true));
    if(typeof checkValidatiaon != 'object'){
      const saveFromData = this.getSavePayloadData();
      // if(this.bulkupdates){
      //   saveFromData.data['data'] = this.bulkDataList;
      //   saveFromData.data['bulk_update'] = true;
      // }
      if(this.getSavePayload){
        if(this.currentActionButton && this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.api && this.currentActionButton.onclick.api != null && this.currentActionButton.onclick.api.toLowerCase() == 'send_email'){
          //this.apiService.SendEmail(saveFromData)
        }else{
          this.apiService.SaveFormData(saveFromData);
        }        
      }
    }else{
      this.notificationService.showAlert(checkValidatiaon.msg,'',['Dismiss']);
    }     
  }

  resetForm(){
    //this.formGroupDirective.resetForm();
    //this.setPreviousFormTargetFieldData();
    this.donotResetFieldLists = this.commonFunctionService.donotResetField(this.tableFields,this.getFormValue(true));
    this.templateForm.reset()
    if(Object.keys(this.donotResetFieldLists).length > 0){
      this.custmizedFormValue = {};

      //this.commonFunctionService.updateDataOnFormField(this.templateForm,this.tableFields,this.formFieldButtons,this.donotResetFieldLists,this.selectedRow,this.custmizedFormValue,this.dataListForUpload,this.treeViewData,this.copyStaticData);
      this.donotResetFieldLists = {};
    }else{
      this.custmizedFormValue = {};
    }    
    this.tableFields.forEach(element => {
      switch (element.type) {
        case 'checkbox':
          this.templateForm.controls[element.field_name].setValue(false)
          break; 
        case 'list_of_checkbox':
          const controls:any = this.templateForm.get(element.field_name)['controls'];
          if(controls && controls.length > 0){
            controls.forEach((child,i) => {
              controls.at(i).patchValue(false);
              //this.templateForm.get(element.field_name).at(i).patchValue(false);
              //(<FormArray>this.templateForm.controls[element.field_name]).controls[i].patchValue(false);
            });
          }
          break;     
        default:
          break;
      }
    });
  }
  close(){    
    this.apiService.resetStaticAllData();
    this.copyStaticData = {};
    this.typeAheadData = [];
    //this.commonFunctionService.resetStaticAllData();
    this.selectedRow = {};
    this.checkFormAfterCloseModel();
  }
  checkFormAfterCloseModel(){
    if(this.multipleFormCollection.length > 0){
      //this.loadPreviousForm();
    }else{      
      this.templateForm.reset();
      this.dismissModal();
    }
  }
  checkOnSuccessAction(){
    let actionValue = ''
    let index = -1;
    if(this.currentActionButton.onclick && this.currentActionButton.onclick != null && this.currentActionButton.onclick.action_name && this.currentActionButton.onclick.action_name != null){
      if(this.currentActionButton.onclick.action_name != ''){
        actionValue = this.currentActionButton.onclick.action_name;
        if(actionValue != ''){
          Object.keys(this.forms).forEach((key,i) => {
            if(key == actionValue){
              index = i;
            }
          });
          if(index != -1) {
            //this.changeNewForm(actionValue,index)
          }    
        }
      }
    }
  };
  
  

  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }
  

}
