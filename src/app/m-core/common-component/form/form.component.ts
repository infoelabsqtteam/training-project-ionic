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
  curFileUploadField:any={}
  curFileUploadFieldparentfield:any={};

  dinamicFormSubscription:any;
  staticDataSubscriber:any;
  nestedFormSubscription:any;
  saveResponceSubscription:any;
  typeaheadDataSubscription:any;

  dateValue:any;
 
  

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
      });
      this.dinamicFormSubscription = this.dataShareService.form.subscribe(form =>{
        this.setDinamicForm(form);
      });
      this.nestedFormSubscription = this.dataShareService.nestedForm.subscribe(form => {
        //console.log(form);
        this.form = form;
        this.resetFlag();
        this.setForm();
        if(this.editedRowIndex >= 0 ){
          this.editedRowData(this.childData);
        }
      })
      this.saveResponceSubscription = this.dataShareService.saveResponceData.subscribe(responce =>{
        this.setSaveResponce(responce);
      });
      this.typeaheadDataSubscription = this.dataShareService.typeAheadData.subscribe(data =>{
        this.setTypeaheadData(data);
      });
    }

  resetFlag(){
    this.createFormgroup = true;
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
    const id:any = this.commonDataShareService.getFormId();
    this.getNextFormById(id);
    this.handleDisabeIf();
    this.formControlChanges();
  }
  getNextFormById(id: string) {
    const params = "form";
    const criteria = ["_id;eq;" + id + ";STATIC"];
    const payload = this.restService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetNestedForm(payload);
  }

  setTypeaheadData(typeAheadData){
    if (typeAheadData.length > 0) {
      this.typeAheadData = typeAheadData;
    } else {
      this.typeAheadData = [];
    }
  }
  setStaticData(staticData:any){
    this.staticData = staticData; 
    Object.keys(this.staticData).forEach(key => {        
      this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
    })
    this.tableFields.forEach(element => {
      switch (element.type) {              
        case 'pdf_view':
          // if(isArray(this.copyStaticData[element.ddn_field]) && this.copyStaticData[element.ddn_field] != null){
          //   const data = this.copyStaticData[element.ddn_field][0];
          //   if(data['bytes'] && data['bytes'] != '' && data['bytes'] != null){
          //     const arrayBuffer = data['bytes'];
          //     // this.pdfViewLink = encodeURIComponent(escape(window.atob( arrayBuffer )));
          //     // this.pdfViewLink = decodeURIComponent(escape(window.atob( arrayBuffer )));
          //     this.pdfViewLink = arrayBuffer;
          //     this.pdfViewListData = JSON.parse(JSON.stringify(this.copyStaticData[element.ddn_field]))
          //   }
          // }else{
          //   this.pdfViewLink = '';
          // }             
          break;
        case 'info_html':
        case 'html_view':
          if(this.copyStaticData[element.ddn_field] && this.copyStaticData[element.ddn_field] != null){
            this.templateForm.controls[element.field_name].setValue(this.copyStaticData[element.ddn_field])
          }
          break;
        default:              
          break;
      }
    })  
    if(this.staticData["FORM_GROUP"] && this.staticData["FORM_GROUP"] != null){          
      this.updateDataOnFormField(this.staticData["FORM_GROUP"]);          
      const fieldName = {
        "field" : "FORM_GROUP"
      }
      this.apiService.ResetStaticData(fieldName);
    }

    if(this.staticData["CHILD_OBJECT"] && this.staticData["CHILD_OBJECT"] != null){
      this.updateDataOnFormField(this.staticData["CHILD_OBJECT"]); 
      const fieldName = {
        "field" : "CHILD_OBJECT"
      }
      this.apiService.ResetStaticData(fieldName);
      
    }

    if(this.staticData["COMPLETE_OBJECT"] && this.staticData["COMPLETE_OBJECT"] != null){
      this.updateDataOnFormField(this.staticData["COMPLETE_OBJECT"]);          
      this.selectedRow = this.staticData["COMPLETE_OBJECT"];
      this.complete_object_payload_mode = true;
      const fieldName = {
        "field" : "COMPLETE_OBJECT"
      }
      this.apiService.ResetStaticData(fieldName);
      
    }

    if(this.staticData["FORM_GROUP_FIELDS"] && this.staticData["FORM_GROUP_FIELDS"] != null){
      this.updateDataOnFormField(this.staticData["FORM_GROUP_FIELDS"]);
      const fieldName = {
        "field" : "FORM_GROUP_FIELDS"
      }
      this.apiService.ResetStaticData(fieldName);

    }
    // if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {

    //   this.setCheckboxFileListValue();
    // }    
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
            case "typeahead":
              this.commonFunctionService.createFormControl(forControl, element, null, "text")
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

  compareFn(o1: any, o2: any):boolean {
    return o1 && o2 ? o1._id === o2._id : o1 === o2;
  }
  // compareFn(e1: User, e2: User): boolean {
  //   return e1 && e2 ? e1.id === e2.id : e1 === e2;
  // }
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
    if(check){
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
      Object.keys(this.dataListForUpload).forEach(key => {
        if (this.updateMode || this.complete_object_payload_mode) {
          if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
            this.tableFields.forEach(element => {            
              if(element.field_name == key){                
                Object.keys(this.dataListForUpload[key]).forEach(child =>{
                  selectedRow[key][child] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key][child]);
                })
              }
            });          
          }else{
              selectedRow[key] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key]);
          }
        } else {
          if(this.dataListForUpload[key] && this.dataListForUpload[key] != null && !Array.isArray(this.dataListForUpload[key]) && typeof this.dataListForUpload[key] === "object"){
            this.tableFields.forEach(element => {
              if(element.field_name == key){                
                Object.keys(this.dataListForUpload[key]).forEach(child =>{
                  modifyFormValue[key][child] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key][child]);
                })
              }
            });          
          }else{
            modifyFormValue[key] = this.commonFunctionService.modifyUploadFiles(this.dataListForUpload[key]);
          }       
          
        }
      })
    } 

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
  editedRowData(object) {
    this.selectedRow = JSON.parse(JSON.stringify(object)); 
    this.updateMode = true;    
    this.getStaticDataWithDependentData(); 
    this.updateDataOnFormField(this.selectedRow); 
     
    // if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
    //   this.setCheckboxFileListValue();
    // }
  }
  getStaticDataWithDependentData(){
    const staticModal = []
    this.tableFields.forEach(element => {
      if(element.field_name && element.field_name != ''){
        let fieldName = element.field_name;
        let object = this.selectedRow[fieldName];
        if (element.onchange_api_params && element.onchange_call_back_field && !element.do_not_auto_trigger_on_edit) {
          const checkFormGroup = element.onchange_call_back_field.indexOf("FORM_GROUP");
          if(checkFormGroup == -1){

            const payload = this.restService.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, this.selectedRow)
            if(element.onchange_api_params.indexOf('QTMP') >= 0){
              payload['data'] = this.selectedRow
            } 
            staticModal.push(payload);
          }
        }
        switch (element.type) {
          case "stepper":
            if (element.list_of_fields.length > 0) {
              element.list_of_fields.forEach((step) => {                
                if (step.list_of_fields.length > 0) {
                  step.list_of_fields.forEach((data) => {
                    if (data.onchange_api_params && data.onchange_call_back_field && !data.do_not_auto_trigger_on_edit) {
                      const checkFormGroup = data.onchange_call_back_field.indexOf("FORM_GROUP");
                      if(checkFormGroup == -1){
            
                        const payload = this.restService.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, this.selectedRow)
                        if(data.onchange_api_params.indexOf('QTMP') >= 0){
                          payload['data'] = this.selectedRow
                        } 
                        staticModal.push(payload);
                      }
                    }
                    if(data.tree_view_object && data.tree_view_object.field_name != ""){
                      let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                      if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
                        staticModal.push(this.restService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, this.selectedRow));
                      }
                    }
                  });
                }
              });
            }
            break;
        }
        if(element.tree_view_object && element.tree_view_object.field_name != ""){
          let editeTreeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
          if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
            staticModal.push(this.restService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, this.selectedRow));
          }
        }
      }
      if(element.type && element.type == 'pdf_view'){
        staticModal.push(this.restService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,this.selectedRow))
      }
    });
    let staticModalGroup = this.restService.commanApiPayload([],this.tableFields,this.formFieldButtons,this.selectedRow);
    if(staticModalGroup.length > 0){
      staticModalGroup.forEach(element => {
        staticModal.push(element);
      });
    } 
    if(this.form.api_params && this.form.api_params != null && this.form.api_params != "" && this.form.api_params != undefined){
      
      let criteria = [];
      if(this.form.api_params_criteria && this.form.api_params_criteria != null){
        criteria=this.form.api_params_criteria
      }
      staticModal.push(this.restService.getPaylodWithCriteria(this.form.api_params,this.form.call_back_field,criteria,this.getFormValue(true)))
      
    }
    if(staticModal.length > 0){    
      this.apiService.getStatiData(staticModal);
    }
  }
  updateDataOnFormField(formValue){
    const checkDataType = typeof formValue;
    if(checkDataType == 'object' && !this.commonFunctionService.isArray(formValue)){
      this.tableFields.forEach(element => {
        let fieldName = element.field_name;
        let object = formValue[fieldName];
        if(element && element.field_name && element.field_name != ''){
          switch (element.type) { 
            case "grid_selection":
            case 'grid_selection_vertical':
            case "list_of_string":
            case "drag_drop":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                this.templateForm.controls[element.field_name].setValue('')
              }
              break;
            case "file":
            case "input_with_uploadfile":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                this.dataListForUpload[element.field_name] = JSON.parse(JSON.stringify(formValue[element.field_name]));
                const value = this.commonFunctionService.modifyFileSetValue(formValue[element.field_name]);
                this.templateForm.controls[element.field_name].setValue(value);
              }
              break;
            case "list_of_fields":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                if(this.commonFunctionService.isArray(formValue[element.field_name])){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                }else if(typeof formValue[element.field_name] == "object" && element.datatype == 'key_value'){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                }else{
                  element.list_of_fields.forEach(data => {
                    switch (data.type) {
                      case "list_of_string":
                      case "grid_selection":
                      case 'grid_selection_vertical':
                      case "drag_drop":                    
                        if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                          this.custmizedFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name]
                          this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                        }
                        break;
                      case "typeahead":
                        if(data.datatype == "list_of_object" || element.datatype == 'chips'){
                          if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                            this.custmizedFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name]
                            this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                            //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                          }
                        }else{
                          if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                            const value = formValue[element.field_name][data.field_name];
                            this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                            //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                          }
                        }
                        break;
                      default:
                        if(formValue[element.field_name] && formValue[element.field_name][data.field_name] != null && formValue[element.field_name][data.field_name] != undefined && formValue[element.field_name][data.field_name] != ''){
                          const value = formValue[element.field_name][data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                        }
                        break;
                    }
                  });
                }
              }
              break; 
            case "typeahead":
              if(element.datatype == "list_of_object" || element.datatype == 'chips'){
                if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                  this.custmizedFormValue[element.field_name] = formValue[element.field_name]
                  this.templateForm.controls[element.field_name].setValue('')
                }
              }else{
                if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){                  
                  const value = formValue[element.field_name];
                  this.typeAheadData = [value];
                  this.templateForm.controls[element.field_name].setValue(value)
                }
              }  
              break;
            case "group_of_fields":
              element.list_of_fields.forEach(data => {
                let ChildFieldData = formValue[element.field_name];
                if(data && data.field_name && data.field_name != ''){
                  switch (data.type) {
                    case "list_of_string":
                    case "grid_selection":
                    case 'grid_selection_vertical':
                    case "drag_drop": 
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        if (!this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = {};
                        const value = ChildFieldData[data.field_name];
                        this.custmizedFormValue[element.field_name][data.field_name] = value;
                        this.templateForm.get(element.field_name).get(data.field_name).setValue('')
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                      }
                      break;   
                    case "typeahead":
                      if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                        if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                          if (!this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = {};
                          const value = ChildFieldData[data.field_name];
                          this.custmizedFormValue[element.field_name][data.field_name] = value;
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                        }
                      }else{
                        if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                          const value = ChildFieldData[data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                        }
                      }  
                      break;               
                    case "number":
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        let gvalue;
                        const value = ChildFieldData[data.field_name];
                        if(value != null && value != ''){
                          gvalue = value;
                        }else{
                          gvalue = 0;
                        }
                        this.templateForm.get(element.field_name).get(data.field_name).setValue(gvalue)
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(gvalue);
                      }
                      break;
                    case "list_of_checkbox":
                      this.templateForm.get(element.field_name).get(data.field_name).patchValue([])
                      if(element.parent){
                        this.selectedRow[element.parent] = {}
                        this.selectedRow[element.parent][element.field_name] = ChildFieldData;
                      }else{
                        this.selectedRow[element.field_name] = ChildFieldData;
                      }
                      //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue([]);
                      break;
                    case "date":
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        if(typeof ChildFieldData[data.field_name] === 'string'){
                          const date = ChildFieldData[data.field_name];
                          const dateMonthYear = date.split('/');
                          const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
                          const value = new Date(formatedDate);
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                        }else{                  
                          const value = formValue[element.field_name][data.field_name] == null ? null : formValue[element.field_name][data.field_name];
                          this.templateForm.get(element.field_name).get(data.field_name).setValue(value);              
                        }
                      }
                      break;
                    default:
                      if(ChildFieldData && ChildFieldData[data.field_name] != null && ChildFieldData[data.field_name] != undefined && ChildFieldData[data.field_name] != ''){
                        const value = ChildFieldData[data.field_name];
                        this.templateForm.get(element.field_name).get(data.field_name).setValue(value)
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                      }
                      break;
                  }
                }
              });
              break;
            case "tree_view_selection":
              this.treeViewData[fieldName] = [];            
              let treeDropdownValue = object == null ? null : object;
              this.treeViewData[fieldName].push(JSON.parse(JSON.stringify(treeDropdownValue)));
              this.templateForm.controls[fieldName].setValue(treeDropdownValue)
              break;
            case "stepper":
              element.list_of_fields.forEach(step => {
                step.list_of_fields.forEach(data => {
                  switch (data.type) {
                    case "list_of_string":
                    case "grid_selection":
                    case 'grid_selection_vertical':
                      if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){                                             
                        this.custmizedFormValue[data.field_name] = formValue[data.field_name]                    
                      }
                      this.templateForm.get(step.field_name).get(data.field_name).setValue('')
                      //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue('');
                      break;
                    case "typeahead":
                      if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                        if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){                      
                          this.custmizedFormValue[data.field_name] = formValue[data.field_name]
                          this.templateForm.get(step.field_name).get(data.field_name).setValue('')
                          //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue('');
                        }
                      }else{
                        if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){
                          const value = formValue[data.field_name];
                          this.templateForm.get(step.field_name).get(data.field_name).setValue(value)
                          //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(value);
                        }
                      }
                      break;
                    case "number":
                        let gvalue;
                        const value = formValue[data.field_name];
                        if(value != null && value != ''){
                          gvalue = value;
                        }else{
                          gvalue = 0;
                        }
                        this.templateForm.get(step.field_name).get(data.field_name).setValue(gvalue)
                        //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(gvalue);
                      break;
                    case "list_of_checkbox":
                      this.templateForm.get(step.field_name).get(data.field_name).patchValue([])
                      //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue([]);
                      break;
                    default:
                      if(formValue[data.field_name] != null && formValue[data.field_name] != undefined && formValue[data.field_name] != ''){
                        const value = formValue[data.field_name];
                        this.templateForm.get(step.field_name).get(data.field_name).setValue(value)
                        //(<FormGroup>this.templateForm.controls[step.field_name]).controls[data.field_name].patchValue(value);
                      }
                      break;
                  }
                  if(data.tree_view_object && data.tree_view_object.field_name != ""){
                    let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                    const treeObject = this.selectedRow[editeTreeModifyData.field_name];
                    this.templateForm.get(step.field_name).get(editeTreeModifyData.field_name).setValue(treeObject)
                    //(<FormGroup>this.templateForm.controls[step.field_name]).controls[editeTreeModifyData.field_name].patchValue(treeObject);
                  } 
                });
              });
              break;            
            case "number":
              let value;
              if(object != null && object != ''){
                value = object;
                this.templateForm.controls[element.field_name].setValue(value)
              }else if(object == 0){
                value = object;
                this.templateForm.controls[element.field_name].setValue(value)
             }
            break; 
            case "daterange":
                let list_of_dates = [
                  {field_name : 'start'},
                  {field_name : 'end'}
                ]
                if (list_of_dates.length > 0) {
                  list_of_dates.forEach((data) => { 
                    this.templateForm.get(element.field_name).get(data.field_name).setValue(value);
                    //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(object[data.field_name]);
                  });
                }                                   
                break;
            case "date":
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                if(typeof object === 'string'){
                  const date = object[element.field_name];
                  const dateMonthYear = date.split('/');
                  const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
                  const value = new Date(formatedDate);
                  this.templateForm.controls[element.field_name].setValue(value)
                }else{                  
                  const value = formValue[element.field_name] == null ? null : formValue[element.field_name];
                  this.templateForm.controls[element.field_name].setValue(value);                  
                }
              }
              break;
            case "tabular_data_selector":   
              if(object != undefined && object != null){
                this.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));     
              } 
              if(Array.isArray(this.copyStaticData[element.ddn_field]) && Array.isArray(this.custmizedFormValue[fieldName])){
                this.custmizedFormValue[fieldName].forEach(staData => {
                  if(this.copyStaticData[element.ddn_field][staData._id]){
                    this.copyStaticData[element.ddn_field][staData._id].selected = true;
                  }
                });
              }          
              break;
            case "list_of_checkbox":
              this.templateForm.controls[element.field_name].setValue([]);
              break;
            default:
              if(formValue[element.field_name] != null && formValue[element.field_name] != undefined){
                const value = formValue[element.field_name] == null ? null : formValue[element.field_name];
                this.templateForm.controls[element.field_name].setValue(value)
              }
              break;
          } 
        }  
        if(element.tree_view_object && element.tree_view_object.field_name != ""){
          let editeTreeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
          const object = this.selectedRow[editeTreeModifyData.field_name];
          this.templateForm.controls[editeTreeModifyData.field_name].setValue(object)
        }   
      });
      if(this.formFieldButtons.length > 0){
        this.formFieldButtons.forEach(element => {
          let fieldName = element.field_name;
          let object = this.selectedRow[fieldName];
          if(element.field_name && element.field_name != ''){              
            switch (element.type) {
              case "dropdown":
                let dropdownValue = object == null ? null : object;
                this.templateForm.controls[element.field_name].setValue(dropdownValue);
                break;
              default:
                break;
            }
          }
        });
      }
    }
  }
  
  
  checkValidator(action_button){
    const field_name = action_button.field_name.toLowerCase();
    switch (field_name) {
      case "save":
      case "update":
      case "updateandnext":
      case "send_email":
        return !this.templateForm.valid;
      default:
        return;
    }      
  }

  getTypeahead(event, parentfield, field) { 
    const value = event.target.value;
    this.templateForm.get(field.field_name).setValue(value);
    let objectValue = this.getFormValue(false); 
    // if(field.datatype == 'text'){
    //   let typeaheadTextControl:any = {}
    //   if(parentfield != ''){
    //     typeaheadTextControl = this.templateForm.get(parentfield.field_name).get(field.field_name);    
    //   }else{
    //     typeaheadTextControl = this.templateForm.controls[field.field_name];
    //   }  
    //   if(objectValue[field.field_name] == null || objectValue[field.field_name] == '' || objectValue[field.field_name] == undefined){
    //     if(field.is_mandatory){
    //       typeaheadTextControl.setErrors({ required: true });
    //     }else{
    //       typeaheadTextControl.setErrors(null);
    //     }        
    //   }else{        
    //     typeaheadTextControl.setErrors({ validDataText: true });
    //   }      
    // }
    this.callTypeaheadData(field,objectValue);       

  }
  get templateFormControl() {
    return this.templateForm.controls;
  }

  callTypeaheadData(field,objectValue){
    this.clearTypeaheadData();   
    const payload = [];
    const params = field.api_params;
    const criteria = field.api_params_criteria;
    payload.push(this.restService.getPaylodWithCriteria(params, '', criteria, objectValue));
    this.apiService.GetTypeaheadData(payload);    
  }
  clearTypeaheadData() {
    this.apiService.clearTypeaheadData();
  }
  // setValue(){
  //   this.typeAheadData = [];
  // }
  setValue(parentfield,field, add,event?) {

    let formValue = this.templateForm.getRawValue()    
    switch (field.type) {
      case "list_of_string":
        // if (add) {
        //   if(parentfield != ''){
        //     const custmizedKey = this.commonFunctionService.custmizedKey(parentfield);   
        //     const value = formValue[parentfield.field_name][field.field_name]
        //     if(this.checkDataAlreadyAddedInListOrNot(field.field_name,value, this.custmizedFormValue[custmizedKey][field.field_name])){
        //       this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
        //     }else{
        //       if (!this.custmizedFormValue[custmizedKey]) this.custmizedFormValue[custmizedKey] = {};
        //       if (!this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
        //       const custmizedFormValueParant = Object.assign([],this.custmizedFormValue[custmizedKey][field.field_name])
        //       if(value != '' && value != null){
        //         custmizedFormValueParant.push(value)            
        //         this.custmizedFormValue[custmizedKey][field.field_name] = custmizedFormValueParant;
        //       }
        //       if(event){
        //         event.value = '';
        //       }
        //       this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
        //       //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
        //       this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
        //     }
            
        //   }else{
        //     const value = formValue[field.field_name];
        //     if(this.checkDataAlreadyAddedInListOrNot(field.field_name,value,this.custmizedFormValue[field.field_name])){
        //       this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
        //     }else{
        //       if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
        //       const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
        //       if(formValue[field.field_name] != '' && formValue[field.field_name] != null){
        //         custmizedFormValue.push(formValue[field.field_name])
        //         this.custmizedFormValue[field.field_name] = custmizedFormValue;
        //       }
        //       if(event){
        //         event.value = '';
        //       }
        //       this.templateForm.controls[field.field_name].setValue("");
        //       this.tempVal[field.field_name + "_add_button"] = true;
        //     }
        //   }  
        // } else {
        //   if(parentfield != ''){
        //     if(formValue && formValue[parentfield.field_name] && formValue[parentfield.field_name][field.field_name].length > 0){
        //       this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = false;
        //     }else{
        //       this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
        //     }            
        //   }else{
        //     if(formValue && formValue[field.field_name] && formValue[field.field_name].length > 0){
        //       this.tempVal[field.field_name + "_add_button"] = false;
        //     }else{
        //       this.tempVal[field.field_name + "_add_button"] = true;
        //     }
        //   } 
        // }
        break;
      case "typeahead":
        if(field.datatype == 'list_of_object' || field.datatype == 'chips' || field.datatype == 'object'){
          // if (add) {
          //   if(parentfield != ''){
          //     const value = formValue[parentfield.field_name][field.field_name]
          //     const custmizedKey = this.commonFunctionService.custmizedKey(parentfield);
          //     if(this.checkDataAlreadyAddedInListOrNot(field.field_name,value, this.custmizedFormValue[custmizedKey][field.field_name])){
          //       this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
          //     }else{
          //       if (!this.custmizedFormValue[custmizedKey]) this.custmizedFormValue[custmizedKey] = {};
          //       if (!this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
          //       const custmizedFormValueParant = Object.assign([],this.custmizedFormValue[custmizedKey][field.field_name])
          //       custmizedFormValueParant.push(value)            
          //       this.custmizedFormValue[custmizedKey][field.field_name] = custmizedFormValueParant;
          //       if(event){
          //         event.value = '';
          //       }
          //       this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
          //       //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
          //       this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = true;
          //     }
              
          //   }else{
          //     const value = formValue[field.field_name];
          //       if(this.checkDataAlreadyAddedInListOrNot(field.field_name,value,this.custmizedFormValue[field.field_name])){
          //         this.notificationService.notify('bg-danger','Entered value for '+field.label+' is already added. !!!');
          //       }else{
          //         if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
          //         const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
          //         custmizedFormValue.push(value)
          //         this.custmizedFormValue[field.field_name] = custmizedFormValue;
          //         if(event){
          //           event.value = '';
          //         }             
          //         this.templateForm.controls[field.field_name].setValue('');
          //         this.tempVal[field.field_name + "_add_button"] = true;
          //       }
          //   }  
          // }else {
          //   if(parentfield != ''){
          //     const value = formValue[parentfield.field_name][field.field_name]  
          //     if(value == "add_new"){
          //       this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
          //       //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");
          //       this.storeFormDetails(parentfield,field);
          //     }else{            
          //       this.tempVal[parentfield.field_name + '_' + field.field_name + "_add_button"] = false;
          //     }
          //   }else{  
          //     const value = formValue[field.field_name]; 
          //     if(value == "add_new"){
          //       this.templateForm.controls[field.field_name].setValue('');
          //       this.storeFormDetails(parentfield,field);
          //     }else if(field.datatype == 'object' && field.onchange_get_next_form){
          //       this.onchangeNextForm = true;
          //       const reqCriteria = ["_id;eq;" + value._id + ";STATIC"];
          //       const reqParams = field.api_params;
          //       this.getDataForNextForm(reqParams,reqCriteria);
          //       this.tempVal[field.field_name + "_add_button"] = false;
          //     }else{           
          //       this.tempVal[field.field_name + "_add_button"] = false;
          //     }
          //   }          
          // }
        }else if(field.datatype == 'text'){
          let typeaheadTextControl:any = {}
          if(parentfield != ''){
            typeaheadTextControl = this.templateForm.get(parentfield.field_name).get(field.field_name);    
          }else{
            typeaheadTextControl = this.templateForm.controls[field.field_name];
          } 
          typeaheadTextControl.setErrors(null);
        }
        break;
      case "dropdown":
        if(!add){
          let value:any='';
          if(parentfield != ''){            
            if(field.multi_select){
              const fValue:any = formValue[parentfield.field_name][field.field_name];
              if(fValue && fValue.length > 0){
                fValue.forEach(element => {
                  if(element == "add_new"){
                    value = "add_new";
                  }
                });
              }
            }else{
              value = formValue[parentfield.field_name][field.field_name];              
            } 
            // if(value == "add_new"){
            //   this.storeFormDetails(parentfield,field);
            //   this.templateForm.get(parentfield.field_name).get(field.field_name).setValue("");
            //   //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[field.field_name].patchValue("");              
            // }             
          }else{ 
            if(field.multi_select){
              const fValue:any = formValue[field.field_name];
              if(fValue && fValue.length > 0){
                fValue.forEach(element => {
                  if(element == "add_new"){
                    value = "add_new";
                  }
                });
              }
            }else{
              value = formValue[field.field_name];               
            } 
            // if(value == "add_new"){
            //   this.storeFormDetails(parentfield,field);
            //   this.templateForm.controls[field.field_name].setValue('');              
            // }            
          }
        }
        break;
      case "list_of_fields":
//         let checkValue = 0;
//         let list_of_field_data = formValue[field.field_name]
//         let field_control = this.templateForm.get(field.field_name);        
//         for (let index = 0; index < field.list_of_fields.length; index++) {
//           const element = field.list_of_fields[index];
//           const custmizedKey = this.commonFunctionService.custmizedKey(field);
//           let custmizedData = '';
//           let mendatory = false;
//           if(element.is_mandatory){
//             if(element && element.show_if && element.show_if != ''){
//               if(this.checkFieldShowOrHide(element)){
//                 mendatory = true;
//               }else{
//                 mendatory = false;
//               }
//             }else{
//               mendatory = true;
//             }            
//           }
//           if(this.custmizedFormValue[custmizedKey] && this.custmizedFormValue[custmizedKey][element.field_name]){
//             custmizedData = this.custmizedFormValue[custmizedKey][element.field_name]
//           }         
//           switch (element.datatype) {
//             case 'list_of_object':              
//               if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
//                 if(mendatory && custmizedData == ''){
//                   if(custmizedData.length == 0){
//                     checkValue = 1;
//                     this.notificationService.notify("bg-danger", "Please Enter " + element.label);
//                     return;
//                   }
//                 }
//               }else{
//                 this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
//                 return;
//               }
//               break; 
//             case 'object':
//               if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
//                 if(mendatory){                  
//                   checkValue = 1;
//                   this.notificationService.notify("bg-danger", "Please Enter " + element.label);
//                   return;    
//                 }
//               }else if(typeof list_of_field_data[element.field_name] != 'object'){
//                 this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
//                 return;
//               }
//               break;         
//             default:
//               break;
//           }
//           switch (element.type) {
//             case 'list_of_string':
//               if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
//                 if(mendatory && custmizedData == ''){
//                   if(custmizedData.length == 0){
//                     checkValue = 1;
//                     this.notificationService.notify("bg-danger", "Please Enter " + element.label);
//                     return;
//                   }
//                 }
//               }else{
//                 this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
//                 return;
//               }
//               break;  
//             case 'typeahead':
//               if(element.datatype == "text"){
//                 if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
//                   if(mendatory){
//                     if(custmizedData.length == 0){
//                       checkValue = 1;
//                       this.notificationService.notify("bg-danger", "Please Enter " + element.label);
//                       return;
//                     }
//                   }
//                 }else if(field_control.get(element.field_name).errors?.required || field_control.get(element.field_name).errors?.validDataText){
//                   this.notificationService.notify('bg-danger','Entered value for '+element.label+' is invalidData. !!!');
//                   return;
//                 }

//               }
//               break;        
//             default:
//               if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
//                 if(mendatory ){
//                   checkValue = 1;
//                   this.notificationService.notify("bg-danger", "Please Enter " + element.label);
//                 }
//               }
//               break;
//           }


//           if(element.primary_key_for_list){
//             let primary_key_field_name = element.field_name;
//             let primary_key_field_value = formValue[field.field_name][element.field_name];
//             let list = this.custmizedFormValue[field.field_name];
//             let alreadyAdded = this.checkDataAlreadyAddedInListOrNot(primary_key_field_name,primary_key_field_value,list);
//             if(alreadyAdded){
//               this.notificationService.notify('bg-danger','Entered value for '+element.label+' is already added. !!!');
//               return;
//             }
//           }
          
//         };
//         if (checkValue == 0) {
//           if(this.listOfFieldsUpdateIndex != -1){
//             //if(this.updateMode){
//               let updateCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
//               Object.keys(formValue[field.field_name]).forEach(key => {
//                 updateCustmizedValue[this.listOfFieldsUpdateIndex][key] = formValue[field.field_name][key];
//               })
// // pending for review by vikash (from)
//               const keyName=field.field_name+'_'+field.type;
//               if(this.custmizedFormValue[keyName]){
//                 Object.keys(this.custmizedFormValue[keyName]).forEach(childkey => {
//                   updateCustmizedValue[this.listOfFieldsUpdateIndex][childkey] = this.custmizedFormValue[keyName][childkey];
//                 })
//               }
//               if(this.dataListForUpload[keyName]){
//                 Object.keys(this.dataListForUpload[keyName]).forEach(childkey => {                  
//                   updateCustmizedValue[childkey] = this.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);
//                 })
//               }
//               if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
//                 this.checkBoxFieldListValue.forEach(listofcheckboxfield => {
//                   const fieldName = listofcheckboxfield.field_name;
//                   if (this.staticData[listofcheckboxfield.ddn_field] && formValue[field.field_name][fieldName]) {                    
//                     const listOfCheckboxData = [];
//                     let data = formValue[field.field_name][fieldName];                    
//                     let currentData = this.staticData[listofcheckboxfield.ddn_field];
//                     if(data && data.length > 0){
//                       data.forEach((data, i) => {
//                         if (data) {
//                           listOfCheckboxData.push(currentData[i]);
//                         }
//                       });
//                     }
//                     updateCustmizedValue[this.listOfFieldsUpdateIndex][fieldName] = listOfCheckboxData;                    
//                   }
//                 });
//               }
//               // pending for review by vikash (to)
//               this.custmizedFormValue[field.field_name] =   updateCustmizedValue; 
//               this.custmizedFormValue[keyName] = {}
//             // }else{
//             //   const updateCustmizedValue = JSON.parse(JSON.stringify(this.custmizedFormValue[field.field_name]))
//             //   updateCustmizedValue[this.listOfFieldsUpdateIndex] = JSON.parse(JSON.stringify(formValue[field.field_name]))
//             //   this.custmizedFormValue[field.field_name] =   updateCustmizedValue  ;  
//             //   const keyName=field.field_name+'_'+field.type;
//             //   this.custmizedFormValue[keyName] = {}        
//             // }
//             this.refreshListofField(field,false);            
//           }else{
//             if(field.datatype == 'key_value'){
//               if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = {};
//               const listOfFieldData = formValue[field.field_name]
//               if(listOfFieldData.key && listOfFieldData.key != '' && listOfFieldData.value && listOfFieldData.value != ''){
//                 this.custmizedFormValue[field.field_name][listOfFieldData.key] = listOfFieldData.value;
//               }              
//             }else{
//               if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
//               const custmizedFormValue = Object.assign([],this.custmizedFormValue[field.field_name])
//               const listOfFieldData = JSON.parse(JSON.stringify(formValue[field.field_name]))
//               const keyName=field.field_name+'_'+field.type;
//               if(this.custmizedFormValue[keyName]){
//                 Object.keys(this.custmizedFormValue[keyName]).forEach(childkey => {
//                   listOfFieldData[childkey] = this.custmizedFormValue[keyName][childkey];
//                 })
//               }
//               if(this.dataListForUpload[keyName]){
//                 Object.keys(this.dataListForUpload[keyName]).forEach(childkey => {                 
//                   listOfFieldData[childkey] = this.modifyUploadFiles(this.dataListForUpload[keyName][childkey]);
//                 })
//               }
//               if (this.checkBoxFieldListValue.length > 0 && Object.keys(this.staticData).length > 0) {
//                 this.checkBoxFieldListValue.forEach(listofcheckboxfield => {
//                   const fieldName = listofcheckboxfield.field_name;
//                   if (this.staticData[listofcheckboxfield.ddn_field] && formValue[field.field_name][fieldName]) {                    
//                     const listOfCheckboxData = [];
//                     let data = formValue[field.field_name][fieldName];                    
//                     let currentData = this.staticData[listofcheckboxfield.ddn_field];
//                     if(data && data.length > 0){
//                       data.forEach((data, i) => {
//                         if (data) {
//                           listOfCheckboxData.push(currentData[i]);
//                         }
//                       });
//                     }
//                     listOfFieldData[fieldName] = listOfCheckboxData;                    
//                   }
//                 });
//               }
              
//               custmizedFormValue.push(listOfFieldData);
//               this.custmizedFormValue[field.field_name] = custmizedFormValue;
//               // if (field.onchange_api_params && field.onchange_call_back_field) {
//               //   const value = this.getFormValue(false);
//               //   this.changeDropdown(field.onchange_api_params, field.onchange_call_back_field, field.onchange_api_params_criteria, value,field.onchange_data_template);
//               // }
//               this.custmizedFormValue[keyName] = {}              
//             }
//             this.refreshListofField(field,true);
//           }
//           if(field.do_not_refresh_on_add && this.listOfFieldsUpdateIndex == -1){
//             this.tableFields.forEach(tablefield => {
//               if(tablefield.field_name == field.field_name){
//                 tablefield.list_of_fields.forEach(fld => {
//                   if(!fld.do_not_refresh_on_add){
//                     this.templateForm.get(tablefield.field_name).get(fld.field_name).setValue('');
//                   }
//                 });
//               }
//             });
//           }else{
//             this.templateForm.get(field.field_name).reset(); 
//           }         
//         }
        break;
      case 'grid_selection':
      case 'grid_selection_vertical':
        // this.curTreeViewField = field;
        // this.currentTreeViewFieldParent = parentfield;
        // if (!this.custmizedFormValue[field.field_name]) this.custmizedFormValue[field.field_name] = [];
        // const gridModalData = {
        //   "field": this.curTreeViewField,
        //   "selectedData":this.custmizedFormValue[field.field_name],
        //   "object": this.getFormValue(true)
        // }
        // this.modalService.open('grid-selection-modal', gridModalData);
        break;
      default:
        break;
    }
    
    if (field.onchange_api_params && field.onchange_call_back_field) {
      let formValue = this.getFormValue(false);
      this.changeDropdown(field, formValue,field.onchange_data_template);
    }

    // if (field.onchange_function && field.onchange_function_param && field.onchange_function_param != "") {
    //   switch (field.onchange_function_param) {        
    //       case 'autopopulateFields':
    //         this.commonFunctionService.autopopulateFields(this.templateForm);
    //         break;
    //     default:
    //       this.inputOnChangeFunc(field);
    //   }
    // }
    let objectValue:string = "";
    let supporting_field_type = "";
    if(typeof formValue[field.field_name] == 'object'){
      if('COMPLETE_OBJECT' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["COMPLETE_OBJECT"];
        delete formValue[field.field_name]["COMPLETE_OBJECT"]
        this.selectedRow = objectValue;
        this.complete_object_payload_mode = true;
        supporting_field_type = "COMPLETE_OBJECT";
      } 
      if('FORM_FIELDS' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["FORM_FIELDS"];
        delete formValue[field.field_name]["FORM_FIELDS"]
      }
      if('STATIC_FIELDS' in formValue[field.field_name]){
        objectValue =formValue[field.field_name]["STATIC_FIELDS"];
        delete formValue[field.field_name]["STATIC_FIELDS"]
      }
      if(objectValue != '' && typeof objectValue == 'object'){
        this.updateDataOnFormField(objectValue);   
        if(supporting_field_type == "COMPLETE_OBJECT") {
          this.getStaticDataWithDependentData();     
        }    
      }      
    }  
    else if(parentfield && typeof formValue[parentfield.field_name][field.field_name] == 'object'){
      if('COMPLETE_OBJECT' in formValue[parentfield.field_name][field.field_name]){
        objectValue =formValue[parentfield.field_name][field.field_name]["COMPLETE_OBJECT"];
        delete formValue[parentfield.field_name][field.field_name]["COMPLETE_OBJECT"]
        this.selectedRow = objectValue;
        this.complete_object_payload_mode = true;
      } 
      if('FORM_FIELDS' in formValue[parentfield.field_name][field.field_name]){
        objectValue =formValue[parentfield.field_name][field.field_name]["FORM_FIELDS"];
        delete formValue[parentfield.field_name][field.field_name]["FORM_FIELDS"]
      }
     if(objectValue != '' && typeof objectValue == 'object'){

      Object.keys(objectValue).forEach(key => {
        this.templateForm.get(parentfield.field_name).get(key).setValue(objectValue[key]);
        //(<FormGroup>this.templateForm.controls[parentfield.field_name]).controls[key].patchValue(objectValue[key]);
      });
        // this.updateDataOnFormField(objectValue);   
        // this.getStaticDataWithDependentData();     
      }      
    }  
 
    if (field.type == 'typeahead') {
      this.clearTypeaheadData();
    }

  }
  changeDropdown(field, object,data_template) {
    let params = field.onchange_api_params;
    let callback = field.onchange_call_back_field;
    let criteria = field.onchange_api_params_criteria;
    const paramlist = params.split(";");
    if(paramlist.length>1){
      
    }else{
      // if(callback != ''){        
      //   const fieldName = {
      //     "field" : callback
      //   }
      //   this.commonFunctionService.resetStaticDataByKey(fieldName);
      // }
      const staticModal = []
      
      if( params.indexOf("CLTFN") >= 0){
        // const calculatedCost =  this.commonFunctionService.calculateAdditionalCost(this.getFormValue(true));
        // this.updateDataOnFormField(calculatedCost);
      }
      else{
        staticModal.push(this.restService.getPaylodWithCriteria(params, callback, criteria, object))      
        if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
          if(field && field.formValueAsObjectForQtmp){
            staticModal[0]["data"]=this.getFormValue(false);
          }else{
            staticModal[0]["data"]=this.getFormValue(true);
          }
        }
        // this.store.dispatch(
        //   new CusTemGenAction.GetStaticData(staticModal)
        // )
        this.apiService.getStatiData(staticModal);
      }
   }
  }

  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

  fileDrop: boolean = false;
  /**
	 * handle file from browsing
	 */
   fileBrowseHandler(parent,field,files) {
    this.curFileUploadField = field;
    this.curFileUploadFieldparentfield = parent;
    this.fileDrop = false;
    this.prepareFilesList(files);
  }

	/**
	 * Delete file from files list
	 * @param index (File index)
	 */
  deleteFile(index: number) {
    this.uploadData.splice(index, 1);
  }

	/**
	 * Simulate the upload process
	 */



	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
   files: any[] = [];
  public xtr: any;
  public obj: any = {};
  public uploadData: any = []
  public uploadFilesData: any = [];
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      this.uploadFilesData.push(file);
      var reader = new FileReader();
      reader.onload = this.readNoticeFile
      reader.readAsDataURL(file);
    }
    // console.log(this.files);
    // console.log(this.uploadData);
    this.fileUploadResponce(this.uploadData)

  }
  readNoticeFile = (e) => {
    var rxFile = this.uploadFilesData[0];
    this.uploadFilesData.splice(0, 1);
    this.uploadData.push({
      fileData: e.target.result.split(',')[1],
      fileName: rxFile.name,
      fileExtn:  rxFile.name.split(".").pop(),
      // size: rxFile.size,
      innerBucketPath: rxFile.name,
      log: this.storageService.getUserLog()
    });

  }
  fileUploadResponce(response) {

    if(this.curFileUploadFieldparentfield != ''){
      const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield);            
      if (!this.dataListForUpload[custmizedKey]) this.dataListForUpload[custmizedKey] = {};
      if (!this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]) this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] = [];
      this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] = response;
    }else{
      if (!this.dataListForUpload[this.curFileUploadField.field_name]) this.dataListForUpload[this.curFileUploadField.field_name] = [];
      this.dataListForUpload[this.curFileUploadField.field_name] = response;
    }
    
    if(this.curFileUploadFieldparentfield != ''){
      const custmizedKey = this.commonFunctionService.custmizedKey(this.curFileUploadFieldparentfield); 
      if(this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name] && this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name].length > 0){
        let fileName = this.commonFunctionService.modifyFileSetValue(this.dataListForUpload[custmizedKey][this.curFileUploadField.field_name]);        
        this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
        this.templateForm.get(this.curFileUploadFieldparentfield.field_name).get(this.curFileUploadField.field_name).setValue('');
      }
    }else{    
      if(this.dataListForUpload[this.curFileUploadField.field_name] && this.dataListForUpload[this.curFileUploadField.field_name].length > 0){
        let fileName = this.commonFunctionService.modifyFileSetValue(this.dataListForUpload[this.curFileUploadField.field_name]);
        this.templateForm.get(this.curFileUploadField.field_name).setValue(fileName);
      }else{
        this.templateForm.get(this.curFileUploadField.field_name).setValue('');
      }
    }
    // if(this.dataListForUpload[this.curFileUploadField.field_name] && this.dataListForUpload[this.curFileUploadField.field_name].length > 0){
    //   this.dataListForUpload[this.curFileUploadField.field_name].forEach(element => {
    //     this.uploadFilesList = Object.assign([], this.uploadFilesList);
    //     if(element._id){
    //       this.uploadFilesList.push(element)
    //     }else{
    //       this.uploadFilesList.push({uploadData:[element]})
    //     }        
    //   });
    // } 
    // for(var i=0 ; i<response.length ; i++){ 
    //   let element = response[i];
    //   //this.dataListForUpload[this.curFileUploadField.field_name].push(response[i]); 
    //   this.uploadFilesList = Object.assign([], this.uploadFilesList);
    //     if(element._id){
    //       this.uploadFilesList.push(element)
    //     }else{
    //       this.uploadFilesList.push({uploadData:[element]})
    //     }    
    //   var item = response[i];
    //   var obj = {uploadData:[item]};      
    //   this.uploadFilesList.push(obj)
    // }       
    
    // Object.keys(this.templateForm.value).forEach(key => {   
    //   let list = []
    //   let array = [];

    //   if(this.dataListForUpload[key] != "" && this.dataListForUpload[key] != null && this.dataListForUpload[key].length > 0){
    //     this.dataListForUpload[key].forEach(element => {
    //       if(element._id){
    //         array.push(element);
    //       }
    //       else{
    //         array.push({uploadData:[element]})
    //       }
    //       // var obj = {uploadData:[element]}; 
    //       // this.dataListForUpload[key].push(obj)
    //     });
    //   }
     
    //   if(key != this.curFileUploadField.field_name && array.length > 0){
    //     this.templateForm.controls[key].setValue(array);
    //   }
    // })

    //this.templateForm.controls[this.curFileUploadField.field_name].setValue(this.uploadFilesList);
    //this.uploadFilesList = [];
    // if (response && response.length > 0) {
    //   this.notificationService.notify("bg-success", response.length + " Documents Uploaded successfull !!!");      
    // }
    // this.curFileUploadField = {};
  }
  isDisable(parent,chield){
    const  formValue = this.getFormValue(true); 
    let tobedesabled;
    if(parent == ''){
      tobedesabled = this.commonFunctionService.isDisable(chield,this.updateMode,formValue)
      if(tobedesabled){
        if(!this.templateForm.get(chield.field_name).disabled){
          this.templateForm.get(chield.field_name).disable()
        }        
      }else{
        if(this.templateForm.get(chield.field_name).disabled){
          this.templateForm.get(chield.field_name).enable()
        }        
      }
    }else{
      tobedesabled = this.commonFunctionService.isDisable(chield,this.updateMode,formValue)
      if(tobedesabled){
        this.templateForm.get(parent).get(chield.field_name).disable()
      }else{
        this.templateForm.get(parent).get(chield.field_name).enable()
      }
    }   
        
    return tobedesabled;
  }
  handleDisabeIf(){
    // if(this.checkFormFieldAutfocus && this.tableFields.length > 0){
    //   if(this.previousFormFocusField && this.previousFormFocusField._id){
    //     this.focusField("",this.previousFormFocusField)        
    //   }else{
    //     if(this.previousFormFocusField == undefined || this.previousFormFocusField._id == undefined){
    //       for (const key of this.tableFields) {
    //         if(key.type == "stepper"){
    //           if(key.list_of_fields && key.list_of_fields != null && key.list_of_fields.length > 0){
    //             for (const step of key.list_of_fields) {
    //               if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
    //                 for (const field of step.list_of_fields) {
    //                   if (field.field_name) {
    //                     this.focusField(step,field);  
    //                     break;
    //                   }
    //                 }
    //               }                
    //             }
    //           }
    //         }else if (key.field_name) {
    //           this.focusField("",key);  
    //           break;
    //         }              
    //       }
    //     }
    //   }
    // }
    if(this.disableIfFieldList.length > 0){
      this.disableIfFieldList.forEach(element => {
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          this.isDisable(element.parent,element);
        }else{
          this.isDisable('',element)
        }
      });
    }
    if(this.showIfFieldList.length > 0){
      this.showIfFieldList.forEach(element => {
        let id = '';
        if(element.parent && element.parent != undefined && element.parent != '' && element.parent != null ){
          id = element._id;
        }else{
          id = element._id;
        }
        let elementDetails = document.getElementById(id);
        if(!this.showIf(element)){          
          if(elementDetails && elementDetails != null){
            const classes = Array.from(elementDetails.classList)
            if(!classes.includes('d-none')){
              this.removeClass(elementDetails,' d-inline-block');
              elementDetails.className += " d-none";
              element['show'] = false;
              const objectValue = this.templateForm.getRawValue();
              if(element.type != "group_of_fields" && element.type != "list_of_fields" && objectValue[element.field_name] && objectValue[element.field_name] != ''){
                this.templateForm.get(element.field_name).setValue('');
              } 
              if(element.type == "group_of_fields" || element.type == "list_of_fields"){
                this.templateForm.get(element.field_name).reset();
                element.list_of_fields.forEach(field => {
                  if(field.type == 'list_of_string' || field.datatype == "list_of_object" || element.datatype == "chips" || element.datatype == "chips_with_mask"){
                    const custmizedKey = this.commonFunctionService.custmizedKey(element);            
                    if (this.custmizedFormValue[custmizedKey]){ 
                      if (this.custmizedFormValue[custmizedKey][field.field_name]) this.custmizedFormValue[custmizedKey][field.field_name] = [];
                    }
                  }
                });
              }  
              if(element.type == 'list_of_string' || element.datatype == "list_of_object" || element.datatype == "chips" || element.datatype == "chips_with_mask"){
                if (this.custmizedFormValue[element.field_name]) this.custmizedFormValue[element.field_name] = [];
              }         
              if(element.is_mandatory){
                if(this.templateFormControl[element.field_name].status == 'INVALID'){
                  this.templateForm.get(element.field_name).clearValidators();
                  this.templateForm.get(element.field_name).updateValueAndValidity();
                }              
              }
            }            
          }                
        }else{          
          if(elementDetails && elementDetails != null){
            const classes = Array.from(elementDetails.classList)
            if(!classes.includes('d-inline-block')){
              this.removeClass(elementDetails,' d-none');
              elementDetails.className += " d-inline-block"; 
              element['show'] = true;
              if(element.is_mandatory){
                if(this.templateFormControl[element.field_name].status == 'VALID'){
                  this.templateForm.get(element.field_name).setValidators([Validators.required]);
                  this.templateForm.get(element.field_name).updateValueAndValidity();
                }              
              }
            }            
          }
        }
      });
      return true;
    }
    if(this.disableIfFieldList.length == 0 && this.showIfFieldList.length == 0){
      return true;
    }    
    
  }
  removeClass = (element, name) => {    
    element.className = element.className.replace(name, "");
  }
  showIf(field){
    const  objectc = this.selectedRow?this.selectedRow:{}
    const object = JSON.parse(JSON.stringify(objectc));
    Object.keys(this.templateForm.getRawValue()).forEach(key => {
      object[key] = this.templateForm.getRawValue()[key];
    })
    const display = this.commonFunctionService.showIf(field,object);
    const modifiedField = JSON.parse(JSON.stringify(field));
    modifiedField['display'] = display; 
    field = modifiedField;
    return display;
  }
  formControlChanges(){
    if(this.templateForm && this.templateForm.valueChanges && this.templateForm.valueChanges != null){
      this.templateForm.valueChanges.subscribe(val => {
        this.handleDisabeIf();
      });
    }    
  }
  

}
