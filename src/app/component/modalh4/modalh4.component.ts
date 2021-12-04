import { Component, Input, OnInit } from '@angular/core';
import { ModalController , PopoverController} from '@ionic/angular';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { DataShareServiceService } from 'src/app/service/data-share-service.service';
import { EnvService, LoaderService, StorageService } from '@core/ionic-core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-modalh4',
  templateUrl: './modalh4.component.html',
  styleUrls: ['./modalh4.component.scss'],
})
export class Modalh4Component implements OnInit {

  cardType = "detail2";
  cardDataMasterSubscription: any;
  columnList: any = [];
  collectionname: any = '';

  @Input() childColumns:any;
  @Input() childDataTitle:any;
  @Input() childData: any;
  @Input() childCardType: any;
  @Input() modal: any;
  carddata: any;
  

  constructor(
    private modalController: ModalController, 
    private popoverController: PopoverController,
    private datePipe: DatePipe,
    private dataShareService:DataShareServiceService,private envService: EnvService,
    private http: HttpClient,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private currencyPipe: CurrencyPipe
    ) { }

    
  ngOnInit() {
    // console.log(this.childData);
    // console.log(this.childColumns);
    // console.log(this.childCardType);
    if(this.childCardType && this.childCardType.name){
      this.cardType = this.childCardType.name
    }
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  
  getValueForGrid(field, object) {
    let value = '';
    if (field.field_name != undefined && field.field_name != null && field.field_name != '') {
      value = this.getObjectValue(field.field_name, object)
    }
    // if (field.field_label != undefined && field.field_label != null && field.field_label != '') {
    //   value = this.getObjectValue(field.field_label, object)
    // }
    if (!field.type) field.type = "Text";
    switch (field.type.toLowerCase()) {
      case 'datetime': return this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
      case 'date': return this.datePipe.transform(value, 'dd/MM/yyyy');
      case 'time': return this.datePipe.transform(value, 'h:mm a');
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.currencyPipe.transform(value, 'INR');
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

  dismissModal(){
    this.modal.dismiss({'dismissed': true});
  }

  ngOnDestroy() { }

}
