import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { AuthService, EnvService, StorageService } from '@core/ionic-core';
import { Platform, ModalController , PopoverController, IonInfiniteScroll} from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DataService } from '../../api/data.service';
import { Modalh4Component } from '../../component/modalh4/modalh4.component';
import { NavigationEnd, NavigationExtras, Router, RouterEvent } from '@angular/router';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { filter } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { IonLoaderService } from 'src/app/service/ion-loader.service';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})

export class QuotationPage implements OnInit {
  //sampledata
  quotationdata = [
    {'quotation': 'Tirupati Life Science', 'location': 'Panchkula/Haryana', 'qtnno': 'QTN No : QL/2021-2022/11/KS/Quote-00009/R0', 'quotate': 'NOV 27', 'price': '7000', 'simpleno': 'No. Of Sample - 2'}]
  
  web_site_name: string = '';
  list: any = [];
  carddata: any;


  // get local serv data
  // apiurl: "https://uatserverqualiteklab.e-labs.ai/rest/";
  serverdata: any;
  columndata: any;
  columnList: any = [];
  cardType = "summary"; //default cardtype
  filterTerm: string;
  cardData: any;
  menuItem: any;
  cardDataMasterSubscription: any;
  collectionname: any = 'request_quote';
  cardtitle: any;

  childColumns : any;
  childData : any = {};
  childColumn: any = {};
  childDataTitle: any;
  childCardType: string = "";
  childTabMenu: any=[];
  name: any ='';
  
  // searchbar variables
  inValue = 0;
  myInput: string;

  // filter card
  filterForm: FormGroup;
  createFormgroup: boolean = true;
  openFilter: boolean = false;
  filterCount: 0;

  //common function
  cardList: any = [];
  selectedIndex= -1;
  tabMenu: any = [];
  cardDataSubscription:any;
  cardListSubscription:any;
  parentcardId: any;
  parentcard: any;

  // child contactdetails
  result: any;
  childLastName: any;
  designation: any;
  profileText: string;
  personName: string;
  mobile: number;
  countryCode: string = "91";
  whatsappNumber: string;
  whatsappUrl: string;
  whatsappMsg: string;
  commonMsg: string;

  // loadmore variables
  private toplimit: number = 15;

  slideOptions = {
    slidesPerView:1.2,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  };  


  constructor(
    private platform: Platform,
    private envService: EnvService,
    private http: HttpClient,
    private storageService: StorageService,
    private dataService: DataService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
    private datePipe: DatePipe,
    private dataShareService:DataShareServiceService,
    private CurrencyPipe: CurrencyPipe,
    private formBuilder: FormBuilder,
    private callNumber: CallNumber,
    private ionLoaderService: IonLoaderService
  ) 
  {
    // below code is for slider and title name
    this.initializeApp();
    this.list = [
      'https://www.sanjivanichemist.com/assets/img/service1.jpg',
      'https://www.sanjivanichemist.com/assets/img/service1.jpg',
      'https://www.sanjivanichemist.com/assets/img/service1.jpg',
    ];
    this.web_site_name = this.envService.getWebSiteName();

    // card = this.dataShareService.getCardMasterData();
    // this.cardType = this.cardDataMasterSubscription.card_type.name;
    // this.columnList = this.cardDataMasterSubscription.fields;
    // this.collectionname = this.cardDataMasterSubscription.collection_name;
    // this.getcardData(this.collectionname);
    this.cardDataSubscription = this.dataShareService.setCardmasterData.subscribe( data=>{

    });
    this.cardListSubscription = this.dataShareService.cardList.subscribe(data =>{
      let card = data[0];
      this.setCardDetails(card);
    })
    
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }


  ngOnInit() {
    this.carddata = '';
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.getCardDataByCollection();
    });  

  }

  private getCardDataByCollection() {
    const cardData = this.dataShareService.getCardMasterData();
    this.setCardDetails(cardData);
    
  }

  setCardDetails(card) {
    this.cardListSubscription = this.dataShareService.gettCardList();
    this.cardListSubscription.forEach(element => {
      if(element._id == this.dataShareService.parentcardid){
        this.parentcard = element;
      }
    });
    this.tabMenu = this.parentcard.tab_menu;

    this.cardtitle = card.name;
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
            this.createFormControl(forControl, element, '', "text");
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

  ionViewDidEnter() {
   // this.loaderService.hideLoader();
 }
  
  // filterdata
  filterCard(){  
    this.openFilter = false;
    this.getcardData(this.collectionname);
  }
  closefilterCard(){
    this.openFilter = false;
  }
  clearfilterCard(){
    this.filterForm.reset();
    this.getcardData(this.collectionname);
  }

  isArray(obj : any ) {
    return Array.isArray(obj)
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
                    "fValue": this.dateFormat(formValue.value[element.field_name]),
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
                    "fValue": this.dateFormat(formValue.value[element.field_name].start),
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
                    "fValue": this.dateFormat(formValue.value[element.field_name].end),
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
        const crList = this.getCriteriaList(criteria,formValue.getRawValue());
        if(crList && crList.length > 0){
          crList.forEach(element => {
            filterList.push(element);
          });
        }
      }
    }
    return filterList;
  }

  dateFormat(value) {
    return this.datePipe.transform(value, 'dd/MM/yyyy')
  }

  getCriteriaList(criteria,object){
    const crList = [];    
    criteria.forEach(element => {
      const criteria = element.split(";");
      const fValue = criteria[2]
      let fvalue ='';
      if(criteria[3] && criteria[3] == 'STATIC'){
        fvalue = fValue;
      }else{
        fvalue = this.getObjectValue(fValue, object)
      }
      const list = {
        "fName": criteria[0],
        "fValue": fvalue,
        "operator": criteria[1]
      }
      crList.push(list);
    });
    return crList;
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

  createFormControl(forControl, field, object, type) {
    let disabled = field.is_disabled ? true : ((field.disable_if != undefined && field.disable_if != '') ? true : false);
    switch (type) {
      case "list":
        forControl[field.field_name] = this.formBuilder.array(object, this.validator(field))
        break;
      case "text":
        switch (field.type) {
          case "gst_number":
            forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field))
            break;    
          default:
            forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
            break;
        }
        break;
      case "group":
        forControl[field.field_name] = this.formBuilder.group(object)
        break;
      default:
        break;
    }
  }

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
  
  testload: any = [];
  getcardData(collection_name:any){
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        // this.ionLoaderService.showLoader(this.cardtitle);
        //this.loaderService.showLoader('null');
        let obj = {
          crList: this.getfilterCrlist(this.columnList, this.filterForm),
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
            this.carddata = respData['data'];
            this.filterCount = respData['data_size'];
            // this.ionLoaderService.hideLoader();
          },
          (err: HttpErrorResponse) => {
            this.ionLoaderService.hideLoader();
            console.log(err.error);
          }
        )
      }
    })
    
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

  search(myInput) {

    this.getcardData(this.collectionname);

  }

  onClose(myInput) {
    this.getcardData(this.collectionname);
  }

  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.getcardData(this.collectionname);
    }
  }

  //card action Button 1st method, show data on modal
  async buttonAction(column, data){
    const cardmaster=this.dataShareService.gettCardList();
    const childColumn = this.childColumn;
    if(cardmaster && cardmaster.length > 0 && childColumn && childColumn._id){
      cardmaster.forEach(element => {
        if(element._id == childColumn._id ){
          this.childColumns = element.fields;
          this.childCardType = element.card_type;
        }
      });
    }
    this.childData = data;
    // for child header
    this.childDataTitle = data.company_name;
    
    //modalShowfunction
    const modal = await this.modalController.create({
      component: Modalh4Component,
      componentProps: {
        "childData": this.childData,
        "childColumns": this.childColumns,
        "childDataTitle": this.childDataTitle,
        "childCardType" : this.childCardType
       },
      swipeToClose: true
    });
    modal.componentProps.modal = modal;
    return await modal.present();

  }

  goBack(){
    this.carddata = '';
  }

  // go to new page 2nd method
  async detailCardButton(column, data){
    const cardmaster=this.dataShareService.gettCardList();
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
    this.dataShareService.setchildDataList(newobj);
    // this.router.navigate(['crm/quotation-details']);
    if(this.cardType == 'contact'){
      // this.getChildData();
      this.router.navigate(['crm/contact-details']);
    }else{
      this.router.navigate(['crm/quotation-details']);
    }
  }

  getChildData() {
    this.childData = this.dataShareService.getchildCardData();
    this.tabMenu = this.childData.childtabmenu;
    this.childDataTitle = this.childData.childdata.first_name;
    this.cardType = this.childData.childcardtype.name;
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
  
  comingSoon() {
    this.storageService.presentToast('Comming Soon...');
  }

  call(card:any,Index:number) {
    let callingNumber:any;
    if(card.mobile !=''){
      callingNumber = card.mobile;
    }else {
      callingNumber = card.billing_mobile;
    }
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!' + res))
      .catch(err => console.log('Error launching dialer ' + err));
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

  loadData(event) {
    // setTimeout(() => {
    //   // this.toplimit += 10;
    //   // this.carddata = respData['data'].slice(0, this.toplimit);
    //   // console.log('Done');
    //   for (let i = 0; i < 25; i++) { 
    //     this.carddata.push("Item number " + this.carddata.length);
    //   }
    //   event.target.complete();
      
    //   if (this.carddata.length == 50) {
    //     event.target.disabled = true;
    //   }
    // }, 500);
  }

  //Top menu for quotation page getting collection name
  commonFunction(data:any) {
    this.storageService.getObject('authData').then(async (val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        let crList = [];
        // if(data && this.isArray(data) &&  data.length >= 1){
        //   let idList = '';
        //   data.forEach((id,i) => {
        //     if((data.length-1) == i){
        //       idList = idList + id;
        //     }else{
        //       idList = idList + id +":";
        //     }
        //   });
        //   const criteria = {
        //     "fName": "_id",
        //     "fValue": idList,
        //     "operator": "in"
        //   }
        //   crList.push(criteria);
        // }else{
        //   const criteria = {
        //     "fName": "_id",
        //     "fValue": data,
        //     "operator": "eq"
        //   }
        //   crList.push(criteria);
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

  tabmenuClick(data:any , index:number){
    this.commonFunction(data);
  }
  
  showCardTemplate(card:any, index:number){
    this.selectedIndex = index;
    //this.router.navigate(['crm/quotation']);
    this.dataShareService.setcardData(card);
  }

}
