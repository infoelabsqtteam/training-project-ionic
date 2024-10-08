import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService, CommonAppDataShareService, CommonFunctionService } from '@core/web-core';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  @Input() data:any;
  @Input() popoverItems:any;
  @Input() triggerId:any;
  @Input() card:any;
  @Output() popoverOutput= new EventEmitter();
  

  cardList: any = [];
  selectedIndex= -1;
  public editedRowIndex:number=-1;
  tabMenu: any = [];
  createFormgroup: boolean = true;
  carddata: any;
  addCallingFeature: boolean=false;
  addNewEnabled:boolean=false;
  detailPage:boolean=false;
  callStatus:boolean=false;
  columnList: any = [];
  cardType = "summary"; //default cardtype
  cardDataMasterSubscription: any;
  collectionname: any = 'request_quote';
  filterForm:any = {
    'value' : {}
  }

  constructor( ) { }

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if(this.popoverItems && this.popoverItems.length > 0){
      this.tabMenu = this.popoverItems;
    }
  }
  // Angular LifeCycle Function Handling End--------------------
  
  // Click FUnction Handling Start--------------
  tabmenuClick(item:any,index:number){
    // if(item && item.name){
    //   this.popoverOutput.emit(item);
    // }
    // this.selectedIndex = index;
    // this.carddata = [];
    // this.createFormgroup = true;
    // const tab = this.tabMenu[index];
    // const moduleList = this.commonAppDataShareService.getModuleList();
    // const tabIndex = this.commonFunctionService.getIndexInArrayById(moduleList,tab._id,"_id"); 
    // const card = moduleList[tabIndex];
    this.card['card'] = item.tabCard;
    this.card.selectedTabIndex = index;
    this.popoverOutput.emit(this.card);
  }
  // Click FUnction Handling End--------------

  // Event Emission Starts Here ------------
  selectedItem(item:any){
    this.popoverOutput.emit(item.label);
    // this.tabmenuClick(item);
  }
  // Event Emission END Here ------------

  
  
}
