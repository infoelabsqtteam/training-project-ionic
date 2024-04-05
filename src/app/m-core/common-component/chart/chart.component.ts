import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartFilterComponent } from '../../modal/chart-filter/chart-filter.component';
import { ApiCallService, ApiService, CommonFunctionService, DataShareService } from '@core/web-core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit{

  @Input() isShow: string;
  public chartType:any = {};
  public chartDatasets:any = {};
  public chartLabels:any = {};
  public chartColors:any = {};
  public chartOptions:any = {};
  public chartLegend:any = {};
  public chartTitle:any = {};

  checkGetDashletData:boolean=true;
  dashletData:any={};
  pageNumber:any=1;
  itemNumOfGrid: any = 12;
  elements:any=[];  
  staticData: any = {};
  copyStaticData:any={};
  noOfItems:any = [6,9,12,15,18,21,24];
  gridDataSubscription:any;
  staticDataSubscription:any;
  dashletDataSubscription:any;

  filterValue:any = [];
  filteredDashboardData:any = [];
  filterdata = '';
  
  total: number;
  showfilter:boolean = false;
  clickFilter:boolean = false;
  headertitle:any;

  constructor(
    private apiService:ApiService,
    private dataShareService:DataShareService,
    private modalController: ModalController,
    private apiCallService: ApiCallService
  ) {
    this.headertitle = "Charts";
    this.gridDataSubscription = this.dataShareService.dashletMaster.subscribe(data =>{
      if(data && data !=''){
        this.setGridData(data);
      }
    })
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
    })
    this.dashletDataSubscription = this.dataShareService.dashletData.subscribe(data =>{
      if(data && data !=''){
        this.setDashLetData(data);
      }
    }) 
   }

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){}
  ionViewDidEnter(){}
  // Ionic LifeCycle Function Handling End--------------------
  
  // Angular LifeCycle Function Handling Start--------------------
  ngAfterViewInit(){ }

  ngOnInit() {
    this.getDataForGrid();
    this.getChartList();    
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.isShow){
      this.getPage(1)
      this.getChartList();
      this.checkGetDashletData = true;
    }
  }
  ngOnDestroy(){
    this.checkGetDashletData = false;
    if(this.gridDataSubscription){
      this.gridDataSubscription.unsubscribe();
    }
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
    if(this.dashletDataSubscription){
      this.dashletDataSubscription.unsubscribe();
    }
  }
  // Angular LifeCycle Function Handling End--------------------

  // Subscribed Variable Functions Handling Start-------------
  setGridData(gridData?:any){
    if (gridData.data && gridData.data.length > 0) {
      this.elements = JSON.parse(JSON.stringify(gridData.data));
      this.total = gridData.data_size;
      this.filteredDashboardData = JSON.parse(JSON.stringify(this.elements));
      if(this.checkGetDashletData && this.elements.length > 0){
        this.checkGetDashletData = false;
        if(this.elements.length > 0){
          this.getDashletData(this.elements);
        }            
      }          
    } else {
      this.elements = [];
    }
  }

  setStaticData(staticData?:any){
    if (staticData) {
      this.staticData = staticData;
      Object.keys(this.staticData).forEach(key => {
        if(this.staticData[key]){         
          this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
        }
      }) 
    }
  }
  
  setDashLetData(dashletData:any){
    const dashlet = Object.keys(dashletData)
    if (dashletData && dashlet.length > 0) {
      this.dashletData = dashletData;
      Object.keys(this.dashletData).forEach(key => {                    
        this.chartDatasets[key] = JSON.parse(JSON.stringify(this.dashletData[key]['dataSets']));  
        this.chartLabels[key] = JSON.parse(JSON.stringify(this.dashletData[key]['label']));
        this.chartType[key]=JSON.parse(JSON.stringify(this.dashletData[key]['type']));
        this.chartColors[key]=JSON.parse(JSON.stringify(this.dashletData[key]['colors']));
        this.chartLegend[key]=JSON.parse(JSON.stringify(this.dashletData[key]['legend']));
        this.chartOptions[key]=JSON.parse(JSON.stringify(this.dashletData[key]['options']));
        if(this.dashletData[key]['title']){
          this.chartTitle[key]=JSON.parse(JSON.stringify(this.dashletData[key]['title']));
        }        
      });
    }
  }
  // Subscribed Variable Functions Handling End-------------

  // Click FUnctions Handling Start---------
  filterchart() {    
    if(this.filterValue && this.filterValue.length > 0 && this.filterValue.length <= this.itemNumOfGrid) {
      this.clickFilter = true;
      let value = "";
      this.filterValue.forEach((element,i) => {
        if((this.filterValue.length - 1) == i){
          value = value + element;
        }else{
          value = value + element + ":";
        }
      });
      let cr = "_id;in;"+value+";STATIC";
      this.getPage(1,[cr]);
    }    
  }
  resetFilter(){
    this.filterValue = [];
    if(this.clickFilter){
      this.clickFilter = false;
      this.checkFilter();
    }
  }
  async chartmodel(data:any, filter:any, index:number){
    this.showfilter = true;
    const modal = await this.modalController.create({
      component: ChartFilterComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: { 
        'dashboardItem' : data,
        'dashletData' : this.dashletData,
        'filter':filter,
        'selectedIndex': index,
        'staticData': this.staticData
      },
      showBackdrop:true,
      backdropDismiss:false,
    });
    modal.componentProps.modal = modal;
    
    return await modal.present();
  }
  // Click FUnctions Handling End---------

  // Dependency Functions Handling Start ------------------
  getDashletData(elements:any){
    if(elements && elements.length > 0){
      let payloads = [];
      //let value = this.dashboardFilter.getRawValue();
      elements.forEach(element => {
        const fields = element.fields;        
        //const filterData = this.getSingleCardFilterValue(element,value);
        let crList = [];
        // if(fields && fields.length > 0){
        //   crList = this.restService.getfilterCrlist(fields,filterData);
        // }        
        let object = {}
        // if(filterData){
        //   object = filterData;
        // }
        const data = {
          "data": object,
          "crList":crList
        }
        const payload={
          "_id" : element._id,
          "data" : data
        }
        payloads.push(payload);
      });
      if(payloads && payloads.length > 0 && payloads.length == elements.length){
        this.apiService.GetDashletData(payloads);
      }      
    }
  }
  getDataForGrid(Criteria?:any){    
    const data = this.apiCallService.getPaylodWithCriteria('dashlet_master','',Criteria,'');
    data['pageNo'] = this.pageNumber - 1;
    data['pageSize'] = this.itemNumOfGrid; 
    const getFilterData = {
      data: data,
      path: null
    }
    this.apiService.getDashletMster(getFilterData);
  }
  getPage(page: number,criteria?:any) {
    let Criteria:any = [];
    if(criteria && criteria.length > 0){
      Criteria = criteria;
    }
    this.pageNumber = page;
    this.getDataForGrid(Criteria);
    this.checkGetDashletData = true;
  }
  getChartList(){
    const payload = this.apiCallService.getPaylodWithCriteria('dashlet_master','chart_list',[],'');
    this.apiService.getStatiData([payload]);
  }
  // Dependency Functions Handling End ------------------

  // Ionic Event Functions Handling Start ------------------
  checkFilter(){
    if(this.filterValue && this.filterValue.length == 0){
      this.getPage(1)
    }
  }
  selectNoOfItem(){
    this.getPage(1);
  }
  // Ionic Event Functions Handling End ------------------

  // NOt in used Functions -----------
  
  // setChartData(chartData:any){
  //   if (chartData) {
  //      console.log(chartData);
  //   }
  // }  
  
  // onKey(value:any){
  //   this.copyStaticData['chart_list'] = this.search(value)
  // }
  // search(value: string) { 
  //   let filter = value.toLowerCase();
  //   return this.staticData['chart_list'].filter(option => option.name.toLowerCase().startsWith(filter));
  // }

  
}
