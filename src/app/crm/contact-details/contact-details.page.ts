import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { EnvService, StorageService, RestService, CoreUtilityService } from '@core/ionic-core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ModalController, PopoverController } from '@ionic/angular';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { SocialOptionComponent } from '../social-option/social-option.component';
import { SmsRetriever } from '@ionic-native/sms-retriever'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IonLoaderService } from 'src/app/service/ion-loader.service';
import { CommonFunctionService } from '@core/web-core';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.page.html',
  styleUrls: ['./contact-details.page.scss'],
})
export class ContactDetailsPage implements OnInit {

  childData: any = {};
  tabMenu: any =[];
  result: any;
  childDataTitle: any;
  childLastName: any;
  designation: any;
  profileText: string;
  personName: string;
  mobile: number;
  selectedIndex=-1;
  cardType='';
  countryCode: string = "91";
  whatsappNumber: string;
  whatsappUrl: string;
  whatsappMsg: string;
  commonMsg: string;
  childTabCollectionname:string;
  contactDetailcardType:any = 'contactdetail';

  //copy from qutation
  carddata: any;
  columnList: any = [];
  filterTerm: string;
  cardList: any = [];
  collectionname: any;
  childColumn: any = {};
  createFormgroup: boolean = true;
  filterForm: FormGroup;
  filterCount: number;
  childColumns : any;
  childCardType: string = "";
  childTabMenu: any=[];

  constructor(
    public popoverController: PopoverController, 
    private modalController: ModalController,
    private dataShareServiceService:DataShareServiceService,
    private envService: EnvService,
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router,
    private currencyPipe: CurrencyPipe,
    private callNumber: CallNumber,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private CurrencyPipe: CurrencyPipe,
    private ionLoaderService: IonLoaderService,
    private restService: RestService,    
    private commonFunctionService:CommonFunctionService,
    private coreUtilityService: CoreUtilityService
  ) {}

  ngOnInit() {
    // this.carddata = '';
    // this.router.events.pipe(
    //   filter((event: RouterEvent) => event instanceof NavigationEnd)
    // ).subscribe(() => {
    //   this.getCardDataByCollection();
    // });
    this.getCardDataByCollection();
    this.getChildData();
  }

  private getCardDataByCollection() {
    const cardData = this.dataShareServiceService.getCardMasterData();
    // this.setCardDetails(cardData);
    this.getChildData();
    
  }

  getChildData() {
    this.childData = this.dataShareServiceService.getchildCardData();
    this.tabMenu = this.childData.childtabmenu;
    this.commonFunction(this.tabMenu[0])
    this.childDataTitle = this.childData.childdata.first_name;
    this.contactDetailcardType = this.childData.childcardtype.name;
    this.childLastName = this.childData.childdata.last_name;
    if (this.childDataTitle !== '' && this.childLastName !== '') {
      this.profileText = this.childDataTitle[0] + this.childLastName[0];
      this.personName = this.childDataTitle + " " + this.childLastName;
    } else {
      this.profileText = this.childDataTitle[0];
      this.personName = this.childDataTitle;
    }
    this.designation = this.childData.childdata.designation;
    this.mobile = this.childData.childdata.mobile;
    this.commonMsg = "Hello," + this.personName;
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: SocialOptionComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  call(providerNumber: any) {
    this.callNumber.callNumber(providerNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
      console.log(providerNumber);
  }
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    this.router.navigate(['crm/quotation']);
    this.dataShareServiceService.setcardData(card);
  }

  sendemail(){
    var link = "mailto:" + this.childData.childdata.email + "?subject=Hi,"+ this.childData.childdata.name +"Contact%20Details&body=Hello, I need Some Information.";     
    window.location.href = link;
 }

  sendwhatsapp(){
    //  this.whatsappUrl = "https://api.whatsapp.com/send?phone=919756054965&amp;text=I%20want%20to%20find%20out%20about%20your%20products";

    this.whatsappUrl = "https://wa.me/";
    this.whatsappMsg = "?text=Hello,%20" + this.personName;
    let urllink =  this.whatsappUrl + this.countryCode + this.mobile + this.whatsappMsg;
    window.location.href = urllink;
  }
  sendsms(){
    let smsMsg = "?text=Hello," + this.personName;
    let smslink =  "sms:" + this.mobile + "?subject=Hi,"+ this.childData.childdata.name +"Contact%20Details&body=Hello,%20I%20need%20Some%20Information.";
    window.location.href = smslink;
  }
  callInvoice(card:any,Index:number) {
    let callingNumber:any;
    if(card.billing_mobile !=''){
      callingNumber = card.billing_mobile;
    }
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
  }
  // for cards 
  tabmenuClick(data:any , index:number){
    this.commonFunction(data);
  }

  commonFunction(data:any) {
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        let crList = [];
          if(data && data._id != ''){
            let criteria = {
                  "fName": "_id",
                  "fValue": data._id,
                  "operator": "eq"
            }
            crList.push(criteria);
          }
        // this.ionLoaderService.autohideLoader('Setting Up The App for You');
        let obj = {
          crList: crList,
          key1: "MCLR01",
          key2: "CRM",
          log: await this.storageService.getUserLog(),
          pageNo: 0,
          pageSize: 50,
          value: "card_master"
        }
        let api = this.envService.baseUrl('GET_GRID_DATA');
        let newtabMenu = [];
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            // this.loaderService.hideLoader();
            this.cardList = respData['data'];
              // this.showCardTemplate(this.cardList[0],0);
              this.collectionname = this.cardList[0].collection_name;
              // this.cardType = this.cardList[0].card_type.name;
              // this.getcardData(this.collectionname);
             this.setCardDetails(this.cardList[0]);
          },
          (err: HttpErrorResponse) => {
            // this.loaderService.hideLoader();
            console.log(err.error);
          }
        )
      }
    })
  }
  
  setCardDetails(card) {
    // this.cardListSubscription = this.dataShareServiceService.getCardList();
    // this.cardListSubscription.forEach(element => {
    //   if(element._id == this.dataShareServiceService.parentcardid){
    //     this.parentcard = element;
    //   }
    // });
    // this.tabMenu = this.parentcard.tab_menu;

    // this.cardtitle = card.name;
    if (card.card_type !== '') {
      this.cardType = card.card_type.name;
    }
    this.childColumn = card.child_card;
    this.columnList = card.fields;
    if (this.columnList && this.columnList.length > 0 && this.createFormgroup) {
      this.createFormgroup = false;
      const forControl = {};
      this.columnList.forEach(element => {
        switch (element.type) {
          case "abcd":
            break;

          default:
            this.commonFunctionService.createFormControl(forControl, element, '', "text");
            break;
        }
      });
      if (forControl) {
        this.filterForm = this.formBuilder.group(forControl);
      }
    }
    this.collectionname = card.collection_name;
    //this.loadData(this.cardDataMasterSubscription);
    this.getcardData(this.collectionname);
  }

  // createFormControl(forControl, field, object, type) {
  //   let disabled = field.is_disabled ? true : ((field.disable_if != undefined && field.disable_if != '') ? true : false);
  //   switch (type) {
  //     case "list":
  //       forControl[field.field_name] = this.formBuilder.array(object, this.validator(field))
  //       break;
  //     case "text":
  //       switch (field.type) {
  //         case "gst_number":
  //           forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field))
  //           break;    
  //         default:
  //           forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
  //           break;
  //       }
  //       break;
  //     case "group":
  //       forControl[field.field_name] = this.formBuilder.group(object)
  //       break;
  //     default:
  //       break;
  //   }
  // }

  validator(field) {
    const validator = []
    if (field.is_mandatory != undefined && field.is_mandatory) {
      switch (field.type) {
        case "grid_selection":
        case "list_of_string":
          break;
        case "typeahead":
          if (field.datatype != 'list_of_object') {
            validator.push(Validators.required)
          }
          break;
        default:
          validator.push(Validators.required)
          break;
      }
    }else{
      switch (field.type){
        case "email":
          validator.push(Validators.email);
          break;
        default:
          break; 
      }
    }    
    if (field.min_length != undefined && field.min_length != null && field.min_length != '' && Number(field.min_length) && field.min_length > 0) {
      validator.push(Validators.minLength(field.min_length))
    }
    if(field.max_length != undefined && field.max_length != null && field.max_length != '' && Number(field.max_length) && field.max_length > 0){
      validator.push(Validators.maxLength(field.max_length))
    }       
    return validator;
  }

  getValueForGrid(field, object) {
    let value = '';
    if (field.field_name != undefined && field.field_name != null && field.field_name != '') {
      value = this.getObjectValue(field.field_name, object)
    }
    if (!field.type) field.type = "Text";
    switch (field.type.toLowerCase()) {
      case 'datetime': return this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
      case 'date': return this.datePipe.transform(value, 'dd/MM/yyyy');
      case 'time': return this.datePipe.transform(value, 'h:mm a');
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.CurrencyPipe.transform(value, 'INR');
      case "info":
        if (value && value != '') {
          return '<i class="fa fa-eye"></i>';
        } else {
          return '-';
        }
      case "file":
        if (value && value != '') {
          return '<span class="material-icons cursor-pointer">text_snippet</span>';
        } else {
          return '-';
        }
      case "template":
        if (value && value != '') {
          return '<i class="fa fa-file cursor-pointer" aria-hidden="true"></i>';
        } else {
          return '-';
        }
      case "image":
        return '<img src="' + value + '" />';
      case "icon":
        return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
      case "download_file":
        if (value && value != '') {
          return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
        }else{
          return '-';
        }
      case "trim_of_string":
        if(value != undefined && value != null && value != ''){
          if(typeof value == 'string'){
            let stringObject = value.split('/');
            if(stringObject.length > 0){
              return stringObject[0]
            }else{
              return value;
            } 
          }else{
            return value;
          }
        }else{
          return value;
        }      
        
      default: return value;
    }
  }

  getcardData(collection_name:any){
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        // this.ionLoaderService.showLoader(this.cardtitle);
        //this.loaderService.showLoader('null');
        this.carddata = '';
        let crList = [];
        let criteria:{};
        if(collection_name == 'invoices'){
          criteria = {
                "fName": "billing_contact_person",
                "fValue": this.personName,
                "operator": "eq"
          }
        }else{
          criteria = {
            "fName": "contact.name",
            "fValue": this.personName,
            "operator": "eq"
          }
        }
        crList.push(criteria);
        let obj = {
            // crList: this.getfilterCrlist(this.columnList, this.filterForm),
          crList: crList,
          key1: "MCLR01",
          key2: "CRM",
          log: await this.storageService.getUserLog(),
          pageNo: 0,
          pageSize: 50,
          value: collection_name
        }
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            if(respData['data'] && respData['data'].length > 0){
              this.carddata = respData['data'];
              this.filterCount = respData['data_size'];
            }else{              
              this.filterCount = respData['data'].length;
              this.cardType = '';
            // this.ionLoaderService.hideLoader();
            }
          },
          (err: HttpErrorResponse) => {
            this.ionLoaderService.hideLoader();
            console.log(err.error);
          }
        )
      }
    })
    
  }

  async detailCardButton(column, data){
    const cardmaster=this.dataShareServiceService.getCardList();
    const childColumn = this.childColumn;
    if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
      cardmaster.forEach(element => {
        if(element._id == childColumn._id ){
          this.childColumns = element.fields;
          this.childCardType = element.card_type;
          this.childTabMenu = element.tab_menu;
        }
      });
    }
    this.childData = data;
    
    // naviagte
    const newobj = {
      "childcardtype": this.childCardType,
      "childdata": this.childData,
      "childcolumns": this.childColumns,
      "childtabmenu": this.childTabMenu
    }
    this.dataShareServiceService.setchildDataList(newobj);
    // this.router.navigate(['crm/quotation-details']);
    if(this.cardType == 'contact'){
      // this.getChildData();
      this.router.navigate(['crm/contact-details']);
    }else{
      this.router.navigate(['crm/quotation-details']);
    }
  }

  getfilterCrlist(headElements,formValue) {
    const filterList = []
    if(formValue != undefined){
      const criteria = [];
      headElements.forEach(element => {        
        switch (element.type.toLowerCase()) {
          case "text":
          case "tree_view_selection":
          case "dropdown":
            if(formValue.value && formValue.value[element.field_name] != ''){              
              if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                element.api_params_criteria.forEach(cri => {
                  criteria.push(cri)
                });
              }else{
                filterList.push(
                  {
                    "fName": element.field_name,
                    "fValue": this.getddnDisplayVal(formValue.value[element.field_name]),
                    "operator": "stwic"
                  }
                )
              }
            }
            break;
          case "date":
          case "datetime":
            if(formValue.value && formValue.value[element.field_name] != ''){
              if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                element.api_params_criteria.forEach(cri => {
                  criteria.push(cri)
                });
              }else{
                filterList.push(
                  {
                    "fName": element.field_name,
                    "fValue": this.commonFunctionService.dateFormat(formValue.value[element.field_name]),
                    "operator": "eq"
                  }
                )
              }
            }
            break;
          case "daterange":
            if(formValue.value && formValue.value[element.field_name].start != '' && formValue.value[element.field_name].end != null){              
              if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                element.api_params_criteria.forEach(cri => {
                  criteria.push(cri)
                });
              }else{
                filterList.push(
                  {
                    "fName": element.field_name,
                    "fValue": this.commonFunctionService.dateFormat(formValue.value[element.field_name].start),
                    "operator": "gte"
                  }
                ) 
              }          
            }
            if(formValue.value && formValue.value[element.field_name].end != '' && formValue.value[element.field_name].end != null){
              if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                element.api_params_criteria.forEach(cri => {
                  criteria.push(cri)
                });
              }else{
                filterList.push(
                  {
                    "fName": element.field_name,
                    "fValue": this.commonFunctionService.dateFormat(formValue.value[element.field_name].end),
                    "operator": "lte"
                  }
                )
              }
            }
            break;
          default:
            break;
        }
      });
      if(criteria && criteria.length > 0){
        const crList = this.commonFunctionService.getCriteriaList(criteria,formValue.getRawValue());
        if(crList && crList.length > 0){
          crList.forEach(element => {
            filterList.push(element);
          });
        }
      }
    }
    return filterList;
  }
  isArray(obj : any ) {
    return Array.isArray(obj)
  }

  // getCriteriaList(criteria,object){
  //   const crList = [];    
  //   criteria.forEach(element => {
  //     const criteria = element.split(";");
  //     const fValue = criteria[2]
  //     let fvalue ='';
  //     if(criteria[3] && criteria[3] == 'STATIC'){
  //       fvalue = fValue;
  //     }else{
  //       fvalue = this.getObjectValue(fValue, object)
  //     }
  //     const list = {
  //       "fName": criteria[0],
  //       "fValue": fvalue,
  //       "operator": criteria[1]
  //     }
  //     crList.push(list);
  //   });
  //   return crList;
  // }

  getObjectValue(field, object) {
    let result = object;
    if (field && field != null && field != '' && field != " ") {

      let list = field.split(".")
      for (let index = 0; index < list.length; index++) {
        result = result[list[index]]
        if (result === null || result === undefined) {
          return result;
        }
      }
      return result;
    }
    return "";
  }


  getddnDisplayVal(val) {
    if (val && val.name) {
      return val.name;
    } else if (val && val.label) {
      return val.label;
    } else if (val && val.field_name) {
      return val.field_name;
    } else {
      return val;
    }
  }

  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

}
