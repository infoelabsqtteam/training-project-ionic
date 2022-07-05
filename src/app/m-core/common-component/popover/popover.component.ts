import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService, CommonDataShareService, CoreUtilityService, RestService } from '@core/ionic-core';

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

  constructor(
    private coreUtilityService :CoreUtilityService,
    private apiService:ApiService,
    private restService:RestService,
    private commonDataShareService:CommonDataShareService
    ) {

  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if(this.popoverItems && this.popoverItems.length > 0){
      this.tabMenu = this.popoverItems;
    }
  }
  
  selectedItem(item:any){
    this.popoverOutput.emit(item.label);
    // this.tabmenuClick(item);
  }

  tabmenuClick(item:any,index:number){
    if(item && item.name){
      this.popoverOutput.emit(item);
    }
    this.selectedIndex = index;
    this.carddata = [];
    this.createFormgroup = true;
    const tab = this.tabMenu[index];
    const moduleList = this.commonDataShareService.getModuleList();
    const tabIndex = this.coreUtilityService.getIndexInArrayById(moduleList,tab._id,"_id"); 
    const card = moduleList[tabIndex];
    this.card['card'] = card;
    this.card.selectedTabIndex = index;
    this.popoverOutput.emit(this.card);
  } 
  
}
